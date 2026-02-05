/**
 * Login Component
 * 
 * Simple username-based authentication screen.
 * No password required - this is a demo chat application.
 * On submit, sets the userId in parent component to enter chat.
 */

import './styles.css';

export default function Login({ setUserId }) {
    /**
     * Handles login form submission
     * Extracts username from form and passes to parent component
     */
    function submit(event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);
        const userId = formData.get('username');

        // Set userId in parent App component to switch to Chat view
        setUserId(userId);
    }

    return (
        <div className="login-wrapper">
            <form
                onSubmit={submit}
                className="login-form"
            >
                <h1 className="login-title">WebSocket Chat</h1>
                <p className="login-subtitle">Enter your username to start chatting</p>
                <input 
                    className="login-input" 
                    name="username" 
                    placeholder="Username"
                    required
                    autoFocus
                />
                <button className="login-btn" type="submit">Join Chat</button>
            </form>
        </div>
    )
}