
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";
import { SmallSpinner } from './SmallSpinner';
import "./AccountPage.css";

const AccountPage = () => {
  const userProfile = useQuery(api.users.getCurrentUser);
  const startups = useQuery(api.startups.getStartupsForUser);
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [isProfileCreated, setIsProfileCreated] = useState(false);

  useEffect(() => {
    if (userProfile === null && !isProfileCreated) {
      createOrUpdateUser();
      setIsProfileCreated(true);
    }
  }, [userProfile, isProfileCreated, createOrUpdateUser]);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name ?? "");
    }
  }, [userProfile]);

  const handleSave = async () => {
    await updateProfile({ name });
    toast.success("Profile updated!");
  };

  const handleVentureClick = (id: string) => {
    navigate(`/venture/${id}`);
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
              onChange={(e) => setName(e.target.value)}
              placeholder={userProfile === undefined ? "Loading..." : "Your Name"}
              disabled={userProfile === undefined}
            />
          </div>
          <button onClick={handleSave} className="save-button" disabled={userProfile === undefined}>
            Save
          </button>
        </div>

        <div className="ventures-section">
          <h2>Your Ventures</h2>
          {startups === undefined ? (
            <SmallSpinner />
          ) : startups.length > 0 ? (
            <ul className="ventures-list">
              {startups.map((startup) => (
                <li key={startup._id} className="venture-item" onClick={() => handleVentureClick(startup._id)}>
                  <span className="venture-name">{startup.name}</span>
                  <span className="venture-date">Created: {new Date(startup.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>You haven't created any ventures yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};


export default AccountPage;
