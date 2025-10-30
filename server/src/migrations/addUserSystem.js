const Database = require('better-sqlite3');
const path = require('path');

/**
 * Migration: Add User System
 *
 * This migration adds:
 * - users table
 * - Updates chat_messages table with sender_id and recipient_id
 * - Updates tokens table with created_by_user_id
 * - Adds appropriate indexes
 */

function runMigration(db) {
  console.log('Starting user system migration...');

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      sandbox_id TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('gm', 'player')),
      password_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sandbox_id) REFERENCES sandboxes(id) ON DELETE CASCADE
    )
  `);
  console.log('✓ Created users table');

  // Add indexes for users table
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_sandbox_id ON users(sandbox_id);
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_sandbox_name ON users(sandbox_id, name);
  `);
  console.log('✓ Created indexes on users table');

  // Add user ID columns to chat_messages
  try {
    db.exec(`ALTER TABLE chat_messages ADD COLUMN sender_id TEXT`);
    console.log('✓ Added sender_id column to chat_messages');
  } catch (error) {
    if (!error.message.includes('duplicate column name')) {
      console.error('Error adding sender_id:', error.message);
    }
  }

  try {
    db.exec(`ALTER TABLE chat_messages ADD COLUMN recipient_id TEXT`);
    console.log('✓ Added recipient_id column to chat_messages');
  } catch (error) {
    if (!error.message.includes('duplicate column name')) {
      console.error('Error adding recipient_id:', error.message);
    }
  }

  // Add foreign keys and indexes for chat_messages
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_chat_messages_recipient_id ON chat_messages(recipient_id)`);
    console.log('✓ Created indexes on chat_messages');
  } catch (error) {
    console.error('Error creating indexes on chat_messages:', error.message);
  }

  // Add created_by_user_id column to tokens
  try {
    db.exec(`ALTER TABLE tokens ADD COLUMN created_by_user_id TEXT`);
    console.log('✓ Added created_by_user_id column to tokens');
  } catch (error) {
    if (!error.message.includes('duplicate column name')) {
      console.error('Error adding created_by_user_id:', error.message);
    }
  }

  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tokens_created_by_user_id ON tokens(created_by_user_id)`);
    console.log('✓ Created index on tokens.created_by_user_id');
  } catch (error) {
    console.error('Error creating index on tokens:', error.message);
  }

  console.log('User system migration completed successfully!');
}

// Run migration if this file is executed directly
if (require.main === module) {
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database.sqlite');
  const db = new Database(dbPath);

  db.pragma('foreign_keys = ON');

  try {
    runMigration(db);
    db.close();
    console.log('Migration completed. Database closed.');
  } catch (error) {
    console.error('Migration failed:', error);
    db.close();
    process.exit(1);
  }
}

module.exports = { runMigration };
