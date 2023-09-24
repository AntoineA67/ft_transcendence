import React, { useEffect, useState } from 'react';
import { ChatSocketProvider, useChatSocket } from '../utils/ChatSocketProvider';
import '../styles/Chat.css';

export default function Chat() {
  const chatSocket = useChatSocket();
  const [messages, setMessages] = useState<string[]>([]);
  const [currentRoom, setCurrentRoom] = useState(''); // Set initial value to an empty string
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Check if chatSocket exists before adding event listeners
    if (chatSocket) {
      // Handle incoming chat messages
      chatSocket.on('chatMessage', (message) => {
        // Update the state with the new message
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      // Clean up event listeners when the component unmounts
      return () => {
        chatSocket.off('chatMessage');
      };
    }
  }, [chatSocket]);

  const sendMessage = () => {
    // Send a new chat message to the server
    chatSocket.emit('sendChatMessage', newMessage);
    setNewMessage('');
  };

  const rooms = ['Room 1', 'Room 2', 'Room 3']; // Example list of rooms

  return (
    <div className="chat-container">
      <div className="rooms-column">
        <h1 className="chat-header">Chat Rooms</h1>
        <ul className="room-list">
          {rooms.map((room, index) => (
            <li
              key={index}
              className={`room-item ${room === currentRoom ? 'active' : ''}`}
              onClick={() => setCurrentRoom(room)}
            >
              {room}
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-column">
        <h1 className="chat-header">Chat</h1>
        <div className="chat-messages">
          <ul>
            {messages.map((message, index) => (
              <li className="chat-message" key={index}>
                {message}
              </li>
            ))}
          </ul>
        </div>
        <div className="chat-input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
          />
          <button onClick={sendMessage} className="chat-send-button">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
