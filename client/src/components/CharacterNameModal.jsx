import React, { useState } from 'react';
import '../styles/CharacterNameModal.css';

function CharacterNameModal({ onSubmit }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Enter Your Character Name</h2>
        <p>This name will be used to identify your tokens and chat messages.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Character name..."
            maxLength={30}
            autoFocus
            className="name-input"
          />
          <button type="submit" disabled={!name.trim()} className="submit-button">
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
}

export default CharacterNameModal;
