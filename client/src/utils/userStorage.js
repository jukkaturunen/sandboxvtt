/**
 * LocalStorage utility for managing user data per sandbox
 *
 * Stores user identity locally so they can rejoin seamlessly
 */

/**
 * Get stored user data for a specific sandbox
 * @param {string} sandboxId - The sandbox ID
 * @returns {Object|null} User data or null if not found
 */
export function getUserForSandbox(sandboxId) {
  try {
    const key = `sandbox-${sandboxId}-user`;
    const data = localStorage.getItem(key);
    if (!data) return null;

    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading user from localStorage:', error);
    return null;
  }
}

/**
 * Save user data for a specific sandbox
 * @param {string} sandboxId - The sandbox ID
 * @param {Object} userData - User data to save
 * @param {string} userData.userId - User ID
 * @param {string} userData.name - User name
 * @param {string} userData.role - User role ('gm' or 'player')
 * @param {boolean} userData.hasPassword - Whether user has a password
 */
export function saveUserForSandbox(sandboxId, userData) {
  try {
    const key = `sandbox-${sandboxId}-user`;
    const data = {
      userId: userData.userId,
      name: userData.name,
      role: userData.role,
      hasPassword: userData.hasPassword || false
    };

    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
}

/**
 * Clear saved user data for a specific sandbox
 * @param {string} sandboxId - The sandbox ID
 */
export function clearUserForSandbox(sandboxId) {
  try {
    const key = `sandbox-${sandboxId}-user`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing user from localStorage:', error);
  }
}

/**
 * Update user name in localStorage
 * @param {string} sandboxId - The sandbox ID
 * @param {string} newName - New user name
 */
export function updateUserNameInStorage(sandboxId, newName) {
  try {
    const userData = getUserForSandbox(sandboxId);
    if (userData) {
      userData.name = newName;
      saveUserForSandbox(sandboxId, userData);
    }
  } catch (error) {
    console.error('Error updating user name in localStorage:', error);
  }
}
