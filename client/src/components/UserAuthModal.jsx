import { useState, useEffect } from 'react';
import '../styles/UserAuthModal.css';

function UserAuthModal({ sandboxId, onSuccess, onError }) {
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'existing'
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [existingUsers, setExistingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load existing users when component mounts or when switching to existing tab
  useEffect(() => {
    if (activeTab === 'existing') {
      loadExistingUsers();
    }
  }, [activeTab, sandboxId]);

  const loadExistingUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch(`/api/sandbox/${sandboxId}/users`);
      if (!response.ok) {
        throw new Error('Failed to load users');
      }
      const users = await response.json();
      setExistingUsers(users);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load existing users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');

    if (name.length < 2 || name.length > 30) {
      setError('Name must be between 2 and 30 characters');
      return;
    }

    if (password && password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/sandbox/${sandboxId}/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          role: 'player',
          password: password || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create user');
      }

      const userData = await response.json();

      // Add hasPassword flag for client use
      userData.hasPassword = !!password;

      onSuccess(userData);
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthExistingUser = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    // Find the selected user to check if they have a password
    const selectedUser = existingUsers.find(u => u.id === selectedUserId);
    const hasPassword = selectedUser && selectedUser.password_hash !== null;

    if (hasPassword && !password) {
      setError('Password required for this user');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/sandbox/${sandboxId}/user/${selectedUserId}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Authentication failed');
      }

      const result = await response.json();

      // Add hasPassword flag for client use
      result.user.hasPassword = hasPassword;

      onSuccess(result.user);
    } catch (err) {
      console.error('Error authenticating user:', err);
      setError(err.message);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = existingUsers.find(u => u.id === selectedUserId);
  const selectedUserHasPassword = selectedUser && selectedUser.password_hash !== null;

  return (
    <div className="user-auth-modal-overlay">
      <div className="user-auth-modal">
        <h2>Join Sandbox</h2>

        <div className="user-auth-tabs">
          <button
            className={activeTab === 'create' ? 'active' : ''}
            onClick={() => {
              setActiveTab('create');
              setError('');
              setPassword('');
            }}
          >
            Create New
          </button>
          <button
            className={activeTab === 'existing' ? 'active' : ''}
            onClick={() => {
              setActiveTab('existing');
              setError('');
              setPassword('');
              setName('');
            }}
          >
            Use Existing
          </button>
        </div>

        {error && <div className="user-auth-error">{error}</div>}

        {activeTab === 'create' ? (
          <form onSubmit={handleCreateUser} className="user-auth-form">
            <div className="form-group">
              <label htmlFor="name">Player Name</label>
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

            <div className="form-group">
              <label htmlFor="password">Password (Optional)</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank for no password"
                minLength={4}
              />
              <small>Set a password to protect your identity</small>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create & Join'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleAuthExistingUser} className="user-auth-form">
            {loadingUsers ? (
              <div className="loading-users">Loading users...</div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="existingUser">Select User</label>
                  <select
                    id="existingUser"
                    value={selectedUserId}
                    onChange={(e) => {
                      setSelectedUserId(e.target.value);
                      setPassword('');
                      setError('');
                    }}
                    required
                    autoFocus
                  >
                    <option value="">-- Choose a user --</option>
                    {existingUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} {user.role === 'gm' ? '(GM)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedUserHasPassword && (
                  <div className="form-group">
                    <label htmlFor="existingPassword">Password</label>
                    <input
                      type="password"
                      id="existingPassword"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={loading || !selectedUserId}>
                  {loading ? 'Authenticating...' : 'Join'}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default UserAuthModal;
