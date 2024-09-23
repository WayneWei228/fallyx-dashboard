import React from 'react';
import { initializeApp } from 'firebase/app';
import { get, getDatabase, ref, onValue, update } from 'firebase/database';

import '../styles/Dashboard.css';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = React.useState();
  const [password, setPassword] = React.useState();
  const navigate = useNavigate();

  const firebaseConfig = {
    databaseURL: 'https://fallyx-demo-default-rtdb.firebaseio.com/',
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  const login = async () => {
    const usersRef = ref(db, 'users/');
    let users = [];

    onValue(
      usersRef,
      async (snapshot) => {
        console.log(snapshot.val());
        users = await snapshot.val();
        if (!!snapshot.val()) {
          console.log(snapshot.val());
        }
        users.forEach((user) => {
          console.log(user);
          if (user.username === username && user.password === password) {
            navigate('/Management_Dashboard');
          }
        });
      },
      {
        onlyOnce: true,
      }
    );

    console.log(users);
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
