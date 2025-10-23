import { useState, useEffect } from 'react';
import '../styles/PlayersPanel.css';

function PlayersPanel({ socket }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // Handle players list updates (sent on join, leave, disconnect)
    const handlePlayersList = (playersList) => {
      console.log('Received players list:', playersList);
      setPlayers(playersList);
    };

    // Register event listener first
    socket.on('players-list', handlePlayersList);

    // Then request the current player list
    console.log('Requesting player list...');
    socket.emit('request-players-list');

    // Cleanup
    return () => {
      socket.off('players-list', handlePlayersList);
    };
  }, [socket]);

  return (
    <div className="players-panel">
      <div className="players-count">
        {players.length} {players.length === 1 ? 'Player' : 'Players'} Connected
      </div>

      <div className="players-list">
        {players.length === 0 ? (
          <div className="no-players">Waiting for players to join...</div>
        ) : (
          players.map((player) => (
            <div key={player.socketId} className="player-item">
              <div className="player-avatar">
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div className="player-info">
                <div className="player-name">{player.name}</div>
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
