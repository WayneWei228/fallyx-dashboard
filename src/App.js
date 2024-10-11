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
          <Route path="/responsive" element={<ManagementDashboard />}></Route>
          <Route
            path="/the-wellington-ltc"
            element={<Dashboard title={'The Wellington LTC Falls Dashboard'} />}
          ></Route>
          <Route path="/iggh-ltc" element={<Dashboard title={'Ina Grafton Gage Home Falls Dashboard'} />}></Route>
          <Route
            path="/mill-creek-care"
            element={<Dashboard title={'Mill Creek Care Center Falls Dashboard'} />}
          ></Route>
          <Route path="/niagara-ltc" element={<Dashboard title={'Niagara LTC Falls Dashboard'} />}></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
