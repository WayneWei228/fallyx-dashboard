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
  // console.log('App is re-rendered');
  const [data, setData] = useState({
    niagara: [],
    wellington: [],
    millCreek: [],
    iggh: [],
  });

  // console.log(data);

  const dataLengths = {
    niagara: data.niagara.length,
    wellington: data.wellington.length,
    millCreek: data.millCreek.length,
    iggh: data.iggh.length,
  };

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

  const handleUpdateCSV = (index, newValue, name, isPhycicianRef) => {
    // Create a deep copy of the data object
    const updatedWholeData = { ...data };

    // Create a new array for the specific dataset (e.g., "niagara") and update the relevant entry
    const updatedData = [...updatedWholeData[name]];
    if (isPhycicianRef) {
      updatedData[index] = { ...updatedData[index], physicianRef: newValue }; // Ensure immutability
    } else {
      updatedData[index] = {...updatedData[index], poaContacted: newValue};
    }

    // Update the dataset in the copied object
    updatedWholeData[name] = updatedData;

    // Set the new state with the updated data
    setData(updatedWholeData);
  };

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
              name="wellington"
              title={'The Wellington LTC Falls Dashboard'}
              csvFile={csvFile_the_wellington_ltc}
              data={data.wellington}
              handleUpdateCSV={handleUpdateCSV}
            />
          }
        ></Route>
        <Route
          path="/niagara-ltc"
          element={
            <Dashboard
              name="niagara"
              title="Niagara LTC Falls Dashboard"
              data={data.niagara}
              handleUpdateCSV={handleUpdateCSV}
            />
          }
        />
        <Route
          path="/mill-creek-care"
          element={
            <Dashboard
              name="millCreek"
              title="Mill Creek Care Center Falls Dashboard"
              data={data.millCreek}
              handleUpdateCSV={handleUpdateCSV}
            />
          }
        />
        <Route
          path="/iggh-ltc"
          element={
            <Dashboard
              name="iggh"
              title="Ina Grafton Gage Home Falls Dashboard"
              data={data.iggh}
              handleUpdateCSV={handleUpdateCSV}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
