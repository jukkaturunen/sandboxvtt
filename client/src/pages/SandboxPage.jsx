import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import UserAuthModal from '../components/UserAuthModal';
import GMPanel from '../components/GMPanel';
import ImageCanvas from '../components/ImageCanvas';
import RightPanel from '../components/RightPanel';
import useSocket from '../hooks/useSocket';
import { getUserForSandbox, saveUserForSandbox } from '../utils/userStorage';
import '../styles/SandboxPage.css';

function SandboxPage() {
  const { id } = useParams();

  const [sandboxData, setSandboxData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [pendingToken, setPendingToken] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // GM-only preview
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  const { socket } = useSocket(id, currentUser?.id, currentUser?.name, currentUser?.role);

  // Check localStorage for existing user
  useEffect(() => {
    const savedUser = getUserForSandbox(id);

    if (savedUser) {
      // Auto-login with saved user (no password prompt on reload)
      setCurrentUser(savedUser);
    } else {
      // No saved user, show auth modal
      setShowAuthModal(true);
    }
  }, [id]);

  // Fetch sandbox data
  useEffect(() => {
    fetch(`/api/sandbox/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Sandbox not found');
        return res.json();
      })
      .then(data => {
        setSandboxData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading sandbox:', error);
        setLoading(false);
      });
  }, [id]);

  const handleUserAuthSuccess = (userData) => {
    setCurrentUser(userData);
    setShowAuthModal(false);
    setAuthError(null);
    // Save to localStorage
    saveUserForSandbox(id, userData);
  };

  const handleUserAuthError = (error) => {
    setAuthError(error.message);
  };

  if (loading) {
    return (
      <div className="sandbox-page loading">
        <div className="loading-spinner">Loading sandbox...</div>
      </div>
    );
  }

  if (!sandboxData) {
    return (
      <div className="sandbox-page error">
        <h1>Sandbox Not Found</h1>
        <p>The sandbox you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="sandbox-page">
      {showAuthModal && (
        <UserAuthModal
          sandboxId={id}
          onSuccess={handleUserAuthSuccess}
          onError={handleUserAuthError}
        />
      )}

      <div className="sandbox-layout">
        {/* Main Canvas Area - Full width background */}
        <div className="canvas-area">
          <div className="canvas-header">
            {/* Left collapse arrow - only show for GM */}
            {currentUser?.role === 'gm' && (
              <button
                className={`collapse-arrow left ${leftPanelCollapsed ? 'collapsed' : ''}`}
                onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                title={leftPanelCollapsed ? "Show GM Panel" : "Hide GM Panel"}
              />
            )}

            <div className="header-spacer"></div>

            {/* Header Container - Right side controls */}
            <div className={`header-container ${rightPanelCollapsed ? 'collapsed' : ''}`}>
              {/* Right collapse arrow */}
              <button
                className="collapse-arrow right"
                onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                title={rightPanelCollapsed ? "Show Right Panel" : "Hide Right Panel"}
              />
            </div>
          </div>
          <div className="canvas-container">
            <ImageCanvas
              sandboxId={id}
              socket={socket}
              pendingToken={pendingToken}
              onTokenPlaced={() => setPendingToken(null)}
              gmPreviewImage={currentUser?.role === 'gm' ? previewImage : null}
              rightPanelCollapsed={rightPanelCollapsed}
            />
          </div>
        </div>

        {/* GM Panel - Floating on left (only for GM) */}
        {currentUser?.role === 'gm' && (
          <div className={`gm-panel-container ${leftPanelCollapsed ? 'collapsed' : ''}`}>
            <GMPanel
              sandboxId={id}
              socket={socket}
              onPreviewImage={(image) => setPreviewImage(image)}
              previewImage={previewImage}
            />
          </div>
        )}

        {/* Right Panel - Floating on right */}
        <div className={`right-panel-container ${rightPanelCollapsed ? 'collapsed' : ''}`}>
          <RightPanel
            sandboxId={id}
            socket={socket}
            currentUser={currentUser}
            onCreateToken={(token) => setPendingToken(token)}
            isPanelCollapsed={rightPanelCollapsed}
          />
        </div>
      </div>
    </div>
  );
}

export default SandboxPage;
