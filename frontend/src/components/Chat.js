import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [users, setUsers] = useState([]); // New state for user list
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) window.location.href = '/login';

    const fetchChats = async () => {
      const { data } = await axios.get('http://localhost:5000/api/chats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setChats(data);
    };
    fetchChats();

    const fetchUsers = async () => {
      const { data } = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsers(data.filter(u => u._id !== user.id)); // Exclude current user
    };
    fetchUsers();

    socket.emit('join', { userId: user.id });

    socket.on('message', (msg) => {
      if (msg.chat === selectedChat?._id) setMessages((prev) => [...prev, msg]);
    });

    socket.on('onlineStatus', ({ userId, online }) => {
      setOnlineUsers((prev) => ({ ...prev, [userId]: online }));
    });

    return () => socket.disconnect();
  }, [user, selectedChat]);

  const selectChat = async (chat) => {
    setSelectedChat(chat);
    socket.emit('joinChat', chat._id);
    const { data } = await axios.get(`http://localhost:5000/api/messages/${chat._id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setMessages(data);
  };

  const sendMessage = async () => {
    const formData = new FormData();
    formData.append('content', message);
    formData.append('chatId', selectedChat._id);
    if (file) formData.append('file', file);

    try {
      await axios.post('http://localhost:5000/api/message', formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      setMessage('');
      setFile(null);
    } catch (err) {
      // eslint-disable-next-line no-restricted-globals
      alert(err); // Suppressed for now
    }
  };

  const createGroup = async () => {
    const selectedUserIds = prompt('Enter user IDs to add (comma separated, or cancel to select from list)');
    if (selectedUserIds) {
      const usersArray = selectedUserIds.split(',').map(id => id.trim());
      const name = prompt('Group name');
      await axios.post('http://localhost:5000/api/chat', { isGroup: true, name, users: usersArray }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    } else {
      // eslint-disable-next-line no-restricted-globals
      const selectedIds = [];
      users.forEach(u => {
        // eslint-disable-next-line no-restricted-globals
        if (confirm(`Add ${u.username} (${u.email}) to group?`)) {
          selectedIds.push(u._id);
        }
      });
      if (selectedIds.length > 0) {
        const name = prompt('Group name');
        await axios.post('http://localhost:5000/api/chat', { isGroup: true, name, users: selectedIds }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      }
    }
    window.location.reload();
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f0f0' }}>
      <div style={{ width: '30%', borderRight: '1px solid #ccc', padding: '10px', backgroundColor: '#fff', overflowY: 'auto' }}>
        <button
          onClick={createGroup}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Create Group
        </button>
        <ul style={{ listStyle: 'none', padding: '0' }}>
          {chats.map((chat) => (
            <li
              key={chat._id}
              onClick={() => selectChat(chat)}
              style={{
                padding: '10px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                backgroundColor: selectedChat?._id === chat._id ? '#e9ecef' : 'transparent'
              }}
            >
              {chat.isGroup ? chat.name : chat.users.find(u => u._id !== user.id)?.username}
              {chat.users.map(u => onlineUsers[u._id] ? ' (Online)' : ' (Offline)')}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ width: '70%', padding: '10px', backgroundColor: '#fff', overflowY: 'auto' }}>
        {selectedChat && (
          <>
            <div style={{ height: '70vh', overflowY: 'auto', borderBottom: '1px solid #ccc', padding: '10px' }}>
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  style={{
                    margin: '10px 0',
                    padding: '8px',
                    backgroundColor: msg.sender._id === user.id ? '#007bff' : '#e9ecef',
                    color: msg.sender._id === user.id ? '#fff' : '#000',
                    borderRadius: '5px',
                    maxWidth: '60%',
                    wordWrap: 'break-word'
                  }}
                >
                  <strong>{msg.sender.username}:</strong> {msg.content}
                  {msg.file && <a href={`http://localhost:5000/${msg.file}`} download style={{ color: msg.sender._id === user.id ? '#fff' : '#007bff' }}> File</a>}
                </div>
              ))}
            </div>
            <div style={{ padding: '10px', display: 'flex', gap: '10px' }}>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type message"
                style={{ flex: '1', padding: '8px', border: '1px solid #ccc', borderRadius: '5px' }}
              />
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ padding: '8px' }}
              />
              <button
                onClick={sendMessage}
                style={{ padding: '8px 15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;