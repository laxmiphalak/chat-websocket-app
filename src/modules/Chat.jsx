import { useState, useEffect } from 'react';
import './styles.css';

export default function Chat({ userId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [webSocketReady, setWebSocketReady] = useState(false);
    const [webSocket, setWebSocket] = useState(new WebSocket("ws://localhost:3001/ws"));
    const [onlineUsers, setOnlineUsers] = useState([]);

    const formatTime = (ts) => {
        try {
            return new Date(ts).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        } catch (e) {
            return '';
        }
    }

    useEffect(() => {
        const sendUserId = () => {
            if (userId && !webSocket._userIdSent && webSocket.readyState === WebSocket.OPEN) {
                webSocket.send(JSON.stringify({type: 'setUserId', userId}));
                webSocket._userIdSent = true;
            }
        };
        
        webSocket.onopen = (e) => {
            setWebSocketReady(true);
            sendUserId();
        }
        
        // If already open, send immediately
        if (webSocket.readyState === WebSocket.OPEN && !webSocket._userIdSent) {
            setWebSocketReady(true);
            sendUserId();
        }

        webSocket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            
            // Handle online users list update
            if (message.type === 'users') {
                setOnlineUsers(message.users || []);
                return;
            }
            
            message.timestamp = message.timestamp || Date.now();

            setMessages((prev) => {
                // If server echoes with localId, replace pending message
                if (message.localId) {
                    const idx = prev.findIndex(m => m.localId === message.localId);
                    if (idx !== -1) {
                        const copy = [...prev];
                        copy[idx] = {...message, isSelf: message.sender === userId};
                        return copy;
                    }
                }

                // If sender is current user, try to dedupe by matching a pending optimistic message
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

        webSocket.onclose = function (event) {
            setWebSocketReady(false);
            setTimeout(() => {
              setWebSocket(new WebSocket("ws://localhost:3001/ws"));
            }, 1000);
          };
      
          webSocket.onerror = function (err) {
            console.log('Socket encountered error: ', err.message, 'Closing socket');
            setWebSocketReady(false);
            webSocket.close();
          };
      
          return () => {
             webSocket.close();
          };
    }, [webSocket, userId])

    const onSend = () => {
        if (newMessage.trim() !== '' && webSocketReady) {
            const localId = 'local-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
            const optimistic = {
                localId,
                type: 'message',
                text: newMessage,
                sender: userId,
                timestamp: Date.now(),
                pending: true,
                isSelf: true
            };

            setMessages(prev => [...prev, optimistic]);

            // include localId and timestamp so server can echo it back if supported
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