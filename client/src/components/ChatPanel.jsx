import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import '../styles/ChatPanel.css';

function ChatPanel({ sandboxId, socket, currentUser, players, isActiveTab, onUnreadChange, isPanelCollapsed }) {
  const [allMessages, setAllMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('ALL'); // 'ALL' or userId
  const [unreadChannels, setUnreadChannels] = useState(new Set());
  const [errorNotification, setErrorNotification] = useState(null);
  const [diceVisibility, setDiceVisibility] = useState('public'); // Dice roll visibility mode
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Load existing messages from database (filtered for current user)
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentUser) return;

      try {
        const response = await fetch(`/api/sandbox/${sandboxId}/messages?for_user=${encodeURIComponent(currentUser.id)}&user_role=${encodeURIComponent(currentUser.role || 'player')}`);
        if (response.ok) {
          const data = await response.json();
          setAllMessages(data);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
  }, [sandboxId, currentUser]);

  // Determine which channel a message belongs to (returns userId or 'ALL')
  const getMessageChannel = useCallback((message) => {
    if (!currentUser) return null;

    // ALL channel: recipient_id is null
    if (message.recipient_id === null) {
      return 'ALL';
    }

    // Private message: either sent to me or sent by me
    if (message.recipient_id === currentUser.id) {
      return message.sender_id; // From sender (use sender's userId)
    }
    if (message.sender_id === currentUser.id) {
      return message.recipient_id; // To recipient (use recipient's userId)
    }

    return null; // Message not for this user
  }, [currentUser]);

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

  // Listen for user name changes to update displayed names
  useEffect(() => {
    if (!socket) return;

    const handleUserNameChanged = ({ userId, newName }) => {
      setAllMessages(prevMessages =>
        prevMessages.map(msg => ({
          ...msg,
          sender_name: msg.sender_id === userId ? newName : msg.sender_name,
          recipient_name: msg.recipient_id === userId ? newName : msg.recipient_name
        }))
      );
    };

    socket.on('user-name-changed', handleUserNameChanged);

    return () => {
      socket.off('user-name-changed', handleUserNameChanged);
    };
  }, [socket]);

  // Filter messages based on selected channel
  const filteredMessages = useMemo(() => {
    if (!currentUser) return [];

    if (selectedChannel === 'ALL') {
      // Show only messages where recipient_id is null
      return allMessages.filter(msg => msg.recipient_id === null);
    } else {
      // Show private messages between me and the selected player (by userId)
      return allMessages.filter(msg =>
        (msg.sender_id === selectedChannel && msg.recipient_id === currentUser.id) ||
        (msg.sender_id === currentUser.id && msg.recipient_id === selectedChannel)
      );
    }
  }, [allMessages, selectedChannel, currentUser]);

  // Auto-scroll to bottom when filtered messages change
  // Only scroll if panel is not collapsed to prevent browser from forcing panel open
  useEffect(() => {
    if (!isPanelCollapsed) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages, isPanelCollapsed]);

  // Auto-focus message input when chat tab becomes active
  useEffect(() => {
    if (isActiveTab && currentUser) {
      messageInputRef.current?.focus();
    }
  }, [isActiveTab, currentUser]);

  // Show error notification
  const showErrorNotification = (message) => {
    setErrorNotification(message);
    setTimeout(() => setErrorNotification(null), 3000);
  };

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

    if (!newMessage.trim() || !currentUser) return;

    try {
      // Check if this is a dice roll
      const isDiceRoll = newMessage.trim().startsWith('/r ');

      // Get recipient info (only for non-dice-roll messages)
      let recipientId = null;
      let recipientName = null;

      if (!isDiceRoll && selectedChannel !== 'ALL') {
        const recipient = players.find(p => p.userId === selectedChannel);
        if (recipient) {
          recipientId = recipient.userId;
          recipientName = recipient.name;
        }
      }

      // Build payload
      const payload = {
        sender_id: currentUser.id,
        sender_name: currentUser.name,
        sender_role: currentUser.role || 'player',
        message: newMessage.trim(),
        recipient_id: isDiceRoll ? null : recipientId,
        recipient_name: isDiceRoll ? null : recipientName
      };

      // Include dice_visibility only for dice rolls
      if (isDiceRoll) {
        payload.dice_visibility = diceVisibility;
      }

      const response = await fetch(`/api/sandbox/${sandboxId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setNewMessage('');
      } else {
        // Handle error response (e.g., invalid dice roll)
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to send message';

        // Show error notification to user
        showErrorNotification(errorMessage);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      showErrorNotification('Failed to send message. Please check your connection.');
    }
  };

  // Helper to get display text for a message (handles blinded rolls)
  const getMessageDisplayText = (msg) => {
    // Check if this is a blind roll sent by the current user
    if (msg.is_dice_roll &&
        msg.dice_visibility === 'blind_to_gm' &&
        msg.sender_id === currentUser?.id &&
        currentUser?.role !== 'gm') {
      // Extract the command from the original message
      const lines = msg.message.split('\n');
      const commandLine = lines[0]; // "/r 1d20" or similar
      return `${commandLine}\nRolled: ???\nSum = ???`;
    }
    return msg.message;
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

  // Build channel list: ALL + all other players (keyed by userId)
  const availableChannels = useMemo(() => {
    if (!currentUser) return [{ id: 'ALL', name: 'ALL' }];

    const channels = [{ id: 'ALL', name: 'ALL' }];
    // Add all players except current user
    players.forEach(player => {
      if (player.userId !== currentUser.id) {
        channels.push({ id: player.userId, name: player.name });
      }
    });
    return channels;
  }, [players, currentUser]);

  // Get recipient name for a selected channel
  const getSelectedChannelName = () => {
    if (selectedChannel === 'ALL') return 'ALL';
    const player = players.find(p => p.userId === selectedChannel);
    return player ? player.name : selectedChannel;
  };

  return (
    <div className="chat-panel">
      {/* Channel Pills Section */}
      <div className="chat-channels">
        {availableChannels.map(channel => (
          <button
            key={channel.id}
            className={`channel-pill ${selectedChannel === channel.id ? 'selected' : ''} ${unreadChannels.has(channel.id) ? 'unread' : ''}`}
            onClick={() => handleChannelSelect(channel.id)}
          >
            {channel.name}
          </button>
        ))}
      </div>

      {/* Messages Section */}
      <div className="chat-messages">
        {filteredMessages.length === 0 ? (
          <div className="chat-empty">
            {selectedChannel === 'ALL'
              ? 'No messages yet. Start the conversation!'
              : `No messages with ${getSelectedChannelName()} yet.`
            }
          </div>
        ) : (
          filteredMessages.map((msg, index) => (
            <div key={msg.id || index} className={`chat-message ${msg.is_dice_roll ? 'dice-roll' : ''}`}>
              <div className="chat-message-header">
                <span className="chat-sender">{msg.sender_name}</span>
                <span className="chat-timestamp">{formatTimestamp(msg.created_at)}</span>
              </div>
              <div className="chat-message-text">{getMessageDisplayText(msg)}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Notification */}
      {errorNotification && (
        <div className="chat-error-notification">
          {errorNotification}
        </div>
      )}

      {/* Dice Visibility Selector */}
      <div className="dice-visibility-selector">
        <label htmlFor="dice-visibility">Dice Roll Visibility:</label>
        <select
          id="dice-visibility"
          value={diceVisibility}
          onChange={(e) => setDiceVisibility(e.target.value)}
          className="visibility-dropdown"
        >
          <option value="public">Public Roll (All)</option>
          <option value="to_gm">Roll to GM</option>
          <option value="blind_to_gm">Blind Roll to GM</option>
          <option value="to_self">Roll to Self</option>
        </select>
      </div>

      {/* Input Form */}
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          ref={messageInputRef}
          type="text"
          className="chat-input"
          placeholder={
            !currentUser
              ? "Authenticating..."
              : selectedChannel === 'ALL'
                ? "Message to all..."
                : `Message to ${getSelectedChannelName()}...`
          }
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={!currentUser}
          maxLength={500}
        />
        <button
          type="submit"
          className="chat-send-button"
          disabled={!newMessage.trim() || !currentUser}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;