import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/ImageCanvas.css';

function ImageCanvas({ sandboxId, socket, isConnected, pendingToken, onTokenPlaced, gmPreviewImage, rightPanelCollapsed }) {
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Determine which image to display (preview takes priority for GM)
  const displayImage = gmPreviewImage || activeImage;

  // Fetch functions with useCallback to prevent unnecessary re-renders
  const fetchActiveImage = useCallback(async () => {
    try {
      const response = await fetch(`/api/sandbox/${sandboxId}/images`);
      const images = await response.json();
      const active = images.find(img => img.is_active === 1);

      if (active) {
        setActiveImage(active);
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setImageLoaded(false);
      } else {
        setActiveImage(null);
      }
    } catch (error) {
      console.error('Error fetching active image:', error);
    }
  }, [sandboxId]);

  const fetchTokens = useCallback(async () => {
    try {
      const response = await fetch(`/api/sandbox/${sandboxId}/tokens`);
      const data = await response.json();
      setTokens(data);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  }, [sandboxId]);

  // Fetch active image and tokens on mount
  useEffect(() => {
    fetchActiveImage();
    fetchTokens();
  }, [fetchActiveImage, fetchTokens]);

  // Listen for socket events - triggers when socket connects
  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    const handleActiveViewChanged = () => {
      fetchActiveImage();
    };

    const handleTokenCreated = (token) => {
      setTokens(prev => [...prev, token]);
    };

    const handleTokenMoved = ({ tokenId, position_x, position_y }) => {
      setTokens(prev => prev.map(t =>
        t.id === tokenId ? { ...t, position_x, position_y } : t
      ));
    };

    const handleTokenDeleted = ({ tokenId }) => {
      setTokens(prev => prev.filter(t => t.id !== tokenId));
      setContextMenu(null);
    };

    socket.on('active-view-changed', handleActiveViewChanged);
    socket.on('token-created', handleTokenCreated);
    socket.on('token-moved', handleTokenMoved);
    socket.on('token-deleted', handleTokenDeleted);

    return () => {
      socket.off('active-view-changed', handleActiveViewChanged);
      socket.off('token-created', handleTokenCreated);
      socket.off('token-moved', handleTokenMoved);
      socket.off('token-deleted', handleTokenDeleted);
    };
  }, [socket, isConnected, fetchActiveImage]);

  // Handle pending token - place at center when token is created
  useEffect(() => {
    if (pendingToken && activeImage && imageRef.current) {
      placeTokenAtCenter();
    }
  }, [pendingToken]);

  // When GM preview image changes, reset and center the new image
  useEffect(() => {
    if (gmPreviewImage) {
      setImageLoaded(false);
    }
  }, [gmPreviewImage]);

  const placeTokenAtCenter = async () => {
    if (!activeImage || !imageRef.current || !pendingToken) return;

    // Get the center of the image in image coordinates
    const imageRect = imageRef.current.getBoundingClientRect();
    const centerX = imageRect.width / 2 / scale;
    const centerY = imageRect.height / 2 / scale;

    try {
      await fetch(`/api/sandbox/${sandboxId}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_id: activeImage.id,
          name: pendingToken.name,
          color: pendingToken.color,
          position_x: centerX,
          position_y: centerY,
          created_by_user_id: pendingToken.created_by_user_id
        })
      });

      onTokenPlaced();
    } catch (error) {
      console.error('Error creating token:', error);
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

  const handleMouseUp = async () => {
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
    if (!containerRef.current || !imageRef.current) return null;

    const imageRect = imageRef.current.getBoundingClientRect();

    // Calculate position relative to the image element (which is transformed)
    const x = (clientX - imageRect.left) / scale;
    const y = (clientY - imageRect.top) / scale;

    // Check tokens in reverse order (top to bottom)
    for (let i = tokens.length - 1; i >= 0; i--) {
      const token = tokens[i];
      if (!displayImage || token.image_id !== displayImage.id) continue;

      const tokenRadius = 20; // Token radius in image coordinates
      const dx = x - token.position_x;
      const dy = y - token.position_y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= tokenRadius) {
        return token;
      }
    }

    return null;
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

  // Center and fit image to canvas
  const centerAndFitImage = () => {
    if (!containerRef.current || !imageRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const image = imageRef.current;
    const imageNaturalWidth = image.naturalWidth;
    const imageNaturalHeight = image.naturalHeight;

    // Calculate scale to fit image in container
    const scaleX = container.width / imageNaturalWidth;
    const scaleY = container.height / imageNaturalHeight;
    const fitScale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%

    // The wrapper is positioned at (0,0) and transform-origin is "center center"
    // This means scale is applied from the center of the natural image size
    // After scaling, we need to translate so the image center is at container center

    // Center of the image (at natural size, before scaling)
    const imageCenterX = imageNaturalWidth / 2;
    const imageCenterY = imageNaturalHeight / 2;

    // Center of the container
    const containerCenterX = container.width / 2;
    const containerCenterY = container.height / 2;

    // Position the wrapper so the image center aligns with container center
    // We need to offset by the difference between centers
    const centerX = containerCenterX - imageCenterX;
    const centerY = containerCenterY - imageCenterY;

    setScale(fitScale);
    setPosition({ x: centerX, y: centerY });
  };

  const resetView = () => {
    centerAndFitImage();
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 5));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  if (!displayImage) {
    return (
      <div className="image-canvas no-image">
        <div className="no-image-message">
          <h3>No Active Image</h3>
          <p>{gmPreviewImage !== undefined ? 'Select an image to preview or activate' : 'The GM hasn\'t selected an image yet'}</p>
        </div>
      </div>
    );
  }

  // Only show tokens for the active image (not for previews)
  const activeTokens = tokens.filter(t => t.image_id === displayImage.id);

  return (
    <div
      ref={containerRef}
      className={`image-canvas ${isDraggingCanvas ? 'dragging' : ''} ${pendingToken ? 'placing-token' : ''} ${gmPreviewImage ? 'preview-mode' : ''}`}
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
      onClick={() => setContextMenu(null)}
    >
      <div className={`canvas-controls ${rightPanelCollapsed ? 'right-panel-collapsed' : ''}`}>
        <button onClick={resetView} className="reset-button" title="Reset View">
          Reset View
        </button>
        <button onClick={zoomOut} className="zoom-button" title="Zoom Out">−</button>
        <span className="zoom-level">{Math.round(scale * 100)}%</span>
        <button onClick={zoomIn} className="zoom-button" title="Zoom In">+</button>
        {gmPreviewImage && (
          <span className="preview-indicator">Preview Mode</span>
        )}
      </div>

      <div
        className="image-wrapper"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
      >
        <img
          ref={imageRef}
          src={`/uploads/${displayImage.file_path}`}
          alt={displayImage.name}
          draggable={false}
          onLoad={() => {
            if (!imageLoaded && containerRef.current && imageRef.current) {
              centerAndFitImage();
              setImageLoaded(true);
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
