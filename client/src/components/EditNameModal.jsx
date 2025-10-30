import { useState } from 'react';
import '../styles/EditNameModal.css';

function EditNameModal({ sandboxId, currentUser, onClose, onSuccess }) {
  const [name, setName] = useState(currentUser.name);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (name.length < 2 || name.length > 30) {
      setError('Name must be between 2 and 30 characters');
      return;
    }

    if (currentUser.hasPassword && !password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/sandbox/${sandboxId}/user/${currentUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          password: password || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update name');
      }

      const result = await response.json();

      // Call success callback with updated user data
      onSuccess({
        ...currentUser,
        name: result.user.name,
      });

      onClose();
    } catch (err) {
      console.error('Error updating name:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-name-modal-overlay" onClick={onClose}>
      <div className="edit-name-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Your Name</h2>

        {error && <div className="edit-name-error">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-name-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              minLength={2}
              maxLength={30}
              required
              autoFocus
            />
          </div>

          {currentUser.hasPassword && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                minLength={4}
                required
              />
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditNameModal;
