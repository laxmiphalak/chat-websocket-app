/**
 * Chat Component
 * 
 * Main chat interface that handles:
 * - WebSocket connection management
 * - Real-time message sending/receiving
 * - Online users tracking
 * - Optimistic UI updates
 * - Auto-reconnection on connection loss
 */

import { useState, useEffect } from 'react';
import './styles.css';

export default function Chat({ userId }) {
    // Message history for the chat
    const [messages, setMessages] = useState([]);
    // Current message being typed
    const [newMessage, setNewMessage] = useState('');
    // WebSocket connection status
    const [webSocketReady, setWebSocketReady] = useState(false);
    // WebSocket instance
    const [webSocket, setWebSocket] = useState(new WebSocket("ws://localhost:3001/ws"));
    // List of currently online users
    const [onlineUsers, setOnlineUsers] = useState([]);

    /**
     * Formats timestamp to readable time (HH:MM)
     * @param {number} ts - Unix timestamp
     * @returns {string} Formatted time string
     */
    const formatTime = (ts) => {
        try {
            return new Date(ts).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        } catch (e) {
            return '';
        }
    }

    // Setup WebSocket event handlers and lifecycle management
    useEffect(() => {
        /**
         * Sends userId to server once when connection opens
         * Uses a flag on the WebSocket instance to prevent duplicate sends
         */
        const sendUserId = () => {
            if (userId && !webSocket._userIdSent && webSocket.readyState === WebSocket.OPEN) {
                webSocket.send(JSON.stringify({type: 'setUserId', userId}));
                webSocket._userIdSent = true;
            }
        };
        
        // Handle WebSocket connection open event
        webSocket.onopen = (e) => {
            setWebSocketReady(true);
            sendUserId();
        }
        
        // If WebSocket is already open when component mounts, send userId immediately
        if (webSocket.readyState === WebSocket.OPEN && !webSocket._userIdSent) {
            setWebSocketReady(true);
            sendUserId();
        }

        // Handle incoming messages from server
        webSocket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            
            // Handle online users list update from server
            if (message.type === 'users') {
                setOnlineUsers(message.users || []);
                return;
            }
            
            // Ensure all messages have a timestamp
            message.timestamp = message.timestamp || Date.now();

            setMessages((prev) => {
                // If server echoes with localId, replace the pending optimistic message
                if (message.localId) {
                    const idx = prev.findIndex(m => m.localId === message.localId);
                    if (idx !== -1) {
                        const copy = [...prev];
                        copy[idx] = {...message, isSelf: message.sender === userId};
                        return copy;
                    }
                }

                // Deduplicate: if we receive our own message, remove pending optimistic version
                if (message.sender === userId) {
                    const idx = prev.findIndex(m => m.sender === userId && m.pending && m.text === message.text);
                    if (idx !== -1) {
                        const copy = [...prev];
                        copy.splice(idx, 1);
                        return [...copy, {...message, isSelf: true}];
                    }
                }

                return [...prev, {...message, isSelf: message.sender === userId}];
            })
        }

        // Handle WebSocket connection close - attempt to reconnect after 1 second
        webSocket.onclose = function (event) {
            setWebSocketReady(false);
            setTimeout(() => {
              setWebSocket(new WebSocket("ws://localhost:3001/ws"));
            }, 1000);
          };
      
          // Handle WebSocket errors
          webSocket.onerror = function (err) {
            console.log('Socket encountered error: ', err.message, 'Closing socket');
            setWebSocketReady(false);
            webSocket.close();
          };
      
          // Cleanup: close WebSocket when component unmounts
          return () => {
             webSocket.close();
          };
    }, [webSocket, userId])

    /**
     * Handles sending a new message
     * Uses optimistic UI updates - message appears immediately before server confirmation
     */
    const onSend = () => {
        if (newMessage.trim() !== '' && webSocketReady) {
            // Generate unique local ID for optimistic update tracking
            const localId = 'local-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
            
            // Create optimistic message object (shown immediately in UI)
            const optimistic = {
                localId,
                type: 'message',
                text: newMessage,
                sender: userId,
                timestamp: Date.now(),
                pending: true, // Mark as pending until server confirms
                isSelf: true
            };

            // Add optimistic message to UI immediately
            setMessages(prev => [...prev, optimistic]);

            // Send message to server (include localId for reconciliation)
            webSocket.send(JSON.stringify({
                type: 'message',
                text: newMessage,
                sender: userId,
                localId,
                timestamp: optimistic.timestamp
            }));

            setNewMessage('');
        }
    }

    return (
        <div>
            {
                webSocketReady && userId && (
                    <div className="chat-container">
                        <div className="chat-header">
                            <div className="header-left">
                                <div className="current-user">
                                    <div className="user-badge">{userId.slice(0, 2).toUpperCase()}</div>
                                    <span className="user-name">{userId}</span>
                                </div>
                            </div>
                            <div className="header-right">
                                <div className="online-users">
                                    <span className="online-count">{onlineUsers.length} online</span>
                                    <div className="users-list">
                                        {onlineUsers.map((user, idx) => (
                                            <div key={idx} className="user-item">
                                                <div className="user-status"></div>
                                                <span>{user}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="messages">
                            {
                                messages.map((message, index) => (
                                    <div key={message.localId || index} className={`message ${message.isSelf ? 'self' : 'other'} ${message.pending ? 'pending' : ''}`}>
                                        {!message.isSelf && <div className="avatar">{(message.sender || '').toString().slice(0,2).toUpperCase()}</div>}
                                        <div className="message-body">
                                            {!message.isSelf && <div className="sender">{message.sender}</div>}
                                            <div className="message-text">{message.text}</div>
                                            <div className="timestamp">{formatTime(message.timestamp)}</div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                        <div className="compose">
                            <input
                                className="compose-input"
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                                placeholder="Message"
                            />
                            <button className="compose-send" onClick={onSend} aria-label="Send message">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )
            }
            
        </div>
    );
}