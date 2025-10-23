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

  const handleCancelFile = () => {
    setSelectedFile(null);
    setImageName('');
    const fileInput = document.getElementById('image-upload-input');
    if (fileInput) fileInput.value = '';
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
      {/* GM Panel Header */}
      <div className="gm-panel-header">
        <h3>GM Controls</h3>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="notification-toast">
          {notification}
        </div>
      )}

      <div className="gm-panel-content">
          {/* Image Upload Section */}
        <div className="panel-section">
          <h4>Upload Image</h4>
          <input
            id="image-upload-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input-hidden"
          />
          {!selectedFile ? (
            <label htmlFor="image-upload-input" className="file-link">
              Choose file
            </label>
          ) : (
            <div className="file-selected">
              <span className="filename">{selectedFile.name}</span>
              <button onClick={handleCancelFile} className="cancel-file" title="Cancel">
                ×
              </button>
            </div>
          )}
          {selectedFile && (
            <>
              <input
                type="text"
                value={imageName}
                onChange={(e) => setImageName(e.target.value)}
                placeholder="Image name..."
                className="image-name-input"
              />
              {uploading ? (
                <div className="upload-link uploading">
                  Uploading...
                  <LoadingSpinner size="small" inline />
                </div>
              ) : (
                <button
                  onClick={handleUpload}
                  disabled={!imageName.trim()}
                  className="upload-link"
                >
                  Upload
                </button>
              )}
            </>
          )}
        </div>

        {/* Image List Section */}
        <div className="panel-section image-list-section">
          <h4>Images</h4>
          {images.length === 0 ? (
            <p className="no-images">No images uploaded yet</p>
          ) : (
            <div className="image-list">
              {images.map((image) => {
                const isPreviewing = previewImage?.id === image.id;
                return (
                  <div
                    key={image.id}
                    className={`image-item ${image.is_active ? 'active' : ''}`}
                  >
                    <span
                      className={`image-name clickable ${isPreviewing ? 'previewing' : ''}`}
                      onClick={() => handlePreview(image)}
                      title="Click to preview"
                    >
                      {image.name}
                    </span>
                    {isPreviewing ? (
                      <button
                        onClick={handleReturnToActive}
                        className="activate-button exit-preview"
                      >
                        Exit
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(image.id)}
                        className="activate-button"
                        disabled={image.is_active}
                      >
                        {image.is_active ? 'Active' : 'Activate'}
                      </button>
                    )}
                  </div>
                );
              })}
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
    </div>
  );
}

export default GMPanel;
