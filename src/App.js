import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ManagementDashboard from './pages/ManagementDashboard';
import csvFile_iggh_ltc from './data/iggh-ltc.csv';
import csvFile_the_wellington_ltc from './data/the-wellington-ltc.csv';
import csvFile_mill_creek_care from './data/mill-creek-care.csv';
import csvFile_niagara_ltc from './data/niagara-ltc.csv';
// import TestFirebase from './components/TestFirebase';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />}></Route>
        <Route path="/responsive" element={<ManagementDashboard />}></Route>
        <Route
          path="/the-wellington-ltc"
          element={<Dashboard title={'The Wellington LTC Falls Dashboard'} csvFile={csvFile_the_wellington_ltc} />}
        ></Route>
        <Route
          path="/iggh-ltc"
          element={<Dashboard title={'Ina Grafton Gage Home Falls Dashboard'} csvFile={csvFile_iggh_ltc} />}
        ></Route>
        <Route
          path="/mill-creek-care"
          element={<Dashboard title={'Mill Creek Care Center Falls Dashboard'} csvFile={csvFile_mill_creek_care} />}
        ></Route>
        <Route
          path="/niagara-ltc"
          element={<Dashboard title={'Niagara LTC Falls Dashboard'} csvFile={csvFile_niagara_ltc} />}
        ></Route>
      </Routes>
    </Router>
  );
}

export default App;
