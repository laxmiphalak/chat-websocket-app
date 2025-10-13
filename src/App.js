import './App.css';
import Chat from './modules/Chat';
import Login from './modules/Login';
import { useState, useEffect } from 'react';

function App() {
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
