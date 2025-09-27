import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LoadingIndicator } from './LoadingIndicator';
import { authClient } from '../../lib/auth-client';
import { LoginModal } from './LoginModal';
import { ConfirmationModal } from './ConfirmationModal'; // Import the new modal
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { IdeaInputForm } from './IdeaInputForm';
import { SkeletonLoader } from './SkeletonLoader';
import './BlueprintBuilder.css';

export const BlueprintBuilder: React.FC = () => {
    const [idea, setIdea] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
    const [showHistory, setShowHistory] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [startupToDelete, setStartupToDelete] = useState<Id<"startups"> | null>(null);

    const { data: session, isPending } = authClient.useSession();
    const navigate = useNavigate();

    const startups = useQuery(api.startups.getStartupsForUser);
    const createStartup = useMutation(api.startups.createStartup);
    const deleteStartupMutation = useMutation(api.startups.deleteStartup);

    const handleGenerate = useCallback(async (submittedIdea: string) => {
        if (!session) {
            setIsLoginModalOpen(true);
            return;
        }
        if (!submittedIdea || isLoading) {
            return;
        }
        setIdea(submittedIdea);
        setIsLoading(true);
        setError(null);

        try {
            const startupName = submittedIdea.length > 50 ? submittedIdea.substring(0, 47) + "..." : submittedIdea;
            const newStartupId = await createStartup({
                name: startupName,
                idea: submittedIdea,
            });
            navigate(`/venture/${newStartupId}`);
        } catch (err: any) {
            console.error("Error caught during startup creation:", err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [session, isLoading, createStartup, navigate]);

    const handleHistoryItemClick = (startup: any) => {
        navigate(`/venture/${startup._id}`);
    };

    const handleDelete = (startupId: Id<"startups">) => {
        setStartupToDelete(startupId);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!startupToDelete) return;

        const promise = () => deleteStartupMutation({ id: startupToDelete });

        toast.promise(promise, {
            loading: 'Deleting startup...',
            success: () => {
                // No need to reload, reactivity should handle it now
                return 'Startup deleted successfully!';
            },
            error: 'Failed to delete startup.',
        });

        closeDeleteModal();
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setStartupToDelete(null);
    };

    const handleReset = () => {
        setIdea('');
        setError(null);
        setIsLoading(false);
        navigate('/blueprint-builder');
    }

    useEffect(() => {
        if (!isPending && !session) {
            setIsLoginModalOpen(true);
        }
    }, [isPending, session]);

    if (isPending) {
        return <LoadingIndicator idea="Checking session..." />;
    }

    if (isLoading) {
        return <LoadingIndicator idea={idea} />;
    }

    if (error) {
        return (
            <div className="blueprint-builder-container">
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Generation Failed</h2>
                    <p className="text-red-300 mb-6 max-w-2xl mx-auto">{error}</p>
                    <button
                        onClick={handleReset}
                        className="bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors duration-300"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="blueprint-builder-container">
            <div className="text-center p-8">
                <h1 className="text-4xl font-bold mb-4">Create Your Startup Blueprint</h1>
                <p className="text-lg text-slate-400 mb-8">Describe your business idea below to get started.</p>
                <IdeaInputForm onGenerate={handleGenerate} />
            </div>
            {session && (
                <div className="history-section">
                    <button onClick={() => setShowHistory(!showHistory)} className="history-toggle-button">
                        {showHistory ? "Hide" : "Show"} History
                    </button>
                    {showHistory && (
                        <div className="startups-section">
                            <h2>My Startups</h2>
                            {startups === undefined ? (
                                <SkeletonLoader />
                            ) : startups.length > 0 ? (
                                <ul className="startup-list">
                                    {startups.map((startup) => (
                                        <li key={startup._id} className="startup-item">
                                            <div className="startup-item-content" onClick={() => handleHistoryItemClick(startup)}>
                                                <p><strong>Name:</strong> {startup.name}</p>
                                                <p><strong>Created At:</strong> {new Date(startup.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent navigation
                                                    handleDelete(startup._id);
                                                }}
                                                className="delete-button"
                                            >
                                                Delete
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>You haven't created any startups yet.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this startup? This action is permanent and cannot be undone."
            />
        </div>
    );
};