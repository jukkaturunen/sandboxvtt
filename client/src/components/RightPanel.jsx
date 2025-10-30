import React, { useState, useEffect } from 'react';
import TokenPanel from './TokenPanel';
import ChatPanel from './ChatPanel';
import PlayersPanel from './PlayersPanel';
import '../styles/RightPanel.css';

function RightPanel({ sandboxId, socket, currentUser, onCreateToken, isPanelCollapsed }) {
  const [activeTab, setActiveTab] = useState('tokens');
  const [players, setPlayers] = useState([]);
  const [chatHasUnread, setChatHasUnread] = useState(false);

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

  // Clear chat unread indicator when switching to chat tab
  useEffect(() => {
    if (activeTab === 'chat') {
      setChatHasUnread(false);
    }
  }, [activeTab]);

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
          className={`tab-button ${activeTab === 'chat' ? 'active' : ''} ${chatHasUnread && activeTab !== 'chat' ? 'has-unread' : ''}`}
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
        <div className={`tab-pane ${activeTab === 'tokens' ? 'active' : 'hidden'}`}>
          <TokenPanel
            currentUser={currentUser}
            onCreateToken={onCreateToken}
          />
        </div>

        <div className={`tab-pane ${activeTab === 'chat' ? 'active' : 'hidden'}`}>
          <ChatPanel
            sandboxId={sandboxId}
            socket={socket}
            currentUser={currentUser}
            players={players}
            isActiveTab={activeTab === 'chat'}
            onUnreadChange={setChatHasUnread}
            isPanelCollapsed={isPanelCollapsed}
          />
        </div>

        <div className={`tab-pane ${activeTab === 'players' ? 'active' : 'hidden'}`}>
          <PlayersPanel
            sandboxId={sandboxId}
            socket={socket}
            currentUser={currentUser}
          />
        </div>
      </div>
    </div>
  );
}

export default RightPanel;
