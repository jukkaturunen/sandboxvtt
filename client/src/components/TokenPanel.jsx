import React, { useState, useEffect, useRef } from 'react';
import '../styles/TokenPanel.css';

function TokenPanel({ onCreateToken }) {
  const [tokenName, setTokenName] = useState('');
  const [tokenColor, setTokenColor] = useState('#ff6b6b');
  const nameInputRef = useRef(null);

  // Focus input when component mounts
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const colors = [
    '#ff6b6b', // red
    '#4ecdc4', // teal
    '#45b7d1', // blue
    '#f9ca24', // yellow
    '#6c5ce7', // purple
    '#a29bfe', // light purple
    '#fd79a8', // pink
    '#00b894', // green
    '#fdcb6e', // orange
    '#2d3436', // dark
  ];

  const handleCreateToken = () => {
    const trimmedName = tokenName.trim();

    if (!trimmedName) {
      return; // Button is already disabled, so this shouldn't happen
    }

    if (trimmedName.length < 1) {
      return;
    }

    onCreateToken({
      name: trimmedName,
      color: tokenColor,
    });

    // Clear form
    setTokenName('');
  };

  return (
    <div className="token-panel">
      <div className="token-form">
        <input
          ref={nameInputRef}
          type="text"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          placeholder="Token name..."
          maxLength={20}
          className="token-name-input"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleCreateToken();
            }
          }}
        />

        <div className="color-picker">
          {colors.map((color) => (
            <button
              key={color}
              className={`color-option ${tokenColor === color ? 'selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setTokenColor(color)}
              title={color}
            />
          ))}
        </div>

        <button
          onClick={handleCreateToken}
          className="create-token-button"
          disabled={!tokenName.trim()}
        >
          {tokenName.trim() ? 'Add to Map' : 'Give Token a Name'}
        </button>
      </div>

      <div className="token-instructions">
        <p>Create a token to place it at the center of the map. Drag tokens to move them. Right-click any token to delete.</p>
      </div>
    </div>
  );
}

export default TokenPanel;
