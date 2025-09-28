
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";
import { SmallSpinner } from './SmallSpinner';
import { ConfirmationModal } from './ConfirmationModal';
import { Id } from "../../convex/_generated/dataModel";
import "./AccountPage.css";

const AccountPage = () => {
  const userProfile = useQuery(api.users.getCurrentUser);
  const startups = useQuery(api.startups.getStartupsForUser);
  const deleteStartupMutation = useMutation(api.startups.deleteStartup);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [startupToDelete, setStartupToDelete] = useState<Id<"startups"> | null>(null);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name ?? "");
    }
  }, [userProfile]);

  const handleVentureClick = (id: string) => {
    navigate(`/venture/${id}`);
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
        success: 'Startup deleted successfully!',
        error: 'Failed to delete startup.',
    });

    closeDeleteModal();
  };

  const closeDeleteModal = () => {
      setIsDeleteModalOpen(false);
      setStartupToDelete(null);
  };

  // Show a full-page message only if login is explicitly required and failed
  if (userProfile === null) {
    return <div className="account-page-container">You must be logged in to view this page.</div>;
  }

  return (
    <div className="account-page-container">
      <div className="account-card">
        <h1>My Account</h1>
        <div className="account-info">
          <p>
            <strong>Email:</strong> {userProfile?.email ?? 'Loading...'}
          </p>
          <div className="form-group">
            <label htmlFor="name">
              <strong>Name:</strong>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              placeholder={userProfile === undefined ? "Loading..." : "Your Name"}
              disabled={userProfile === undefined}
              readOnly
            />
          </div>
        </div>

        <div className="ventures-section">
          <h2>Your Ventures</h2>
          {startups === undefined ? (
            <SmallSpinner />
          ) : startups.length > 0 ? (
            <ul className="ventures-list">
              {startups.map((startup) => (
                <li key={startup._id} className="venture-item">
                  <div className="venture-item-content" onClick={() => handleVentureClick(startup._id)}>
                    <span className="venture-name">{startup.name}</span>
                    <span className="venture-date">Created: {new Date(startup.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button
                      onClick={(e) => {
                          e.stopPropagation();
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
            <p>You haven't created any ventures yet.</p>
          )}
        </div>
      </div>
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


export default AccountPage;
