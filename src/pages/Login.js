import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, ref } from 'firebase/database';
import { db } from '../firebase';
import '../styles/Login.css';
import fallyxLogo from '../assets/fallyxlogo.jpeg';
import { Link } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const usersRef = ref(db, 'users/');
      const snapshot = await get(usersRef);
      const users = snapshot.val();

      if (users) {
        const user = Object.values(users).find((user) => user.email === username && user.password === password);
        if (user) {
          navigate(user.redirect);
          // Store login state in localStorage
          // localStorage.setItem('isLoggedIn', 'true');
          // localStorage.setItem('loggedInUser', username);

          // window.location.href = user.redirect;
          // console.log(user.redirect);
        } else {
          setErrorMessage('Invalid email or password');
        }
      } else {
        setErrorMessage('No users found');
      }
    } catch (error) {
      setErrorMessage('Error logging in');
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <img src={fallyxLogo} alt="Logo" className="logoLogin" />
      <h2 className="login-title">Falls Analysis Tool Login</h2>

      <div className="login-input-group">
        <label htmlFor="login-email">Username</label>
        <input
          id="login-email"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
        />
      </div>

      <div className="login-input-group">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
      </div>

      {errorMessage && <p className="login-error-message">{errorMessage}</p>}

      <button className="login-button" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}
