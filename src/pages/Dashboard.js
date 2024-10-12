import React, { useEffect, useState } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
// import "../styles/Dashboard.css"
import styles from '../styles/Dashboard.module.css';
import { useNavigate } from 'react-router-dom';
import { threeData } from '../data/TableData';
import * as Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { Chart, ArcElement, PointElement, LineElement } from 'chart.js';

Chart.register(ArcElement, PointElement, LineElement);

export default function Dashboard(props) {
  let title = props.title;
  let csvFile = props.csvFile;
  
  function expandedLog(item, maxDepth = 100, depth = 0) {
    if (depth > maxDepth) {
      console.log(item);
      return;
    }
    if (typeof item === 'object' && item !== null) {
      Object.entries(item).forEach(([key, value]) => {
        console.group(key + ' : ' + typeof value);
        expandedLog(value, maxDepth, depth + 1);
        console.groupEnd();
      });
    } else {
      console.log(item);
    }
  }
  // console.log('dashboard re-rendered');
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
  const threeMonthData = threeData;
  const [tableData, setTableData] = useState([]);

  const [goal, setGoal] = useState(25);
  const [gaugeChartData, setGaugeChartData] = useState({
    labels: [],
    datasets: [],
  });

  const gaugeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
  };

  const [lineChartData, setLineChartData] = useState({
    labels: [],
    datasets: [],
  });

  const lineChartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 55,
        ticks: {
          stepSize: 5,
        },
      },
    },
  };
  const [analysisChartData, setAnalysisChartData] = useState({
    labels: [],
    datasets: [],
  });

  // expandedLog(analysisChartData);

  const analysisChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
  };

  const [gaugeChart, setGaugeChart] = useState(true);

  const [fallsTimeRange, setFallsTimeRange] = useState('current');

  const [analysisType, setAnalysisType] = useState('timeOfDay');
  const [analysisTimeRange, setAnalysisTimeRange] = useState('current');
  const [analysisUnit, setAnalysisUnit] = useState('allUnits');

  const [analysisHeaderText, setAnalysisHeaderText] = useState('Falls by Time of Day');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // for debug
  // console.log('tableData');
  // console.log(tableData);
  // console.log('gaugeChartData');
  // expandedLog(gaugeChartData);

  // maybe only setState can achieve

  useEffect(() => {
    // Initialize data
    fetch(csvFile)
      .then((response) => response.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: function (results) {
            setTableData(results.data);
          },
        });
      });
  }, []);

  useEffect(() => {
    updateFallsChart();
  }, [fallsTimeRange, tableData]);

  useEffect(() => {
    updateAnalysisChart();
  }, [analysisType, analysisTimeRange, analysisUnit, tableData]);

  // For debug
  // useEffect(() => {
  //   console.log('tableData updated:', tableData);
  // }, [tableData]);

  // useEffect(() => {
  //   console.log('gaugeChartData updated:');
  //   expandedLog(gaugeChartData);
  // }, [gaugeChartData]);

  const updateFallsChart = () => {
    const timeRange = fallsTimeRange;
    const currentFalls = countTotalFalls();

    switch (timeRange) {
      case 'current':
        setGaugeChart(true);
        setGaugeChartData({
          datasets: [
            {
              data: [currentFalls, goal - currentFalls],
              backgroundColor: ['rgba(76, 175, 80, 0.8)', 'rgba(200, 200, 200, 0.2)'],
              circumference: 180,
              rotation: 270,
            },
          ],
        });
        break;
      case '3months':
        setGaugeChart(false);
        let newData = [0, 0, 0];
        // Aggregate falls counts for the past three months
        threeMonthData.forEach((item) => {
          const month = item.date.split('-')[1];
          switch (month) {
            case 'Jul':
              newData[0]++;
              break;
            case 'Aug':
              newData[1]++;
              break;
            case 'Sep':
              newData[2]++;
              break;
          }
        });
        setLineChartData({
          labels: ['July', 'August', 'September'],
          datasets: [
            {
              label: 'Number of Falls',
              data: newData,
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
              label: ['April', 'May', 'June', 'July', 'August', 'September'],
              data: [45, 36, 30, 46, 43, 43],
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

  function countTotalFalls() {
    return tableData.length;
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);

  function countFallsByTimeOfDay(data) {
    var timeOfDayCounts = { Morning: 0, Evening: 0, Night: 0 };

    data.forEach((fall) => {
      var shift = getTimeShift(fall.time);
      timeOfDayCounts[shift]++;
    });

    return timeOfDayCounts;
  }

  function countFallsByExactInjury(data) {
    var injuryCounts = {};

    data.forEach((fall) => {
      var injury = fall.injury;

      if (injuryCounts[injury]) {
        injuryCounts[injury]++;
      } else {
        injuryCounts[injury] = 1;
      }
    });

    return injuryCounts;
  }

  function countFallsByLocation(data) {
    var locationCounts = {};
    data.forEach((fall) => {
      if (locationCounts[fall.location]) {
        locationCounts[fall.location]++;
      } else {
        locationCounts[fall.location] = 1;
      }
    });
    return locationCounts;
  }

  function countFallsByHIR(data) {
    var hirCount = 0;

    data.forEach((fall) => {
      if (fall.hir.toLowerCase() === 'yes') {
        hirCount++;
      }
    });

    return hirCount;
  }

  function getMonthFromTimeRange(timeRange) {
    // Example logic for determining the month label
    // Replace this logic with the actual month logic you are using
    var currentMonth = 'August 2024'; // You can dynamically determine this based on the current time or input data
    if (timeRange === '3months') {
      return 'June - August 2024';
    } else if (timeRange === '6months') {
      return 'March - August 2024';
    } else {
      return currentMonth;
    }
  }

  function getTimeShift(fallTime) {
    var parts = fallTime.split(':');
    var hours = parseInt(parts[0], 10);
    var minutes = parseInt(parts[1], 10);

    // Convert time to minutes since midnight for easier comparison
    var totalMinutes = hours * 60 + minutes;

    // Determine the shift based on time ranges
    if (totalMinutes >= 390 && totalMinutes <= 870) {
      // 6:30 AM to 2:30 PM
      return 'Morning';
    } else if (totalMinutes >= 871 && totalMinutes <= 1350) {
      // 2:31 PM to 10:30 PM
      return 'Evening';
    } else {
      // 10:31 PM to 6:30 AM
      return 'Night';
    }
  }

  function countResidentsWithRecurringFalls(data) {
    var residentFallCounts = {};

    // Count falls for each resident
    data.forEach((fall) => {
      var residentName = fall.name;
      if (residentFallCounts[residentName]) {
        residentFallCounts[residentName]++;
      } else {
        residentFallCounts[residentName] = 1;
      }
    });

    // Only include residents with more than one fall
    var recurringFalls = {};
    for (var resident in residentFallCounts) {
      if (residentFallCounts[resident] > 1) {
        recurringFalls[resident] = residentFallCounts[resident];
      }
    }

    return recurringFalls;
  }

  const updateAnalysisChart = () => {
    var selectedUnit = analysisUnit;
    var filteredData = analysisTimeRange === '3months' ? threeMonthData : tableData;

    if (selectedUnit !== 'allUnits') {
      filteredData = filteredData.filter(
        (fall) => fall.homeUnit.trim().toLowerCase() === selectedUnit.trim().toLowerCase()
      );
    }

    let newLabels = [];
    let newData = [];

    switch (analysisType) {
      case 'timeOfDay':
        setAnalysisHeaderText('Falls by Time of Day');
        newLabels = ['Morning', 'Evening', 'Night'];
        var timeOfDayCounts = countFallsByTimeOfDay(filteredData);
        newData = [timeOfDayCounts.Morning, timeOfDayCounts.Evening, timeOfDayCounts.Night];
        break;

      case 'location':
        setAnalysisHeaderText('Falls by Location');
        var locationCounts = countFallsByLocation(filteredData);
        newLabels = Object.keys(locationCounts);
        newData = Object.values(locationCounts);
        break;

      case 'injuries':
        setAnalysisHeaderText('Falls by Injury Description');
        var injuryCounts = countFallsByExactInjury(filteredData);
        newLabels = Object.keys(injuryCounts);
        newData = Object.values(injuryCounts);
        break;

      case 'hir':
        setAnalysisHeaderText('High Injury Risk (HIR) Falls');
        var hirCount = countFallsByHIR(filteredData);
        newLabels = [getMonthFromTimeRange(analysisTimeRange)];
        newData = [hirCount];
        break;

      case 'residents':
        setAnalysisHeaderText('Residents with Recurring Falls');
        var recurringFalls = countResidentsWithRecurringFalls(filteredData);
        newLabels = Object.keys(recurringFalls);
        newData = Object.values(recurringFalls);
        break;
    }

    setAnalysisChartData({
      labels: newLabels,
      datasets: [
        {
          data: newData,
          backgroundColor: 'rgba(76, 175, 80, 0.6)',
          borderColor: 'rgb(76, 175, 80)',
          borderWidth: 1,
        },
      ],
    });
  };

  // const logout = () => {
  //   navigate('/login');
  // };

  const handleUpdateCSV = (index, newValue) => {
    const updatedData = [...tableData];
    updatedData[index].physicianRef = newValue;
    setTableData(updatedData);
  };

  const handleSaveCSV = () => {
    const csv = Papa.unparse(tableData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'updated_fall_data.csv');
  };

  return (
    <div className={styles.dashboard}>
      <h1>{title}</h1>

      {/* <button className="logout-button" onClick={logout}>
        Log Out
      </button> */}

      <div className={styles['chart-container']}>
        <div className={styles.chart}>
          <div className={styles['gauge-container']}>
            <h2 style={{ paddingTop: '7.5px' }}>Falls Overview</h2>
            <select
              id="fallsTimeRange"
              value={fallsTimeRange}
              onChange={(e) => {
                setFallsTimeRange(e.target.value);
              }}
            >
              <option value="current">This Month</option>
              <option value="3months">Past 3 Months</option>
              <option value="6months">Past 6 Months</option>
            </select>
            {gaugeChart ? (
              <div id="gaugeContainer">
                <div className={styles.gauge}>
                  {gaugeChartData.datasets.length > 0 && <Doughnut data={gaugeChartData} options={gaugeChartOptions} />}
                  <div className={styles['gauge-value']}>{tableData.length}</div>
                  <br />
                  <div className={styles['gauge-label']}>falls this month</div>
                  <div className={styles['gauge-goal']}>
                    Goal: <span id="fallGoal">{goal}</span>
                  </div>
                  <br />
                  <div className={styles['gauge-scale']}>
                    <span>0</span>
                    <span>25</span>
                  </div>
                </div>
              </div>
            ) : (
              <div id="lineChartContainer">
                {lineChartData.datasets.length > 0 && <Line data={lineChartData} options={lineChartOptions} />}
              </div>
            )}
          </div>
        </div>

        <div className={styles.chart}>
          <h2>{analysisHeaderText}</h2>
          <select
            id="fallsAnalysisType"
            value={analysisType}
            onChange={(e) => {
              setAnalysisType(e.target.value);
            }}
          >
            <option value="timeOfDay">Time of Day</option>
            <option value="location">Location</option>
            <option value="injuries">Injuries</option>
            <option value="hir">Falls by HIR</option>
            <option value="residents">Residents w/ Recurring Falls</option>
          </select>

          <select
            id="analysisTimeRange"
            value={analysisTimeRange}
            onChange={(e) => {
              setAnalysisTimeRange(e.target.value);
            }}
          >
            <option value="current">Current Month</option>
            <option value="3months">Past 3 Months</option>
          </select>

          <select
            id="unitSelection"
            value={analysisUnit}
            onChange={(e) => {
              setAnalysisUnit(e.target.value);
            }}
          >
            <option value="allUnits">All Units</option>
            <option value="Ground W">Ground W</option>
            <option value="2 East E">2 East</option>
            <option value="2 West W">2 West</option>
            <option value="3 East E">3 East</option>
            <option value="3 West W">3 West</option>
          </select>

          {analysisChartData.datasets.length > 0 && <Bar data={analysisChartData} options={analysisChartOptions} />}
        </div>
      </div>

      <div className={styles['table-header']}>
        <h2>Falls Tracking Table: August 2024</h2>
        <div className={styles.buttons}>
          <div>
            <button className={styles['download-button']} onClick={handleSaveCSV}>
              Download as CSV
            </button>
          </div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Time</th>
            <th>Location</th>
            <th>Home Unit</th>
            <th>Nature of Fall/Cause</th>
            <th>Interventions</th>
            <th>HIR</th>
            <th>Injury</th>
            <th>Transfer to Hospital</th>
            <th>PT Ref</th>
            <th>Physician Referral (If Applicable)</th>
            <th>POA Contacted</th>
            <th>Risk Management Incident Fall Written</th>
            <th>3 Post Fall Notes in 72hrs</th>
          </tr>
        </thead>
        <tbody id="fallsTableBody">
          {currentItems.map((item, i) => (
            <tr key={i}>
              <td style={{ whiteSpace: 'nowrap' }}>{item.date}</td>
              <td>{item.name}</td>
              <td>{item.time}</td>
              <td>{item.location}</td>
              <td>{item.homeUnit}</td>
              <td>{item.cause}</td>
              <td>{item.interventions}</td>
              <td>{item.hir}</td>
              <td>{item.injury}</td>
              <td>{item.hospital}</td>
              <td>{item.ptRef}</td>
              <td>
                <select value={item.physicianRef} onChange={(e) => handleUpdateCSV(i, e.target.value)}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="N/A">N/A</option>
                </select>
              </td>
              <td>{item.poaContacted}</td>
              <td>{item.incidentReport}</td>
              <td>{item.postFallNotes}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.pagination}>
        {Array.from({ length: Math.ceil(setTableData.length / itemsPerPage) }, (_, index) => (
          <button key={index} onClick={() => handlePageChange(index + 1)}>
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
