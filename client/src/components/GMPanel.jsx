import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import '../styles/GMPanel.css';

function GMPanel({ sandboxId, socket, onPreviewImage, previewImage }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imageName, setImageName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [notification, setNotification] = useState(null);

  // Fetch images on mount
  useEffect(() => {
    fetchImages();
  }, [sandboxId]);

  // Listen for image-uploaded events
  useEffect(() => {
    if (!socket) return;

    socket.on('image-uploaded', (image) => {
      setImages(prev => [...prev, image]);
    });

    socket.on('active-view-changed', ({ imageId }) => {
      setImages(prev => prev.map(img => ({
        ...img,
        is_active: img.id === imageId ? 1 : 0
      })));
    });

    return () => {
      socket.off('image-uploaded');
      socket.off('active-view-changed');
    };
  }, [socket]);

  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/sandbox/${sandboxId}/images`);
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!imageName) {
        // Use filename without extension as default name
        const name = file.name.replace(/\.[^/.]+$/, '');
        setImageName(name);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !imageName.trim()) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('name', imageName.trim());

    try {
      const response = await fetch(`/api/sandbox/${sandboxId}/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      // Clear form
      setSelectedFile(null);
      setImageName('');
      document.getElementById('image-upload-input').value = '';

      // Image will be added via socket event
    } catch (error) {
      console.error('Error uploading image:', error);
      showNotification('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleActivate = async (imageId) => {
    try {
      const response = await fetch(`/api/sandbox/${sandboxId}/image/${imageId}/activate`, {
        method: 'PUT',
      });

      if (!response.ok) throw new Error('Activation failed');

      // State will be updated via socket event
    } catch (error) {
      console.error('Error activating image:', error);
      showNotification('Failed to activate image. Please try again.');
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2000);
  };

  const handlePreview = (image) => {
    if (onPreviewImage) {
      onPreviewImage(image);
    }
  };

  const handleReturnToActive = () => {
    if (onPreviewImage) {
      onPreviewImage(null);
    }
  };

  const copyLink = (linkType) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/sandbox/${sandboxId}?role=${linkType}`;
    navigator.clipboard.writeText(link).then(() => {
      showNotification(`${linkType === 'gm' ? 'GM' : 'Player'} link copied to clipboard!`);
    }).catch(() => {
      showNotification('Failed to copy link');
    });
  };

  return (
    <div className="gm-panel">
      <h3>GM Controls</h3>

      {/* Notification Toast */}
      {notification && (
        <div className="notification-toast">
          {notification}
        </div>
      )}

      {/* Image Upload Section */}
      <div className="panel-section">
        <h4>Upload Image</h4>
        <input
          id="image-upload-input"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="file-input"
        />
        {selectedFile && (
          <>
            <input
              type="text"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              placeholder="Image name..."
              className="image-name-input"
            />
            <button
              onClick={handleUpload}
              disabled={uploading || !imageName.trim()}
              className="upload-button"
            >
              {uploading ? (
                <>
                  Uploading...
                  <LoadingSpinner size="small" inline />
                </>
              ) : (
                'Upload'
              )}
            </button>
          </>
        )}
      </div>

      {/* Image List Section */}
      <div className="panel-section">
        <div className="section-header">
          <h4>Images ({images.length})</h4>
          {previewImage && (
            <button
              onClick={handleReturnToActive}
              className="return-to-active-button"
              title="Return to active view"
            >
              ← Return to Active
            </button>
          )}
        </div>
        {images.length === 0 ? (
          <p className="no-images">No images uploaded yet</p>
        ) : (
          <div className="image-list">
            {images.map((image) => (
              <div
                key={image.id}
                className={`image-item ${image.is_active ? 'active' : ''}`}
              >
                <div className="image-info">
                  <span
                    className={`image-name clickable ${previewImage?.id === image.id ? 'previewing' : ''}`}
                    onClick={() => handlePreview(image)}
                    title="Click to preview"
                  >
                    {image.name}
                  </span>
                  {image.is_active && <span className="active-badge">Active</span>}
                </div>
                <button
                  onClick={() => handleActivate(image.id)}
                  className="activate-button"
                  disabled={image.is_active}
                >
                  {image.is_active ? 'Current' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Links Section */}
      <div className="panel-section">
        <h4>Share Links</h4>
        <button onClick={() => copyLink('gm')} className="link-button">
          Copy GM Link
        </button>
        <button onClick={() => copyLink('player')} className="link-button">
          Copy Player Link
        </button>
      </div>
    </div>
  );
}

export default GMPanel;
