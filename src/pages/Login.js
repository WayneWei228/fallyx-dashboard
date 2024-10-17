import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { db, auth } from '../firebase';
import '../styles/Login.css';
import fallyxLogo from '../assets/fallyxlogo.jpeg';
import { Link } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // const handleLogin = async () => {
  //   try {
  //     const usersRef = ref(db, 'users/');
  //     const snapshot = await get(usersRef);
  //     const users = snapshot.val();

  //     if (users) {
  //       const user = Object.values(users).find((user) => user.email === username && user.password === password);
  //       if (user) {
  //         navigate(user.redirect);
  //         // Store login state in localStorage
  //         // localStorage.setItem('isLoggedIn', 'true');
  //         // localStorage.setItem('loggedInUser', username);

  //         // window.location.href = user.redirect;
  //         // console.log(user.redirect);
  //       } else {
  //         setErrorMessage('Invalid email or password');
  //       }
  //     } else {
  //       setErrorMessage('No users found');
  //     }
  //   } catch (error) {
  //     setErrorMessage('Error logging in');
  //     console.error(error);
  //   }
  // };

  const handleLogin = (event) => {
    if (event) {
      event.preventDefault();
    }
    const fakeEmail = `${username}@example.com`; // 将用户名伪装成邮箱格式

    // 登录 Firebase
    signInWithEmailAndPassword(auth, fakeEmail, password)
      .then((userCredential) => {
        // 登录成功
        const user = userCredential.user;
        // console.log('User logged in:', user);
        setErrorMessage(''); // 清空错误消息

        const userRef = ref(db, `users/${user.uid}`);
        get(userRef).then((snapshot) => {
          if (snapshot.exists()) {
            const role = snapshot.val().role;
            navigate('/' + role);
          }
        });
      })
      .catch((error) => {
        console.error('Error during login:', error);
        setErrorMessage('Login failed. Please check your credentials.');
      });
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              document.getElementById('login-password').focus(); // 当按下Enter时跳转到密码输入框
            }
          }}
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleLogin(); // 当按下Enter时直接登录
            }
          }}
        />
      </div>

      {errorMessage && <p className="login-error-message">{errorMessage}</p>}

      <button className="login-button" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}
