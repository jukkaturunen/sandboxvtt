import React, { useState } from 'react';
import TokenPanel from './TokenPanel';
import ChatPanel from './ChatPanel';
import PlayersPanel from './PlayersPanel';
import '../styles/RightPanel.css';

function RightPanel({ sandboxId, socket, characterName, role, onCreateToken }) {
  const [activeTab, setActiveTab] = useState('tokens');

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
