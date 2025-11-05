import { useEffect } from 'react';
import '../styles/PingAnimation.css';

function PingAnimation({ position_x, position_y, userName, onComplete }) {
  useEffect(() => {
    // Auto-remove after animation completes
    const timer = setTimeout(() => {
      onComplete();
    }, 1500); // Match animation duration

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Truncate long names
  const displayName = userName.length > 15 ? userName.substring(0, 13) + '...' : userName;

  return (
    <div
      className="ping-container"
      style={{
        left: `${position_x}px`,
        top: `${position_y}px`,
      }}
    >
      {/* Three ripple circles with staggered timing */}
      <div className="ping-ripple ping-ripple-1"></div>
      <div className="ping-ripple ping-ripple-2"></div>
      <div className="ping-ripple ping-ripple-3"></div>

      {/* Player name tag */}
      <div className="ping-name-tag">{displayName}</div>
    </div>
  );
}

export default PingAnimation;
