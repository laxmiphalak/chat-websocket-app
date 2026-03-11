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

import { useState, useEffect, useCallback, useRef } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ComposeBar from './ComposeBar';
import './styles.css';

export default function Chat({ userId }) {
    // Message history for the chat
    const [messages, setMessages] = useState([]);
    // Current message being typed
    const [newMessage, setNewMessage] = useState('');
    // WebSocket connection status
    const [webSocketReady, setWebSocketReady] = useState(false);
    // WebSocket instance
    const [webSocket, setWebSocket] = useState(null);
    // List of currently online users
    const [onlineUsers, setOnlineUsers] = useState([]);
    // Reference to messages container and end for auto-scroll
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

    // Initialize WebSocket connection once
    useEffect(() => {
        const ws = new WebSocket("ws://localhost:3001/ws");
        setWebSocket(ws);
        
        return () => {
            ws.close();
        };
    }, []);

    // Setup WebSocket event handlers and lifecycle management
    useEffect(() => {
        if (!webSocket) return;

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
              const ws = new WebSocket("ws://localhost:3001/ws");
              setWebSocket(ws);
            }, 1000);
          };
      
          // Handle WebSocket errors
          webSocket.onerror = function (err) {
            console.log('Socket encountered error: ', err.message, 'Closing socket');
            setWebSocketReady(false);
            webSocket.close();
          };
    }, [webSocket, userId]);

    // Track scroll position to avoid forcing the user back down
    const handleScroll = useCallback(() => {
        const el = messagesContainerRef.current;
        if (!el) return;
        // if we're within 50px of the bottom, keep auto‑scroll on
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
        setAutoScrollEnabled(nearBottom);
    }, []);

    // Auto-scroll to bottom only when permitted
    useEffect(() => {
        if (autoScrollEnabled) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, autoScrollEnabled]);

    /**
     * Handles sending a new message
     * Uses optimistic UI updates - message appears immediately before server confirmation
     */
    const onSend = useCallback(() => {
        if (newMessage.trim() !== '' && webSocketReady && webSocket) {
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
    }, [newMessage, webSocketReady, webSocket, userId]);

    // Memoized event handlers
    const handleInputChange = useCallback((e) => {
        setNewMessage(e.target.value);
    }, []);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    }, [onSend]);

    return (
        <div>
            {
                webSocketReady && userId && (
                    <div className="chat-container">
                        <ChatHeader userId={userId} onlineUsers={onlineUsers} />
                        <MessageList
                            messages={messages}
                            messagesEndRef={messagesEndRef}
                            containerRef={messagesContainerRef}
                            onScroll={handleScroll}
                        />
                        <ComposeBar 
                            newMessage={newMessage}
                            onSend={onSend}
                            handleInputChange={handleInputChange}
                            handleKeyDown={handleKeyDown}
                        />
                    </div>
                )
            }
            
        </div>
    );
}