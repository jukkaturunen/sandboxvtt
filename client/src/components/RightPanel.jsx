import React, { useState, useEffect } from 'react';
import TokenPanel from './TokenPanel';
import ChatPanel from './ChatPanel';
import PlayersPanel from './PlayersPanel';
import '../styles/RightPanel.css';

function RightPanel({ sandboxId, socket, characterName, role, onCreateToken }) {
  const [activeTab, setActiveTab] = useState('tokens');
  const [players, setPlayers] = useState([]);

  // Listen for player list updates from socket
  useEffect(() => {
    if (!socket) return;

    const handlePlayersList = (playersList) => {
      setPlayers(playersList);
    };

    socket.on('players-list', handlePlayersList);
    socket.emit('request-players-list');

    return () => {
      socket.off('players-list', handlePlayersList);
    };
  }, [socket]);

  return (
    <div className="right-panel">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'tokens' ? 'active' : ''}`}
          onClick={() => setActiveTab('tokens')}
        >
          Tokens
        </button>
        <button
          className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button
          className={`tab-button ${activeTab === 'players' ? 'active' : ''}`}
          onClick={() => setActiveTab('players')}
        >
          Players
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'tokens' && (
          <div className="tab-pane">
            <TokenPanel onCreateToken={onCreateToken} />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="tab-pane">
            <ChatPanel
              sandboxId={sandboxId}
              socket={socket}
              characterName={characterName}
              role={role}
              players={players}
            />
          </div>
        )}

        {activeTab === 'players' && (
          <div className="tab-pane">
            <PlayersPanel socket={socket} />
          </div>
        )}
      </div>
    </div>
  );
}

export default RightPanel;
