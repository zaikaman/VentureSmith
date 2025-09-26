
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";
import { toast } from 'sonner';
import "./AccountPage.css";

const AccountPage = () => {
  const userProfile = useQuery(api.users.getCurrentUser);
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const updateProfile = useMutation(api.users.updateProfile);

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

  const isLoading = userProfile === undefined;

  if (isLoading) {
    return <div className="account-page-container">Loading...</div>;
  }

  if (userProfile === null) {
    return <div className="account-page-container">You must be logged in to view this page.</div>;
  }

  const handleSave = async () => {
    await updateProfile({ name });
    toast.success("Profile updated!");
  };

  return (
    <div className="account-page-container">
      <div className="account-card">
        <h1>My Account</h1>
        <div className="account-info">
          <p>
            <strong>Email:</strong> {userProfile.email}
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
            />
          </div>
          <button onClick={handleSave} className="save-button">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
