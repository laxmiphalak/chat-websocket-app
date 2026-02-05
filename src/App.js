/**
 * Main App Component
 * 
 * Root component that manages authentication state.
 * Shows Login screen if no userId is set, otherwise shows Chat interface.
 */

import './App.css';
import Chat from './modules/Chat';
import Login from './modules/Login';
import { useState, useEffect } from 'react';

function App() {
  // Store the current user's ID (null = not logged in)
  const [userId, setUserId] = useState(null);

  return (
    <div className="App">
      {
        userId !== null ? (
          <Chat userId={userId}/>
        ) : (
          <Login setUserId={setUserId}/>
        )
      }
    </div>
  );
}

export default App;
