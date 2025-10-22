import React, { useState, useEffect, useRef } from 'react';
import '../styles/ImageCanvas.css';

function ImageCanvas({ sandboxId, socket, pendingToken, onTokenPlaced }) {
  const [activeImage, setActiveImage] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [isDraggingToken, setIsDraggingToken] = useState(false);
  const [draggedTokenId, setDraggedTokenId] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tokenDragStart, setTokenDragStart] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Fetch active image and tokens on mount
  useEffect(() => {
    fetchActiveImage();
    fetchTokens();
  }, [sandboxId]);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('active-view-changed', ({ imageId }) => {
      fetchActiveImage();
    });

    socket.on('token-created', (token) => {
      setTokens(prev => [...prev, token]);
    });

    socket.on('token-moved', ({ tokenId, position_x, position_y }) => {
      setTokens(prev => prev.map(t =>
        t.id === tokenId ? { ...t, position_x, position_y } : t
      ));
    });

    socket.on('token-deleted', ({ tokenId }) => {
      setTokens(prev => prev.filter(t => t.id !== tokenId));
      setContextMenu(null);
    });

    return () => {
      socket.off('active-view-changed');
      socket.off('token-created');
      socket.off('token-moved');
      socket.off('token-deleted');
    };
  }, [socket]);

  const fetchActiveImage = async () => {
    try {
      const response = await fetch(`/api/sandbox/${sandboxId}/images`);
      const images = await response.json();
      const active = images.find(img => img.is_active === 1);

      if (active) {
        setActiveImage(active);
        setScale(1);
        setPosition({ x: 0, y: 0 });
      } else {
        setActiveImage(null);
      }
    } catch (error) {
      console.error('Error fetching active image:', error);
    }
  };

  const fetchTokens = async () => {
    try {
      const response = await fetch(`/api/sandbox/${sandboxId}/tokens`);
      const data = await response.json();
      setTokens(data);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  // Canvas zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.5, scale + delta), 5);
    setScale(newScale);
  };

  // Canvas pan
  const handleCanvasMouseDown = (e) => {
    if (e.button !== 0) return;

    // Check if clicking on a token
    const clickedToken = findTokenAtPosition(e.clientX, e.clientY);

    if (clickedToken) {
      // Start dragging token
      setIsDraggingToken(true);
      setDraggedTokenId(clickedToken.id);
      setTokenDragStart({
        x: e.clientX,
        y: e.clientY,
        tokenX: clickedToken.position_x,
        tokenY: clickedToken.position_y
      });
    } else if (pendingToken) {
      // Place new token
      placeToken(e.clientX, e.clientY);
    } else {
      // Start dragging canvas
      setIsDraggingCanvas(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDraggingCanvas) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (isDraggingToken && draggedTokenId) {
      const token = tokens.find(t => t.id === draggedTokenId);
      if (token) {
        const dx = (e.clientX - tokenDragStart.x) / scale;
        const dy = (e.clientY - tokenDragStart.y) / scale;

        const newX = tokenDragStart.tokenX + dx;
        const newY = tokenDragStart.tokenY + dy;

        setTokens(prev => prev.map(t =>
          t.id === draggedTokenId ? { ...t, position_x: newX, position_y: newY } : t
        ));
      }
    }
  };

  const handleMouseUp = async (e) => {
    if (isDraggingToken && draggedTokenId) {
      const token = tokens.find(t => t.id === draggedTokenId);
      if (token) {
        // Update token position on server
        try {
          await fetch(`/api/sandbox/${sandboxId}/token/${draggedTokenId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              position_x: token.position_x,
              position_y: token.position_y
            })
          });
        } catch (error) {
          console.error('Error updating token:', error);
        }
      }
    }

    setIsDraggingCanvas(false);
    setIsDraggingToken(false);
    setDraggedTokenId(null);
  };

  const handleMouseLeave = () => {
    setIsDraggingCanvas(false);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    const clickedToken = findTokenAtPosition(e.clientX, e.clientY);

    if (clickedToken) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        tokenId: clickedToken.id
      });
    } else {
      setContextMenu(null);
    }
  };

  const findTokenAtPosition = (clientX, clientY) => {
    if (!containerRef.current) return null;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - position.x) / scale;
    const y = (clientY - rect.top - position.y) / scale;

    // Check tokens in reverse order (top to bottom)
    for (let i = tokens.length - 1; i >= 0; i--) {
      const token = tokens[i];
      if (!activeImage || token.image_id !== activeImage.id) continue;

      const tokenRadius = 20; // Token radius in pixels
      const dx = x - token.position_x;
      const dy = y - token.position_y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= tokenRadius) {
        return token;
      }
    }

    return null;
  };

  const placeToken = async (clientX, clientY) => {
    if (!activeImage || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - position.x) / scale;
    const y = (clientY - rect.top - position.y) / scale;

    try {
      await fetch(`/api/sandbox/${sandboxId}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_id: activeImage.id,
          name: pendingToken.name,
          color: pendingToken.color,
          position_x: x,
          position_y: y
        })
      });

      onTokenPlaced();
    } catch (error) {
      console.error('Error creating token:', error);
    }
  };

  const deleteToken = async (tokenId) => {
    try {
      await fetch(`/api/sandbox/${sandboxId}/token/${tokenId}`, {
        method: 'DELETE'
      });
      setContextMenu(null);
    } catch (error) {
      console.error('Error deleting token:', error);
    }
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  if (!activeImage) {
    return (
      <div className="image-canvas no-image">
        <div className="no-image-message">
          <h3>No Active Image</h3>
          <p>The GM hasn't selected an image yet</p>
        </div>
      </div>
    );
  }

  const activeTokens = tokens.filter(t => t.image_id === activeImage.id);

  return (
    <div
      ref={containerRef}
      className={`image-canvas ${isDraggingCanvas ? 'dragging' : ''} ${pendingToken ? 'placing-token' : ''}`}
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
      onClick={() => setContextMenu(null)}
    >
      <div className="canvas-controls">
        <button onClick={resetView} className="reset-button" title="Reset View">
          Reset View
        </button>
        <span className="zoom-level">{Math.round(scale * 100)}%</span>
      </div>

      <div
        className="image-wrapper"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
      >
        <img
          ref={imageRef}
          src={`/uploads/${activeImage.file_path}`}
          alt={activeImage.name}
          draggable={false}
          onLoad={() => {
            if (containerRef.current && imageRef.current) {
              const container = containerRef.current.getBoundingClientRect();
              const image = imageRef.current.getBoundingClientRect();
              setPosition({
                x: (container.width - image.width) / 2,
                y: (container.height - image.height) / 2
              });
            }
          }}
        />

        {/* Render tokens */}
        {activeTokens.map((token) => (
          <div
            key={token.id}
            className="token"
            style={{
              left: `${token.position_x}px`,
              top: `${token.position_y}px`,
              backgroundColor: token.color
            }}
          >
            <span className="token-name">{token.name}</span>
          </div>
        ))}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`
          }}
        >
          <button onClick={() => deleteToken(contextMenu.tokenId)}>
            Delete Token
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageCanvas;
