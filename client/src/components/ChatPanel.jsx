import { useState, useEffect, useRef } from 'react';
import '../styles/ChatPanel.css';

function ChatPanel({ sandboxId, socket, characterName, role }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load existing messages from database
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/sandbox/${sandboxId}/messages`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
  }, [sandboxId]);

  useEffect(() => {
    // Listen for new chat messages
    if (!socket) return;

    const handleChatMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    socket.on('chat-message', handleChatMessage);

    return () => {
      socket.off('chat-message', handleChatMessage);
    };
  }, [socket]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !characterName) return;

    try {
      const response = await fetch(`/api/sandbox/${sandboxId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_name: characterName,
          sender_role: role || 'player',
          message: newMessage.trim()
        })
      });

      if (response.ok) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>Chat</h3>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg, index) => (
            <div key={msg.id || index} className="chat-message">
              <div className="chat-message-header">
                <span className="chat-sender">{msg.sender_name}</span>
                <span className="chat-timestamp">{formatTimestamp(msg.created_at)}</span>
              </div>
              <div className="chat-message-text">{msg.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="chat-input"
          placeholder={characterName ? "Type a message..." : "Set your name first..."}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={!characterName}
          maxLength={500}
        />
        <button
          type="submit"
          className="chat-send-button"
          disabled={!newMessage.trim() || !characterName}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;
