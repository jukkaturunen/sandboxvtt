const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
function initializeDatabase() {
  // Create sandboxes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sandboxes (
      id TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create images table
  db.exec(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sandbox_id TEXT NOT NULL,
      name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      is_active INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sandbox_id) REFERENCES sandboxes(id) ON DELETE CASCADE
    )
  `);

  // Create tokens table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sandbox_id TEXT NOT NULL,
      image_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      position_x REAL NOT NULL,
      position_y REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sandbox_id) REFERENCES sandboxes(id) ON DELETE CASCADE,
      FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
    )
  `);

  // Create chat_messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sandbox_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      message TEXT NOT NULL,
      recipient_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sandbox_id) REFERENCES sandboxes(id) ON DELETE CASCADE
    )
  `);

  // Add recipient_name column to existing tables (migration)
  try {
    db.exec(`ALTER TABLE chat_messages ADD COLUMN recipient_name TEXT`);
    console.log('Added recipient_name column to chat_messages table');
  } catch (error) {
    // Column already exists, ignore error
    if (!error.message.includes('duplicate column name')) {
      console.error('Migration error:', error.message);
    }
  }

  // Add dice roll columns to existing tables (migration)
  try {
    db.exec(`ALTER TABLE chat_messages ADD COLUMN is_dice_roll INTEGER DEFAULT 0`);
    console.log('Added is_dice_roll column to chat_messages table');
  } catch (error) {
    if (!error.message.includes('duplicate column name')) {
      console.error('Migration error:', error.message);
    }
  }

  try {
    db.exec(`ALTER TABLE chat_messages ADD COLUMN dice_command TEXT`);
    console.log('Added dice_command column to chat_messages table');
  } catch (error) {
    if (!error.message.includes('duplicate column name')) {
      console.error('Migration error:', error.message);
    }
  }

  try {
    db.exec(`ALTER TABLE chat_messages ADD COLUMN dice_results TEXT`);
    console.log('Added dice_results column to chat_messages table');
  } catch (error) {
    if (!error.message.includes('duplicate column name')) {
      console.error('Migration error:', error.message);
    }
  }

  console.log('Database initialized successfully');
}

// Initialize on module load
initializeDatabase();

// Prepared statements for common operations

// Sandbox operations
const createSandbox = db.prepare('INSERT INTO sandboxes (id) VALUES (?)');
const getSandbox = db.prepare('SELECT * FROM sandboxes WHERE id = ?');

// Image operations
const createImage = db.prepare(`
  INSERT INTO images (sandbox_id, name, file_path, is_active) 
  VALUES (?, ?, ?, ?)
`);
const getImages = db.prepare('SELECT * FROM images WHERE sandbox_id = ? ORDER BY created_at ASC');
const getImage = db.prepare('SELECT * FROM images WHERE id = ?');
const setActiveImage = db.prepare('UPDATE images SET is_active = ? WHERE id = ?');
const clearActiveImages = db.prepare('UPDATE images SET is_active = 0 WHERE sandbox_id = ?');

// Token operations
const createToken = db.prepare(`
  INSERT INTO tokens (sandbox_id, image_id, name, color, position_x, position_y, created_by_user_id)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const getTokens = db.prepare('SELECT * FROM tokens WHERE sandbox_id = ? ORDER BY created_at ASC');
const getTokensByImage = db.prepare('SELECT * FROM tokens WHERE image_id = ? ORDER BY created_at ASC');
const updateTokenPosition = db.prepare('UPDATE tokens SET position_x = ?, position_y = ? WHERE id = ?');
const deleteToken = db.prepare('DELETE FROM tokens WHERE id = ?');

// Chat operations
const createMessage = db.prepare(`
  INSERT INTO chat_messages (sandbox_id, sender_id, sender_name, sender_role, message, recipient_id, recipient_name, is_dice_roll, dice_command, dice_results)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const getMessages = db.prepare('SELECT * FROM chat_messages WHERE sandbox_id = ? ORDER BY created_at ASC');
const getMessagesForPlayer = db.prepare(`
  SELECT * FROM chat_messages
  WHERE sandbox_id = ?
    AND (
      recipient_name IS NULL
      OR recipient_name = ?
      OR sender_name = ?
    )
  ORDER BY created_at ASC
`);
const getMessagesForUser = db.prepare(`
  SELECT * FROM chat_messages
  WHERE sandbox_id = ?
    AND (
      recipient_id IS NULL
      OR recipient_id = ?
      OR sender_id = ?
    )
  ORDER BY created_at ASC
`);
const updateMessageSenderName = db.prepare(`
  UPDATE chat_messages SET sender_name = ? WHERE sender_id = ?
`);
const updateMessageRecipientName = db.prepare(`
  UPDATE chat_messages SET recipient_name = ? WHERE recipient_id = ?
`);

// User operations
const createUser = db.prepare(`
  INSERT INTO users (id, sandbox_id, name, role, password_hash)
  VALUES (?, ?, ?, ?, ?)
`);
const getUserById = db.prepare('SELECT * FROM users WHERE id = ? AND sandbox_id = ?');
const getUsersBySandbox = db.prepare('SELECT id, name, role, created_at FROM users WHERE sandbox_id = ? ORDER BY created_at ASC');
const updateUserName = db.prepare('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND sandbox_id = ?');
const updateUserPassword = db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND sandbox_id = ?');

module.exports = {
  db,
  // Sandbox
  createSandbox,
  getSandbox,
  // Images
  createImage,
  getImages,
  getImage,
  setActiveImage,
  clearActiveImages,
  // Tokens
  createToken,
  getTokens,
  getTokensByImage,
  updateTokenPosition,
  deleteToken,
  // Chat
  createMessage,
  getMessages,
  getMessagesForPlayer,
  getMessagesForUser,
  updateMessageSenderName,
  updateMessageRecipientName,
  // Users
  createUser,
  getUserById,
  getUsersBySandbox,
  updateUserName,
  updateUserPassword,
};
