import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUserForSandbox } from '../utils/userStorage';
import '../styles/FrontPage.css';

function FrontPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [notification, setNotification] = useState(null);
  const [gmName, setGmName] = useState('');
  const [gmPassword, setGmPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreateSandbox = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    // Validate GM name
    if (!gmName || gmName.length < 2 || gmName.length > 30) {
      setError('GM name must be between 2 and 30 characters');
      setIsCreating(false);
      return;
    }

    // Validate password if provided
    if (gmPassword && gmPassword.length < 4) {
      setError('Password must be at least 4 characters');
      setIsCreating(false);
      return;
    }

    try {
      const response = await fetch('/api/sandbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gm_name: gmName,
          gm_password: gmPassword || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create sandbox');
      }

      const data = await response.json();

      // Save GM user to localStorage
      saveUserForSandbox(data.id, data.gmUser);

      // Redirect to sandbox page with GM role
      navigate(`/sandbox/${data.id}?role=gm`);
    } catch (error) {
      console.error('Error creating sandbox:', error);
      setError(error.message);
      showNotification('Failed to create sandbox. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="front-page">
      <div className="front-page-container">
        {/* Notification Toast */}
        {notification && (
          <div className="notification-toast">
            {notification}
          </div>
        )}

        <h1 className="title">SandboxVTT</h1>
        <p className="subtitle">A minimal Virtual Table Top for quick RPG sessions</p>

        <form onSubmit={handleCreateSandbox} className="create-form">
          {error && <div className="create-error">{error}</div>}

          <div className="form-group">
            <input
              type="text"
              value={gmName}
              onChange={(e) => setGmName(e.target.value)}
              placeholder="Your GM name"
              minLength={2}
              maxLength={30}
              required
            />
          </div>

          <div className="password-toggle">
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPasswordField(!showPasswordField)}
            >
              {showPasswordField ? '− Hide' : '+ Add'} Password (Optional)
            </button>
          </div>

          {showPasswordField && (
            <div className="form-group">
              <input
                type="password"
                value={gmPassword}
                onChange={(e) => setGmPassword(e.target.value)}
                placeholder="GM password (optional)"
                minLength={4}
              />
              <small>Set a password to protect your GM identity</small>
            </div>
          )}

          <button
            type="submit"
            className="create-button"
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create New Sandbox'}
          </button>
        </form>
        
        <div className="features">
          <div className="feature">
            <h3>No Login Required</h3>
            <p>Just create and share the link</p>
          </div>
          <div className="feature">
            <h3>Real-time Collaboration</h3>
            <p>All players see updates instantly</p>
          </div>
          <div className="feature">
            <h3>Simple & Focused</h3>
            <p>Maps, tokens, and chat - nothing more</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FrontPage;
