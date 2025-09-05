import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';


const NavBar = ({ user, onLogout }) => {
  return (
    <nav style={{ backgroundColor: '#007bff', padding: '10px', color: '#fff' }}>
      <ul style={{ listStyle: 'none', display: 'flex', gap: '20px', margin: 0, padding: 0 }}>
        <li><Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Chat</Link></li>
        {!user && (
          <>
            <li><Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Login</Link></li>
            <li><Link to="/register" style={{ color: '#fff', textDecoration: 'none' }}>Register</Link></li>
          </>
        )}
        {user && (
          <li>
            <span style={{ marginRight: '10px' }}>Welcome, {user.username}</span>
            <button onClick={onLogout} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

const App = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const navigate = useNavigate();

  useEffect(() => {
    // Update user state when localStorage changes (e.g., after login)
    const handleStorageChange = () => setUser(JSON.parse(localStorage.getItem('user')) || null);
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div>
      <NavBar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Chat />} />
      </Routes>
    </div>
  );
};

export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}