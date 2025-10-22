import React from 'react';
import '../styles/LoadingSpinner.css';

function LoadingSpinner({ size = 'medium', inline = false }) {
  return (
    <div className={`loading-spinner ${size} ${inline ? 'inline' : ''}`}>
      <div className="spinner"></div>
    </div>
  );
}

export default LoadingSpinner;
