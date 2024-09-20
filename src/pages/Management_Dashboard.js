import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import '../styles/Management_Dashboard.css';
import { initializeApp } from 'firebase/app';
import { get, getDatabase, ref, onValue, update } from 'firebase/database';
import * as XLSX from 'xlsx/xlsx.mjs';
import { useNavigate } from 'react-router-dom';
import 'reactjs-popup/dist/index.css';
import Popup from 'reactjs-popup';
import SummaryCard from './SummaryCard';


export default function Management_Dashboard(props) {
  const navigate = useNavigate();
  const [dbData, setDBData] = useState([]);
  const [goal, setGoal] = useState(0);
  const [chart, setChart] = useState();
  const [fallsData, setFallsData] = useState([]);
  const [fallsChart, setFallsChart] = useState();
  const [homesChart, setHomesChart] = useState();
  const [alert, setAlert] = useState(false);
  const firebaseConfig = {
    databaseURL: 'https://fallyx-demo-default-rtdb.firebaseio.com/',
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  useEffect(() => {
    const dataRef = ref(db, 'data/');

    onValue(
      dataRef,
      (snapshot) => {
        setDBData(snapshot.val());
        if (!!snapshot.val()) {
          console.log(snapshot.val());
        }
      },
      {
        onlyOnce: true,
      }
    );

    const goalRef = ref(db, 'falls_goal/');

    onValue(
      goalRef,
      (snapshot) => {
        console.log(snapshot.val());
        setGoal(snapshot.val());
        if (!!snapshot.val()) {
          console.log(snapshot.val());
        }
      },
      {
        onlyOnce: true,
      }
    );

    const analysisRef = ref(db, 'tracking_table_data/');

    onValue(
      analysisRef,
      (snapshot) => {
        setFallsData(snapshot.val());
        if (!!snapshot.val()) {
          console.log(snapshot.val());
        }
      },
      {
        onlyOnce: true,
      }
    );

    let chart_falls_Status = Chart.getChart('FallsChart');
    if (chart_falls_Status != undefined) {
      chart_falls_Status.destroy();
    }

    setFallsChart(
      new Chart(document.getElementById('FallsChart').getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Niagra LTC', 'Mill creek LTC', 'The Wellington LTC', 'Ina Graftin LTC'],
          datasets: [
            {
              label: 'Number of Falls',
              data: [2, 1, 2, 1],
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

    let chart_homes_Status = Chart.getChart('HomesChart');
    if (chart_homes_Status != undefined) {
      chart_homes_Status.destroy();
    }

    setHomesChart(
      new Chart(document.getElementById('HomesChart').getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Niagra LTC', 'Mill creek LTC', 'The Wellington LTC', 'Ina Graftin LTC'],
          datasets: [
            {
              label: 'Number of Falls',
              data: [2, 1, 3, 2],
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
    const header = document.getElementById('fallsHeader');
    const timeRange = document.getElementById('fallsTimeRange').value;
    let newData = [];

    let data_for_current = [2, 1, 2, 1];
    let data_for_three_month = [8, 12, 15, 14];

    switch (timeRange) {
      case 'current':
        newData = data_for_current;
        break;
      case '3months':
        newData = data_for_three_month;
        break;
    }

    fallsChart.destroy();

    setFallsChart(
      new Chart(document.getElementById('FallsChart').getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Niagra LTC', 'Mill creek LTC', 'The Wellington LTC', 'Ina Graftin LTC'],
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

  const updateHomesChart = async () => {
    const header = document.getElementById('homesHeader');
    const timeRange = document.getElementById('homesTimeRange').value;
    let newData = [];

    let data_for_current = [2, 1, 3, 2];
    let data_for_three_month = [8, 10, 20, 16];

    console.log(timeRange);

    switch (timeRange) {
      case 'current':
        newData = data_for_current;
        break;
      case '3months':
        newData = data_for_three_month;
        break;
    }

    homesChart.destroy();

    setHomesChart(
      new Chart(document.getElementById('HomesChart').getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Niagra LTC', 'Mill creek LTC', 'The Wellington LTC', 'Ina Graftin LTC'],
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

  const summaryData = [
    { value: 20, title: 'Falls', subtitle: 'Niagra LTC', linkTo: '/niagra' },
    { value: 18, title: 'Falls', subtitle: 'Mill creek LTC', linkTo: '/mill-creek' },
    { value: 10, title: 'Falls', subtitle: 'The Wellington LTC', linkTo: '/welling' },
    { value: 15, title: 'Falls', subtitle: 'Ina Graftin LTC', linkTo: '/ina-graftin' },
  ];

  return (
    <div className="dashboard">
      <h1>Responsive Management Falls</h1>
      <button className="logout-button" onClick={logout}>
        Log Out
      </button>

      <div className="chart-container">
        <div className="chart">
          <h2 id="fallsHeader">Falls w/ head injury</h2>
          <select id="fallsTimeRange" onChange={updateFallsChart}>
            <option value="current">Current Month</option>
            <option value="3months">Past 3 Months</option>
          </select>
          <canvas id="FallsChart"></canvas>
        </div>

        <div className="chart">
          <h2 id="homesHeader">Homes w/ high % of non compliance</h2>
          <select id="homesTimeRange" onChange={updateHomesChart}>
            <option value="current">Current Month</option>
            <option value="3months">Past 3 Months</option>
          </select>
          <canvas id="HomesChart"></canvas>
        </div>
      </div>

      <div className="summary-container">
        <h2>Fall Summary</h2>
        <div className="summary-cards">
          {summaryData.map((item, index) => (
            <SummaryCard
              key={index}
              value={item.value}
              title={item.title}
              subtitle={item.subtitle}
              linkTo={item.linkTo} // 传递linkTo参数
            />
          ))}
        </div>
      </div>
    </div>
  );
}
