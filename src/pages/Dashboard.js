import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import '../styles/Dashboard.css';
import { ref, update } from 'firebase/database';
import { db } from '../firebase';
import * as XLSX from 'xlsx/xlsx.mjs';
import { useNavigate } from 'react-router-dom';
import 'reactjs-popup/dist/index.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  // const [dbData, setDBData] = useState([]);
  // const [analysisData, setAnalysisData] = useState([]);
  const [goal, setGoal] = useState(0);
  const [chart, setChart] = useState();
  const [analysisChart, setAnalysisChart] = useState();
  const [gaugeChart, setGaugeChart] = useState(true);
  // const [alert, setAlert] = useState(false);
  // const [hirFalls, setHIRFalls] = useState(5);

  useEffect(() => {
    // const dataRef = ref(db, 'data/');

    // onValue(
    //   dataRef,
    //   (snapshot) => {
    //     setDBData(snapshot.val());
    //     if (!!snapshot.val()) {
    //       console.log(snapshot.val());
    //     }
    //   },
    //   {
    //     onlyOnce: true,
    //   }
    // );

    // const goalRef = ref(db, 'falls_goal/');

    // onValue(
    //   goalRef,
    //   (snapshot) => {
    //     console.log(snapshot.val());
    //     setGoal(snapshot.val());
    //     if (!!snapshot.val()) {
    //       console.log(snapshot.val());
    //     }
    //   },
    //   {
    //     onlyOnce: true,
    //   }
    // );

    // const analysisRef = ref(db, 'tracking_table_data/');

    // onValue(
    //   analysisRef,
    //   (snapshot) => {
    //     setAnalysisData(snapshot.val());
    //     if (!!snapshot.val()) {
    //       console.log(snapshot.val());
    //     }
    //   },
    //   {
    //     onlyOnce: true,
    //   }
    // );

    let chartStatus = Chart.getChart('gaugeChart');
    if (chartStatus != undefined) {
      chartStatus.destroy();
    }

    setChart(
      new Chart(document.getElementById('gaugeChart'), {
        type: 'doughnut',
        data: {
          datasets: [
            {
              data: [7, 13],
              backgroundColor: ['rgba(76, 175, 80, 0.8)', 'rgba(200, 200, 200, 0.2)'],
              circumference: 180,
              rotation: 270,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '80%',
          plugins: {
            tooltip: { enabled: false },
            legend: { display: false },
          },
        },
      })
    );

    chartStatus = Chart.getChart('fallsAnalysisChart');
    if (chartStatus != undefined) {
      chartStatus.destroy();
    }

    setAnalysisChart(
      new Chart(document.getElementById('fallsAnalysisChart').getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
          datasets: [
            {
              label: 'Number of Falls',
              data: [2, 2, 2, 1],
              backgroundColor: 'rgba(76, 175, 80, 0.6)',
              borderColor: 'rgb(76, 175, 80)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      })
    );
  }, []);

  const updateFallsChart = async () => {
    const timeRange = document.getElementById('fallsTimeRange').value;

    switch (timeRange) {
      case 'current':
        await setGaugeChart(true);
        chart.destroy();
        setChart(
          new Chart(document.getElementById('gaugeChart'), {
            type: 'doughnut',
            data: {
              datasets: [
                {
                  data: [7, 13],
                  backgroundColor: ['rgba(76, 175, 80, 0.8)', 'rgba(200, 200, 200, 0.2)'],
                  circumference: 180,
                  rotation: 270,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '80%',
              plugins: {
                tooltip: { enabled: false },
                legend: { display: false },
              },
            },
          })
        );
        break;
      case '3months':
        await setGaugeChart(false);
        chart.destroy();
        setChart(
          new Chart(document.getElementById('fallsLineChart').getContext('2d'), {
            type: 'line',
            data: {
              labels: months.slice(2, 5), // Will be populated based on selected time range
              datasets: [
                {
                  label: 'Number of Falls',
                  data: dbData.slice(3, 6), // Will be populated based on selected time range
                  borderColor: 'rgb(76, 175, 80)',
                  tension: 0.1,
                },
              ],
            },
            options: {
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
            },
          })
        );
        break;
      case '6months':
        await setGaugeChart(false);
        chart.destroy();
        setChart(
          new Chart(document.getElementById('fallsLineChart').getContext('2d'), {
            type: 'line',
            data: {
              labels: months.slice(2, 8), // Will be populated based on selected time range
              datasets: [
                {
                  label: 'Number of Falls',
                  data: dbData.slice(3, 9), // Will be populated based on selected time range
                  borderColor: 'rgb(76, 175, 80)',
                  tension: 0.1,
                },
              ],
            },
            options: {
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
            },
          })
        );
        break;
    }
  };

  const downloadTable = () => {
    var table = document.getElementById('fallsTable');
    var wb = XLSX.utils.table_to_book(table, { sheet: 'Falls Tracking' });
    XLSX.writeFile(wb, 'Falls_Tracking_August.xlsx');
  };

  const updateFalls = () => {
    setAlert(false);
    let newGoal;

    do {
      newGoal = parseInt(prompt('Please enter the new Falls Goal'), 10);
    } while (isNaN(newGoal));

    const goalRef = ref(db);
    const updates = { 'falls_goal/': newGoal };
    update(goalRef, updates)
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });

    setGoal(newGoal);
  };

  // const updateClickHandler = () => {};

  const updateAnalysisChart = async () => {
    const analysisType = document.getElementById('fallsAnalysisType').value;
    const header = document.getElementById('analysisHeader');
    const timeRange = document.getElementById('analysisTimeRange').value;
    let newLabels = [];
    let newData = [];

    const multiplier = timeRange === 'current' ? 1 : timeRange === '3months' ? 3 : 6;

    switch (analysisType) {
      case 'timeOfDay':
        header.textContent = 'Falls by Time of Day';
        newLabels = ['Morning', 'Afternoon', 'Evening', 'Night'];
        newData = [2, 2, 2, 1].map((val) => val * multiplier);
        break;
      case 'location':
        header.textContent = 'Falls by Location';
        newLabels = ['Bedroom', 'Bathroom', 'Common Area', 'Hallway'];
        newData = [3, 2, 1, 1].map((val) => val * multiplier);
        break;
      case 'injuries':
        header.textContent = 'Falls by Injury Severity';
        newLabels = ['No Injury', 'Minor', 'Moderate', 'Severe'];
        newData = [4, 2, 1, 0].map((val) => val * multiplier);
        break;
      case 'hir':
        switch (timeRange) {
          case 'current':
            header.textContent = 'Falls by HIR';
            newLabels = ['September'];
            newData = [2];
            break;
          case '3months':
            header.textContent = 'Falls by HIR';
            newLabels = ['July', 'August', 'September'];
            newData = [2, 1, 2];
            break;
          case '6months':
            header.textContent = 'Falls by HIR';
            newLabels = ['April', 'May', 'June', 'July', 'August', 'September'];
            newData = [1, 2, 3, 0, 1, 2];
            break;
        }
        break;
      case 'recurring':
        switch (timeRange) {
          case 'current':
            header.textContent = 'Falls by HIR';
            newLabels = ['September'];
            newData = [1];
            break;
          case '3months':
            header.textContent = 'Falls by HIR';
            newLabels = ['July', 'August', 'September'];
            newData = [0, 1, 2];
            break;
          case '6months':
            header.textContent = 'Falls by HIR';
            newLabels = ['April', 'May', 'June', 'July', 'August', 'September'];
            newData = [0, 1, 4, 3, 1, 2];
            break;
        }
        break;
    }

    analysisChart.destroy();

    setAnalysisChart(
      new Chart(document.getElementById('fallsAnalysisChart').getContext('2d'), {
        type: 'bar',
        data: {
          labels: newLabels,
          datasets: [
            {
              label: 'Number of Falls',
              data: newData,
              backgroundColor: 'rgba(76, 175, 80, 0.6)',
              borderColor: 'rgb(76, 175, 80)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      })
    );
  };

  const logout = () => {
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <h1>The Wellington LTC Falls Dashboard</h1>
      <button className="logout-button" onClick={logout}>
        Log Out
      </button>

      <div className="chart-container">
        <div className="chart">
          <div className="gauge-container">
            <h2 style={{ paddingTop: '7.5px' }} id="Header">
              Falls Overview
            </h2>
            <select id="fallsTimeRange" onChange={updateFallsChart}>
              <option value="current">This Month</option>
              <option value="3months">Past 3 Months</option>
              <option value="6months">Past 6 Months</option>
            </select>
            {gaugeChart ? (
              <div id="gaugeContainer">
                <div className="gauge">
                  <canvas id="gaugeChart"></canvas>
                  <div className="gauge-value">7</div>
                  <div className="gauge-label">falls this month</div>
                  <div className="gauge-goal">
                    Goal: <span id="fallGoal">{goal}</span>
                  </div>
                  <br />
                  <div className="gauge-scale">
                    <span>2</span>
                    <span>20</span>
                  </div>
                </div>
              </div>
            ) : (
              <div id="lineChartContainer">
                <canvas id="fallsLineChart"></canvas>
              </div>
            )}
            <br />
            <br />
            {gaugeChart ? (
              <div>
                <button className="update-button" id="update-button" onClick={updateFalls}>
                  Update Falls Goal
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>

        <div className="chart">
          <h2 id="analysisHeader">Falls by Time of Day</h2>
          <h4 id="analysisHeader">Falls by HIR: {hirFalls}</h4>
          <select id="fallsAnalysisType" onChange={updateAnalysisChart}>
            <option value="timeOfDay">Time of Day</option>
            <option value="location">Location</option>
            <option value="injuries">Injuries</option>
            <option value="hir">Falls by HIR</option>
            <option value="recurring">Residents w/ Recurring Falls</option>
          </select>
          <select id="analysisTimeRange" onChange={updateAnalysisChart}>
            <option value="current">Current Month</option>
            <option value="3months">Past 3 Months</option>
            <option value="6months">Past 6 Months</option>
          </select>
          <canvas id="fallsAnalysisChart"></canvas>
        </div>
      </div>

      <div className="table-header">
        <h2>Falls Tracking Table: August 2024</h2>
        <button className="download-button" onClick={downloadTable}>
          Download as Excel
        </button>
      </div>
      <table id="fallsTable">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Location</th>
            <th>Nature of Fall/Cause</th>
            <th>HIR</th>
            <th>Injury</th>
            <th>Hospital</th>
            <th>PT Ref</th>
            <th>POA Contacted</th>
            <th>Physician Ref</th>
            <th>Incident Report Written</th>
            <th>3 Post Fall Notes in 72 Hours</th>
            <th>Interventions</th>
          </tr>
        </thead>
        <tbody id="fallsTableBody">
          {analysisData.map((item) => {
            return (
              <tr>
                <td>{item.date}</td>
                <td>{item.time}</td>
                <td>{item.location}</td>
                <td>{item.cause}</td>
                <td>{item.hir}</td>
                <td>{item.injury}</td>
                <td>{item.hospital}</td>
                <td>{item.ptRef}</td>
                <td>{item.poaContacted}</td>
                <td>{item.physicianRef}</td>
                <td>
                  <input type="checkbox" checked={item.incidentReportWritten} disabled></input>
                </td>
                <td>
                  <input type="checkbox" checked={item.postFallNotes} disabled></input>
                </td>
                <td>{item.review}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
