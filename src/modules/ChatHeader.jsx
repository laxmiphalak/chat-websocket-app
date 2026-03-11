/**
 * ChatHeader Component
 * 
 * Displays current user info and online users list
 */

import { memo } from 'react';

function ChatHeader({ userId, onlineUsers }) {
    return (
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
    );
}

export default memo(ChatHeader);
