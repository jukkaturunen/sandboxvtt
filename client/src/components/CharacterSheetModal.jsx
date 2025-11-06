import { useState, useEffect } from 'react';
import '../styles/CharacterSheetModal.css';

function CharacterSheetModal({ sandboxId, userId, userName, onClose }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load character sheet on mount
  useEffect(() => {
    const loadSheet = async () => {
      try {
        const response = await fetch(`/api/sandbox/${sandboxId}/user/${userId}/sheet`);

        if (!response.ok) {
          throw new Error('Failed to load character sheet');
        }

        const data = await response.json();
        setContent(data.content || '');
      } catch (err) {
        console.error('Error loading character sheet:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSheet();
  }, [sandboxId, userId]);

  const handleSave = async () => {
    setError('');
    setSaveSuccess(false);
    setSaving(true);

    try {
      const response = await fetch(`/api/sandbox/${sandboxId}/user/${userId}/sheet`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save character sheet');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Clear success message after 3s
    } catch (err) {
      console.error('Error saving character sheet:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="character-sheet-modal-overlay" onClick={onClose}>
      <div className="character-sheet-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>

        {loading ? (
          <div className="character-sheet-loading">Loading...</div>
        ) : (
          <>
            {error && <div className="character-sheet-error">{error}</div>}
            {saveSuccess && <div className="character-sheet-success">Saved successfully!</div>}

            <textarea
              className="character-sheet-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your character details here..."
            />

            <div className="character-sheet-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CharacterSheetModal;