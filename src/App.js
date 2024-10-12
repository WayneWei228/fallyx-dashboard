import './App.css';
import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ManagementDashboard from './pages/ManagementDashboard';
import csvFile_iggh_ltc from './data/iggh-ltc.csv';
import csvFile_the_wellington_ltc from './data/the-wellington-ltc.csv';
import csvFile_mill_creek_care from './data/mill-creek-care.csv';
import csvFile_niagara_ltc from './data/niagara-ltc.csv';
// import TestFirebase from './components/TestFirebase';
import * as Papa from 'papaparse';

function App() {
  const [data, setData] = useState({
    niagara: [],
    wellington: [],
    millCreek: [],
    iggh: [],
  });

  const [dataLengths, setDataLengths] = useState({
    niagara: 0,
    wellington: 0,
    millCreek: 0,
    iggh: 0,
  });

  const fetchAndParseCSV = async (csvFile, key) => {
    fetch(csvFile)
      .then((response) => response.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: function (results) {
            setData((prevData) => ({
              ...prevData,
              [key]: results.data,
            }));
            setDataLengths((prevLengths) => ({
              ...prevLengths,
              [key]: results.data.length,
            }));
          },
        });
      });
  };

  useEffect(() => {
    // 依次解析所有 CSV 文件
    fetchAndParseCSV(csvFile_niagara_ltc, 'niagara');
    fetchAndParseCSV(csvFile_the_wellington_ltc, 'wellington');
    fetchAndParseCSV(csvFile_mill_creek_care, 'millCreek');
    fetchAndParseCSV(csvFile_iggh_ltc, 'iggh');
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />}></Route>
        <Route path="/responsive" element={<ManagementDashboard dataLengths={dataLengths} />}></Route>
        <Route
          path="/the-wellington-ltc"
          element={
            <Dashboard
              title={'The Wellington LTC Falls Dashboard'}
              csvFile={csvFile_the_wellington_ltc}
              data={data.wellington}
            />
          }
        ></Route>
        <Route
          path="/niagara-ltc"
          element={
            <Dashboard
              title="Niagara LTC Falls Dashboard"
              data={data.niagara} 
            />
          }
        />
        <Route
          path="/mill-creek-care"
          element={
            <Dashboard
              title="Mill Creek Care Center Falls Dashboard"
              data={data.millCreek} 
            />
          }
        />
        <Route
          path="/iggh-ltc"
          element={
            <Dashboard
              title="Ina Grafton Gage Home Falls Dashboard"
              data={data.iggh} 
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
