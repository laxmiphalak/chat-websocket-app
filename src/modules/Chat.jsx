import { useState, useEffect } from 'react';
import './styles.css';

export default function Chat({ userId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [webSocketReady, setWebSocketReady] = useState(false);
    const [webSocket, setWebSocket] = useState(new WebSocket("ws://localhost:3001/ws"));

    useEffect(() => {
        webSocket.onopen = (e) => {
            setWebSocketReady(true);
        }

        webSocket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            setMessages((prevMessages) => [
                ...prevMessages,
                {...message, isSelf: message.sender === userId}
            ])
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
    }, [webSocket])

    const onSend = () => {
        if (newMessage.trim() !== '' && webSocketReady) {
            webSocket.send(JSON.stringify({
                type: 'message',
                text: newMessage,
                sender: userId
            }));
            setNewMessage('');
        }
    }

    if (webSocket && webSocketReady) {
        if (userId) {
            webSocket.send(JSON.stringify({type: 'setUserId', userId}));
        }
    }

    return (
        <div>
            {
                webSocketReady && (
                    <div>
                        <div>
                            {
                                messages.map((message, index) => (
                                    <div key={index}>{message.text}</div>
                                ))
                            }
                        </div>
                        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}/>
                        <button onClick={() => onSend()}>Send</button>
                    </div>
                )
            }
            
        </div>
    );
}