import React, { useState, useEffect, useRef } from 'react';
import '../styles/ImageCanvas.css';

function ImageCanvas({ sandboxId, socket }) {
  const [activeImage, setActiveImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Fetch active image on mount
  useEffect(() => {
    fetchActiveImage();
  }, [sandboxId]);

  // Listen for active-view-changed events
  useEffect(() => {
    if (!socket) return;

    socket.on('active-view-changed', () => {
      fetchActiveImage();
    });

    return () => {
      socket.off('active-view-changed');
    };
  }, [socket]);

  const fetchActiveImage = async () => {
    try {
      const response = await fetch(`/api/sandbox/${sandboxId}/images`);
      const images = await response.json();
      const active = images.find(img => img.is_active === 1);

      if (active) {
        setActiveImage(active);
        // Reset zoom and pan when changing images
        setScale(1);
        setPosition({ x: 0, y: 0 });
      } else {
        setActiveImage(null);
      }
    } catch (error) {
      console.error('Error fetching active image:', error);
    }
  };

  // Zoom handlers
  const handleWheel = (e) => {
    e.preventDefault();

    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.5, scale + delta), 5);

    setScale(newScale);
  };

  // Pan handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Reset view
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

  return (
    <div
      ref={containerRef}
      className={`image-canvas ${isDragging ? 'dragging' : ''}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
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
            // Center image on load
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
      </div>
    </div>
  );
}

export default ImageCanvas;
