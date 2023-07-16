import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { socket } from './socket';

interface User {
  id: number;
  username: string;
  email: string;
}

axios.defaults.baseURL = 'http://127.0.0.1:3000';

function App() {

  const [users, setUsers] = useState<User[]>([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    axios.get('/users')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  socket.on('connect', () => {
    console.log('connected');
  });

  const sendMsg = () => {

    socket.emit('sendMessage', { content: msg });
    console.log('sent');
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <input
          name="send"
          type="text"
          onChange={(e) => setMsg(e.target.value)}
        />
        <button onClick={() => sendMsg()}>Envoyer</button>
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.username}</li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
