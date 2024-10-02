import React from 'react';
import { get, getDatabase, ref } from 'firebase/database';
import { db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

import '../styles/Dashboard.css';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = React.useState();
  const [password, setPassword] = React.useState();
  const navigate = useNavigate();

  const login = async () => {
    const usersRef = ref(db, 'users/');
    const snapshot = await get(usersRef);
    const users = snapshot.val();
    console.log(users);
    
    if (users) {
      let userFound = false;
      Object.values(users).forEach((user) => {
        if (user.username === username && user.password === password) {
          userFound = true;
          console.log('Login successful');
          navigate('/managementDashboard');
        }
      });
      if (!userFound) {
        console.log('Invalid username or password');
      }
    } else {
      console.log('No users found');
    }
  };


  
  return (
    <div className="dashboard">
      <div className="gauge-container">
        <h1>Login</h1>
        <h4>Username</h4>
        <input
          type="text"
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        ></input>
        <h4>Password</h4>
        <input
          type="password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        ></input>
        <br></br>
        <br></br>
        <button className="update-button" onClick={login}>
          Login
        </button>
      </div>
    </div>
  );
}
