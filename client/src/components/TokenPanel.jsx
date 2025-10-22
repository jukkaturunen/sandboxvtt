import React, { useState } from 'react';
import '../styles/TokenPanel.css';

function TokenPanel({ onCreateToken }) {
  const [tokenName, setTokenName] = useState('');
  const [tokenColor, setTokenColor] = useState('#ff6b6b');

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
      <h3>Tokens</h3>

      <div className="token-form">
        <input
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
          Click on Map to Place
        </button>
      </div>

      <div className="token-instructions">
        <p>Create a token and click on the map to place it. Right-click any token to delete.</p>
      </div>
    </div>
  );
}

export default TokenPanel;
