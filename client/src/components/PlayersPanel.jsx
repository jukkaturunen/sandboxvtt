import { useState, useEffect } from 'react';
import EditNameModal from './EditNameModal';
import { updateUserNameInStorage } from '../utils/userStorage';
import '../styles/PlayersPanel.css';

function PlayersPanel({ sandboxId, socket, currentUser }) {
  const [players, setPlayers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Handle players list updates (sent on join, leave, disconnect)
    const handlePlayersList = (playersList) => {
      console.log('Received players list:', playersList);
      setPlayers(playersList);
    };

    // Handle user name changes
    const handleUserNameChanged = ({ userId, newName }) => {
      console.log('User name changed:', userId, newName);
      setPlayers(prevPlayers =>
        prevPlayers.map(player =>
          player.userId === userId ? { ...player, name: newName } : player
        )
      );

      // Update localStorage if it's the current user
      if (currentUser && currentUser.id === userId) {
        updateUserNameInStorage(sandboxId, newName);
      }
    };

    // Register event listeners
    socket.on('players-list', handlePlayersList);
    socket.on('user-name-changed', handleUserNameChanged);

    // Request the current player list
    console.log('Requesting player list...');
    socket.emit('request-players-list');

    // Cleanup
    return () => {
      socket.off('players-list', handlePlayersList);
      socket.off('user-name-changed', handleUserNameChanged);
    };
  }, [socket, sandboxId, currentUser]);

  const handleEditNameSuccess = (updatedUser) => {
    // Update will come through socket event, just close modal
    setShowEditModal(false);
  };

  return (
    <div className="players-panel">
      {showEditModal && currentUser && (
        <EditNameModal
          sandboxId={sandboxId}
          currentUser={currentUser}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditNameSuccess}
        />
      )}

      <div className="players-count">
        {players.length} {players.length === 1 ? 'Player' : 'Players'} Connected
      </div>

      <div className="players-list">
        {players.length === 0 ? (
          <div className="no-players">Waiting for players to join...</div>
        ) : (
          players.map((player) => (
            <div key={player.userId} className="player-item">
              <div className="player-avatar">
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div className="player-info">
                <div className="player-name">
                  {player.name}
                  {currentUser && player.userId === currentUser.id && (
                    <button
                      className="edit-name-btn"
                      onClick={() => setShowEditModal(true)}
                      title="Edit your name"
                    >
                      ✎
                    </button>
                  )}
                </div>
                <div className="player-role">{player.role === 'gm' ? 'Game Master' : 'Player'}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PlayersPanel;
