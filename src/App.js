import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Management_Dashboard from './pages/Management_Dashboard';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/dashboard" element={<Dashboard />}></Route>
          <Route path="/Management_Dashboard" element={<Management_Dashboard />}></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
