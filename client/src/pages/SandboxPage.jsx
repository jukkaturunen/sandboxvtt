import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import CharacterNameModal from '../components/CharacterNameModal';
import GMPanel from '../components/GMPanel';
import ImageCanvas from '../components/ImageCanvas';
import RightPanel from '../components/RightPanel';
import useSocket from '../hooks/useSocket';
import '../styles/SandboxPage.css';

function SandboxPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'player';

  const [sandboxData, setSandboxData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [characterName, setCharacterName] = useState(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingToken, setPendingToken] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // GM-only preview
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  const { socket } = useSocket(id, characterName, role);

  // Check localStorage for existing character name
  useEffect(() => {
    const storageKey = `sandbox-${id}-character`;
    const stored = localStorage.getItem(storageKey);

    if (role === 'player') {
      if (stored) {
        setCharacterName(stored);
      } else {
        setShowNameModal(true);
      }
    } else {
      // GM doesn't need a character name
      setCharacterName('Game Master');
    }
  }, [id, role]);

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

  const handleCharacterNameSubmit = (name) => {
    setCharacterName(name);
    setShowNameModal(false);
    // Save to localStorage
    localStorage.setItem(`sandbox-${id}-character`, name);
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
      {showNameModal && (
        <CharacterNameModal onSubmit={handleCharacterNameSubmit} />
      )}

      <div className={`sandbox-layout ${leftPanelCollapsed ? 'left-collapsed' : ''} ${rightPanelCollapsed ? 'right-collapsed' : ''}`}>
        {/* GM Panel - only visible to GM */}
        {role === 'gm' && !leftPanelCollapsed && (
          <GMPanel
            sandboxId={id}
            socket={socket}
            onPreviewImage={(image) => setPreviewImage(image)}
            previewImage={previewImage}
          />
        )}

        {/* Main Canvas Area */}
        <div className="canvas-area">
          <div className="canvas-header">
            {/* Left collapse arrow - only show for GM */}
            {role === 'gm' && (
              <button
                className={`collapse-arrow left ${leftPanelCollapsed ? 'collapsed' : ''}`}
                onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                title={leftPanelCollapsed ? "Show GM Panel" : "Hide GM Panel"}
              />
            )}

            <div className="header-spacer"></div>

            {/* Right collapse arrow */}
            <button
              className={`collapse-arrow right ${rightPanelCollapsed ? 'collapsed' : ''}`}
              onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
              title={rightPanelCollapsed ? "Show Right Panel" : "Hide Right Panel"}
            />
          </div>
          <div className="canvas-container">
            <ImageCanvas
              sandboxId={id}
              socket={socket}
              pendingToken={pendingToken}
              onTokenPlaced={() => setPendingToken(null)}
              gmPreviewImage={role === 'gm' ? previewImage : null}
            />
          </div>
        </div>

        {/* Right Panel - Tabbed interface for Tokens, Chat, and Players */}
        {!rightPanelCollapsed && (
          <RightPanel
            sandboxId={id}
            socket={socket}
            characterName={characterName}
            role={role}
            onCreateToken={(token) => setPendingToken(token)}
          />
        )}
      </div>
    </div>
  );
}

export default SandboxPage;
