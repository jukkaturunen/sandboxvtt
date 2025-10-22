import React, { useState } from 'react';
import '../styles/CharacterNameModal.css';

function CharacterNameModal({ onSubmit }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Name is required');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (trimmedName.length > 30) {
      setError('Name must be 30 characters or less');
      return;
    }

    onSubmit(trimmedName);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="modal-overlay" role="dialog" aria-labelledby="modal-title" aria-describedby="modal-description">
      <div className="modal-content">
        <h2 id="modal-title">Enter Your Character Name</h2>
        <p id="modal-description">This name will be used to identify your tokens and chat messages.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="Character name..."
            maxLength={30}
            autoFocus
            className="name-input"
            aria-label="Character name"
            aria-invalid={!!error}
            aria-describedby={error ? "name-error" : undefined}
          />
          {error && <div id="name-error" className="error-message" role="alert">{error}</div>}
          <button type="submit" disabled={!name.trim()} className="submit-button">
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
}

export default CharacterNameModal;
