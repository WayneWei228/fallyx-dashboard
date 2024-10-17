import './App.css';
import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ManagementDashboard from './pages/ManagementDashboard';
// import TestFirebase from './components/TestFirebase';
import * as Papa from 'papaparse';
import { db } from './firebase';
import { ref, update, get, off, onValue } from 'firebase/database';
import PrivateRoute from './components/PrivateRoute';
import Unauthorized from './pages/Unauthorized';
import UpdateData from './pages/UpdateData';


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

  const fetchDataFromFirebase = (key) => {
    const dataRef = ref(db, key); // Reference the key in Firebase

    // Use Firebase's onValue to listen for real-time updates
    const listener = onValue(
      dataRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const fetchedData = snapshot.val();
          const fetchedArray = Object.values(fetchedData); // Convert object to array if needed

          // Update the state with the new data
          setData((prevData) => ({
            ...prevData,
            [key]: fetchedArray,
          }));
        } else {
          console.log(`${key} data not found.`);
        }
      },
      (error) => {
        console.error(`Error fetching ${key} data from Firebase:`, error);
      }
    );

    // Return the listener so it can be turned off later
    return listener;
  };

  // const fetchAndParseCSV = async (csvFile, key) => {
  //   fetch(csvFile)
  //     .then((response) => response.text())
  //     .then((text) => {
  //       Papa.parse(text, {
  //         header: true,
  //         skipEmptyLines: true,
  //         complete: function (results) {
  //           setData((prevData) => ({
  //             ...prevData,
  //             [key]: results.data,
  //           }));
  //         },
  //       });
  //     });
  // };

  // useEffect(() => {
  //   // 依次解析所有 CSV 文件
  //   fetchAndParseCSV(csvFile_niagara_ltc, 'niagara');
  //   fetchAndParseCSV(csvFile_the_wellington_ltc, 'wellington');
  //   fetchAndParseCSV(csvFile_mill_creek_care, 'millCreek');
  //   fetchAndParseCSV(csvFile_iggh_ltc, 'iggh');
  // }, []);

  useEffect(() => {
    // Set up listeners for all datasets
    const niagaraListener = fetchDataFromFirebase('niagara');
    const wellingtonListener = fetchDataFromFirebase('wellington');
    const millCreekListener = fetchDataFromFirebase('millCreek');
    const igghListener = fetchDataFromFirebase('iggh');

    // Cleanup function to remove the listeners when the component unmounts
    return () => {
      off(ref(db, 'niagara'), niagaraListener);
      off(ref(db, 'wellington'), wellingtonListener);
      off(ref(db, 'millCreek'), millCreekListener);
      off(ref(db, 'iggh'), igghListener);
    };
  }, []);

  const handleUpdateCSV = (index, newValue, name, isPhycicianRef) => {
    const rowRef = ref(db, `${name}/row-${index}`);
    // Create an object to hold the updates
    let updates = {};

    // Update either the "physicianRef" or "poaContacted" field based on the flag
    if (isPhycicianRef) {
      updates = { physicianRef: newValue };
    } else {
      updates = { poaContacted: newValue };
    }

    // Use Firebase's update method to update the specific field in the database
    update(rowRef, updates)
      .then(() => {
        console.log('Data updated successfully in Firebase');
      })
      .catch((error) => {
        console.error('Error updating data:', error);
      });
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />}></Route>
        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* <Route path="/test" element={<TestFirebase />} /> */}

        <Route
          path="/update-data"
          element={
            <PrivateRoute rolesRequired={['update-data']}>
              <UpdateData />
            </PrivateRoute>
          }
        />
        <Route
          path="/responsive"
          element={
            <PrivateRoute rolesRequired={['responsive']}>
              <ManagementDashboard dataLengths={dataLengths} />
            </PrivateRoute>
          }
        ></Route>
        <Route
          path="/the-wellington-ltc"
          element={
            <PrivateRoute rolesRequired={['the-wellington-ltc', 'responsive']}>
              <Dashboard
                name="wellington"
                title={'The Wellington LTC Falls Dashboard'}
                data={data.wellington}
                handleUpdateCSV={handleUpdateCSV}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/niagara-ltc"
          element={
            <PrivateRoute rolesRequired={['niagara-ltc', 'responsive']}>
              <Dashboard
                name="niagara"
                title="Niagara LTC Falls Dashboard"
                data={data.niagara}
                handleUpdateCSV={handleUpdateCSV}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/mill-creek-care"
          element={
            <PrivateRoute rolesRequired={['mill-creek-care', 'responsive']}>
              <Dashboard
                name="millCreek"
                title="Mill Creek Care Center Falls Dashboard"
                data={data.millCreek}
                handleUpdateCSV={handleUpdateCSV}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/iggh-ltc"
          element={
            <PrivateRoute rolesRequired={['iggh-ltc', 'responsive']}>
              <Dashboard
                name="iggh"
                title="Ina Grafton Gage Home Falls Dashboard"
                data={data.iggh}
                handleUpdateCSV={handleUpdateCSV}
              />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
