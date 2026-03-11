/**
 * ComposeBar Component
 * 
 * Message input and send button
 */

import { memo } from 'react';

function ComposeBar({ newMessage, onSend, handleInputChange, handleKeyDown }) {
    return (
        <div className="compose">
            <input
                className="compose-input"
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Message"
            />
            <button className="compose-send" onClick={onSend} aria-label="Send message">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
            </button>
        </div>
    );
}

export default memo(ComposeBar);
