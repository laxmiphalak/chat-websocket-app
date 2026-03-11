/**
 * MessageList Component
 * 
 * Displays scrollable list of chat messages
 */

import { memo } from 'react';

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
};

function MessageList({ messages, messagesEndRef, containerRef, onScroll }) {
    return (
        <div className="messages" ref={containerRef} onScroll={onScroll}>
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
            <div ref={messagesEndRef} />
        </div>
    );
}

export default memo(MessageList);
