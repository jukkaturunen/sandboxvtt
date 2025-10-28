import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import '../styles/ChatPanel.css';

function ChatPanel({ sandboxId, socket, characterName, role, players, isActiveTab, onUnreadChange, isPanelCollapsed }) {
  const [allMessages, setAllMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [unreadChannels, setUnreadChannels] = useState(new Set());
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Load existing messages from database (filtered for current player)
  useEffect(() => {
    const loadMessages = async () => {
      if (!characterName) return;

      try {
        const response = await fetch(`/api/sandbox/${sandboxId}/messages?for_player=${encodeURIComponent(characterName)}`);
        if (response.ok) {
          const data = await response.json();
          setAllMessages(data);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
  }, [sandboxId, characterName]);

  // Determine which channel a message belongs to
  const getMessageChannel = useCallback((message) => {
    // ALL channel: recipient_name is null
    if (message.recipient_name === null) {
      return 'ALL';
    }

    // Private message: either sent to me or sent by me
    if (message.recipient_name === characterName) {
      return message.sender_name; // From sender
    }
    if (message.sender_name === characterName) {
      return message.recipient_name; // To recipient
    }

    return null; // Message not for this user
  }, [characterName]);

  // Listen for new chat messages
  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = (message) => {
      // Only process messages that are relevant to this user
      const messageChannel = getMessageChannel(message);

      // Ignore messages not meant for this user
      if (messageChannel === null) {
        return;
      }

      setAllMessages(prev => [...prev, message]);

      // If chat tab is NOT active, always show tab indicator
      if (!isActiveTab && onUnreadChange) {
        onUnreadChange(true);
      }

      // If message is for a different channel than currently selected, mark channel as unread
      // This works regardless of whether chat tab is active or not
      if (messageChannel !== selectedChannel) {
        setUnreadChannels(prev => {
          const newSet = new Set(prev);
          newSet.add(messageChannel);
          return newSet;
        });
      }
    };

    socket.on('chat-message', handleChatMessage);

    return () => {
      socket.off('chat-message', handleChatMessage);
    };
  }, [socket, selectedChannel, isActiveTab, onUnreadChange, getMessageChannel]);

  // Filter messages based on selected channel
  const filteredMessages = useMemo(() => {
    if (selectedChannel === 'ALL') {
      // Show only messages where recipient_name is null
      return allMessages.filter(msg => msg.recipient_name === null);
    } else {
      // Show private messages between me and the selected player
      return allMessages.filter(msg =>
        (msg.sender_name === selectedChannel && msg.recipient_name === characterName) ||
        (msg.sender_name === characterName && msg.recipient_name === selectedChannel)
      );
    }
  }, [allMessages, selectedChannel, characterName]);

  // Auto-scroll to bottom when filtered messages change
  // Only scroll if panel is not collapsed to prevent browser from forcing panel open
  useEffect(() => {
    if (!isPanelCollapsed) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages, isPanelCollapsed]);

  // Auto-focus message input when chat tab becomes active
  useEffect(() => {
    if (isActiveTab && characterName) {
      messageInputRef.current?.focus();
    }
  }, [isActiveTab, characterName]);

  // Handle channel selection
  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel);
    // Clear unread indicator for this channel
    setUnreadChannels(prev => {
      const newSet = new Set(prev);
      newSet.delete(channel);
      return newSet;
    });
    // Focus the message input after channel selection
    messageInputRef.current?.focus();
  };

  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !characterName) return;

    try {
      const recipientName = selectedChannel === 'ALL' ? null : selectedChannel;

      const response = await fetch(`/api/sandbox/${sandboxId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_name: characterName,
          sender_role: role || 'player',
          message: newMessage.trim(),
          recipient_name: recipientName
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

  // Build channel list: ALL + all other players
  const availableChannels = useMemo(() => {
    const channels = ['ALL'];
    // Add all players except current user
    players.forEach(player => {
      if (player.name !== characterName) {
        channels.push(player.name);
      }
    });
    return channels;
  }, [players, characterName]);

  return (
    <div className="chat-panel">
      {/* Channel Pills Section */}
      <div className="chat-channels">
        {availableChannels.map(channel => (
          <button
            key={channel}
            className={`channel-pill ${selectedChannel === channel ? 'selected' : ''} ${unreadChannels.has(channel) ? 'unread' : ''}`}
            onClick={() => handleChannelSelect(channel)}
          >
            {channel}
          </button>
        ))}
      </div>

      {/* Messages Section */}
      <div className="chat-messages">
        {filteredMessages.length === 0 ? (
          <div className="chat-empty">
            {selectedChannel === 'ALL'
              ? 'No messages yet. Start the conversation!'
              : `No messages with ${selectedChannel} yet.`
            }
          </div>
        ) : (
          filteredMessages.map((msg, index) => (
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

      {/* Input Form */}
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          ref={messageInputRef}
          type="text"
          className="chat-input"
          placeholder={
            !characterName
              ? "Set your name first..."
              : selectedChannel === 'ALL'
                ? "Message to all..."
                : `Message to ${selectedChannel}...`
          }
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