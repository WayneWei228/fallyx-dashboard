import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ManagementDashboard from './pages/ManagementDashboard';
// import TestFirebase from './components/TestFirebase';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />}></Route>
          {/* <Route path="/dashboard" element={<Dashboard />}></Route> */}
          <Route path="/managementDashboard" element={<ManagementDashboard />}></Route>
          <Route path="/niagara-ltc" element={<Navigate to="/niagara-ltc.html" replace />} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
