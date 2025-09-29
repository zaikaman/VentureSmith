import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Link } from 'react-router-dom';
import type { Doc, Id } from '../../convex/_generated/dataModel';
import './SmithBuildHistory.css';
import { SmallSpinner } from './SmallSpinner';
import { ConfirmationModal } from './ConfirmationModal';
import { toast } from 'sonner';

export const SmithBuildHistory: React.FC = () => {
  const workspaces = useQuery(api.smithWorkspaces.getWorkspacesForUser);
  const deleteWorkspace = useMutation(api.smithWorkspaces.deleteWorkspace);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Id<"smithWorkspaces"> | null>(null);

  const handleDelete = (event: React.MouseEvent, id: Id<"smithWorkspaces">) => {
    event.preventDefault();
    event.stopPropagation();
    setWorkspaceToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!workspaceToDelete) return;

    const promise = () => deleteWorkspace({ id: workspaceToDelete });

    toast.promise(promise, {
        loading: 'Deleting build history...',
        success: 'Build history deleted!',
        error: 'Failed to delete build history.',
    });

    closeDeleteModal();
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setWorkspaceToDelete(null);
  };

  return (
    <div className="history-section">
      <h2 className="history-title">Your Build History</h2>
      {workspaces === undefined && <div style={{ display: 'flex', justifyContent: 'center' }}><SmallSpinner /></div>}
      {workspaces && workspaces.length === 0 && (
        <p className="history-empty-state">You haven't built anything yet.</p>
      )}
      {workspaces && workspaces.length > 0 && (
        <div className="history-grid">
          {workspaces.map((workspace: Doc<'smithWorkspaces'>) => (
            <Link to={`/smith-build/${workspace._id}`} key={workspace._id} className="history-card">
              <div className="history-card-content">
                <p className="history-card-prompt">{workspace.prompt.substring(0, 100)}...</p>
                <span className="history-card-date">
                  {new Date(workspace._creationTime).toLocaleDateString()}
                </span>
              </div>
              <button className="delete-button" onClick={(e) => handleDelete(e, workspace._id)}>
                Delete
              </button>
            </Link>
          ))}
        </div>
      )}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this build history? This action is permanent and cannot be undone."
      />
    </div>
  );
};
