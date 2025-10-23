import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FrontPage.css';

function FrontPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const handleCreateSandbox = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/sandbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create sandbox');
      }

      const data = await response.json();

      // Redirect to sandbox page with GM role
      navigate(`/sandbox/${data.id}?role=gm`);
    } catch (error) {
      console.error('Error creating sandbox:', error);
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

        <button
          className="create-button"
          onClick={handleCreateSandbox}
          disabled={isCreating}
        >
          {isCreating ? 'Creating...' : 'Create New Sandbox'}
        </button>
        
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
