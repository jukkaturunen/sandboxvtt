import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import CharacterNameModal from '../components/CharacterNameModal';
import GMPanel from '../components/GMPanel';
import ImageCanvas from '../components/ImageCanvas';
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

  const { socket, isConnected } = useSocket(id);

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

      <div className="sandbox-layout">
        {/* GM Panel - only visible to GM */}
        {role === 'gm' && (
          <GMPanel sandboxId={id} socket={socket} />
        )}

        {/* Main Canvas Area */}
        <div className="canvas-area">
          <div className="canvas-header">
            <h2>SandboxVTT</h2>
            <div className="connection-status">
              <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '● Connected' : '○ Disconnected'}
              </span>
              <span className="role-badge">{role === 'gm' ? 'GM' : characterName}</span>
            </div>
          </div>
          <div className="canvas-container">
            <ImageCanvas sandboxId={id} socket={socket} />
          </div>
        </div>

        {/* Right Panel - Tokens and Chat */}
        <div className="right-panel">
          <div className="token-panel">
            <h3>Tokens</h3>
            <p>Token controls coming in Phase 7</p>
          </div>
          <div className="chat-panel">
            <h3>Chat</h3>
            <p>Chat coming in Phase 8</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SandboxPage;
