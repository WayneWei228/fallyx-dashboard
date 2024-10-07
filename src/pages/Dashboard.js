import React, { useEffect, useState } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import '../styles/Dashboard.css';
import { ref, update } from 'firebase/database';
import { db } from '../firebase';
import * as XLSX from 'xlsx/xlsx.mjs';
import { useNavigate } from 'react-router-dom';
import 'reactjs-popup/dist/index.css';
import { threeMonthData } from '../data/TableData';

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

  // State variables
  const [dbData, setDBData] = useState([]);
  const [goal, setGoal] = useState(0);
  const [gaugeChartData, setGaugeChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [gaugeChartOptions, setGaugeChartOptions] = useState({});
  const [lineChartData, setLineChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [lineChartOptions, setLineChartOptions] = useState({});
  const [analysisChartData, setAnalysisChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [analysisChartOptions, setAnalysisChartOptions] = useState({});
  const [gaugeChart, setGaugeChart] = useState(true);
  const [hirFalls, setHIRFalls] = useState(5);
  const [fallsTimeRange, setFallsTimeRange] = useState('current');
  const [analysisType, setAnalysisType] = useState('timeOfDay');
  const [analysisTimeRange, setAnalysisTimeRange] = useState('current');
  const [analysisHeaderText, setAnalysisHeaderText] = useState('Falls by Time of Day');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Initialize data
    setDBData(
      threeMonthData
      // Add other data entries here...
    );

    setGoal(20);
    setHIRFalls(7);

    // Initialize gauge chart data and options
    setGaugeChartData({
      datasets: [
        {
          data: [0, 20],
          backgroundColor: ['rgba(76, 175, 80, 0.8)', 'rgba(200, 200, 200, 0.2)'],
          circumference: 180,
          rotation: 270,
        },
      ],
    });

    setGaugeChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '80%',
      plugins: {
        tooltip: { enabled: false },
        legend: { display: false },
      },
    });

    // Initialize analysis chart data and options
    setAnalysisChartData({
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
    });

    setAnalysisChartOptions({
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    });
  }, []);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dbData.slice(indexOfFirstItem, indexOfLastItem);

  const updateFallsChart = () => {
    const timeRange = fallsTimeRange;

    switch (timeRange) {
      case 'current':
        setGaugeChart(true);
        setGaugeChartData({
          datasets: [
            {
              data: [7, 13],
              backgroundColor: ['rgba(76, 175, 80, 0.8)', 'rgba(200, 200, 200, 0.2)'],
              circumference: 180,
              rotation: 270,
            },
          ],
        });
        break;
      case '3months':
        setGaugeChart(false);
        setLineChartData({
          labels: months.slice(2, 5),
          datasets: [
            {
              label: 'Number of Falls',
              data: [2, 3, 4],
              borderColor: 'rgb(76, 175, 80)',
              tension: 0.1,
            },
          ],
        });
        break;
      case '6months':
        setGaugeChart(false);
        setLineChartData({
          labels: months.slice(2, 8),
          datasets: [
            {
              label: 'Number of Falls',
              data: [1, 2, 3, 4, 3, 2],
              borderColor: 'rgb(76, 175, 80)',
              tension: 0.1,
            },
          ],
        });
        break;
      default:
        break;
    }
  };

  const downloadTable = () => {
    const table = document.getElementById('fallsTable');
    const wb = XLSX.utils.table_to_book(table, { sheet: 'Falls Tracking' });
    XLSX.writeFile(wb, 'Falls_Tracking_August.xlsx');
  };

  const updateFalls = () => {
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

  const updateAnalysisChart = () => {
    let newLabels = [];
    let newData = [];

    const multiplier = analysisTimeRange === 'current' ? 1 : analysisTimeRange === '3months' ? 3 : 6;

    switch (analysisType) {
      case 'timeOfDay':
        setAnalysisHeaderText('Falls by Time of Day');
        newLabels = ['Morning', 'Afternoon', 'Evening', 'Night'];
        newData = [2, 2, 2, 1].map((val) => val * multiplier);
        break;
      case 'location':
        setAnalysisHeaderText('Falls by Location');
        newLabels = ['Bedroom', 'Bathroom', 'Common Area', 'Hallway'];
        newData = [3, 2, 1, 1].map((val) => val * multiplier);
        break;
      case 'injuries':
        setAnalysisHeaderText('Falls by Injury Severity');
        newLabels = ['No Injury', 'Minor', 'Moderate', 'Severe'];
        newData = [4, 2, 1, 0].map((val) => val * multiplier);
        break;
      case 'hir':
        setAnalysisHeaderText('Falls by HIR');
        if (analysisTimeRange === 'current') {
          newLabels = ['September'];
          newData = [2];
        } else if (analysisTimeRange === '3months') {
          newLabels = ['July', 'August', 'September'];
          newData = [2, 1, 2];
        } else {
          newLabels = ['April', 'May', 'June', 'July', 'August', 'September'];
          newData = [1, 2, 3, 0, 1, 2];
        }
        break;
      case 'recurring':
        setAnalysisHeaderText('Residents with Recurring Falls');
        if (analysisTimeRange === 'current') {
          newLabels = ['September'];
          newData = [1];
        } else if (analysisTimeRange === '3months') {
          newLabels = ['July', 'August', 'September'];
          newData = [0, 1, 2];
        } else {
          newLabels = ['April', 'May', 'June', 'July', 'August', 'September'];
          newData = [0, 1, 4, 3, 1, 2];
        }
        break;
      default:
        break;
    }

    setAnalysisChartData({
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
    });
  };

  const logout = () => {
    navigate('/login');
  };

  useEffect(() => {
    updateFallsChart();
    updateAnalysisChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallsTimeRange, analysisType, analysisTimeRange]);

  return (
    <div className="dashboard">
      <h1>The Wellington LTC Falls Dashboard</h1>
      <button className="logout-button" onClick={logout}>
        Log Out
      </button>

      <div className="chart-container">
        <div className="chart">
          <div className="gauge-container">
            <h2 style={{ paddingTop: '7.5px' }}>Falls Overview</h2>
            <select
              id="fallsTimeRange"
              value={fallsTimeRange}
              onChange={(e) => {
                setFallsTimeRange(e.target.value);
                updateFallsChart();
              }}
            >
              <option value="current">This Month</option>
              <option value="3months">Past 3 Months</option>
              <option value="6months">Past 6 Months</option>
            </select>
            {gaugeChart ? (
              <div id="gaugeContainer">
                <div className="gauge">
                  {gaugeChartData.datasets.length > 0 && <Doughnut data={gaugeChartData} options={gaugeChartOptions} />}
                  <div className="gauge-value">7</div>
                  <div className="gauge-label">falls this month</div>
                  <div className="gauge-goal">
                    Goal: <span id="fallGoal">{goal}</span>
                  </div>
                  <br />
                  <div className="gauge-scale">
                    <span>0</span>
                    <span>20</span>
                  </div>
                </div>
              </div>
            ) : (
              <div id="lineChartContainer">
                {lineChartData.datasets.length > 0 && <Line data={lineChartData} options={lineChartOptions} />}
              </div>
            )}
            <br />
            <br />
            {gaugeChart && (
              <div>
                <button className="update-button" id="update-button" onClick={updateFalls}>
                  Update Falls Goal
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="chart">
          <h2>{analysisHeaderText}</h2>
          <h4>Falls by HIR: {hirFalls}</h4>
          <select
            id="fallsAnalysisType"
            value={analysisType}
            onChange={(e) => {
              setAnalysisType(e.target.value);
              updateAnalysisChart();
            }}
          >
            <option value="timeOfDay">Time of Day</option>
            <option value="location">Location</option>
            <option value="injuries">Injuries</option>
            <option value="hir">Falls by HIR</option>
            <option value="recurring">Residents w/ Recurring Falls</option>
          </select>
          <select
            id="analysisTimeRange"
            value={analysisTimeRange}
            onChange={(e) => {
              setAnalysisTimeRange(e.target.value);
              updateAnalysisChart();
            }}
          >
            <option value="current">Current Month</option>
            <option value="3months">Past 3 Months</option>
            <option value="6months">Past 6 Months</option>
          </select>
          {analysisChartData.datasets.length > 0 && <Bar data={analysisChartData} options={analysisChartOptions} />}
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
            <th>
              3 Post Fall Notes<br></br> in 72 Hours
            </th>
            <th>Interventions</th>
          </tr>
        </thead>
        <tbody id="fallsTableBody">
          {currentItems.map((item, i) => (
            <tr key={i}>
              <td style={{ whiteSpace: 'nowrap' }}>{item.date}</td>
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
                <input type="checkbox" checked={item.incidentReportWritten} disabled />
              </td>    
              <td>
                <input type="checkbox" checked={item.postFallNotes} disabled />
              </td>
              <td>{item.review}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        {Array.from({ length: Math.ceil(dbData.length / itemsPerPage) }, (_, index) => (
          <button key={index} onClick={() => handlePageChange(index + 1)}>
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
