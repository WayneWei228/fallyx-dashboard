import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import '../styles/Management_Dashboard.css';
import { useNavigate } from 'react-router-dom';
import SummaryCard from './SummaryCard';
import Modal from './Modal';

export default function Management_Dashboard() {
  const navigate = useNavigate();
  const [fallsChart, setFallsChart] = useState();
  const [homesChart, setHomesChart] = useState();
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState([]);
  const [modalTitle, setModalTitle] = useState('');

  const data_for_current_falls = [
    { name: 'Niagra LTC', value: 2, headInjury: 3, fracture: 2, skinTear: 4 },
    { name: 'Mill creek LTC', value: 1, headInjury: 1, fracture: 1, skinTear: 2 },
    { name: 'The Wellington LTC', value: 2, headInjury: 3, fracture: 5, skinTear: 4 },
    { name: 'Ina Graftin LTC', value: 1, headInjury: 2, fracture: 1, skinTear: 2 },
  ];

  const data_for_three_months_falls = [
    { name: 'Niagra LTC', value: 8, headInjury: 3, fracture: 2, skinTear: 3 },
    { name: 'Mill creek LTC', value: 12, headInjury: 4, fracture: 3, skinTear: 5 },
    { name: 'The Wellington LTC', value: 15, headInjury: 5, fracture: 4, skinTear: 6 },
    { name: 'Ina Graftin LTC', value: 14, headInjury: 4, fracture: 5, skinTear: 5 },
  ];

  const data_for_current_homes = [
    { name: 'Niagra LTC', value: 2, unwrittenNotes: 3, missingNotes: 1 },
    { name: 'Mill creek LTC', value: 1, unwrittenNotes: 2, missingNotes: 1 },
    { name: 'The Wellington LTC', value: 3, unwrittenNotes: 4, missingNotes: 2 },
    { name: 'Ina Graftin LTC', value: 2, unwrittenNotes: 5, missingNotes: 3 },
  ];

  const data_for_three_months_homes = [
    { name: 'Niagra LTC', value: 8, unwrittenNotes: 5, missingNotes: 3 },
    { name: 'Mill creek LTC', value: 10, unwrittenNotes: 6, missingNotes: 4 },
    { name: 'The Wellington LTC', value: 20, unwrittenNotes: 10, missingNotes: 7 },
    { name: 'Ina Graftin LTC', value: 16, unwrittenNotes: 8, missingNotes: 6 },
  ];

  const openModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    let chart_falls_Status = Chart.getChart('FallsChart');
    if (chart_falls_Status !== undefined) {
      chart_falls_Status.destroy();
    }

    let default_falls_data = [...data_for_current_falls];

    default_falls_data.sort((a, b) => b.value - a.value);

    setFallsChart(
      new Chart(document.getElementById('FallsChart').getContext('2d'), {
        type: 'bar',
        data: {
          labels: default_falls_data.map((item) => item.name),
          datasets: [
            {
              label: 'Number of Falls',
              data: default_falls_data.map((item) => item.value),
              backgroundColor: 'rgba(76, 175, 80, 0.6)',
              borderColor: 'rgb(76, 175, 80)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              const locationName = default_falls_data[index].name;
              const { headInjury, fracture, skinTear } = default_falls_data.find((fall) => fall.name === locationName);
              const content = [`Head injury: ${headInjury}`, `Fracture: ${fracture}`, `Skin Tear: ${skinTear}`];
              openModal(locationName, content);
            }
          },
        },
      })
    );

    let chart_homes_Status = Chart.getChart('HomesChart');
    if (chart_homes_Status !== undefined) {
      chart_homes_Status.destroy();
    }

    let default_homes_data = [...data_for_current_homes];

    default_homes_data.sort((a, b) => b.value - a.value);

    setHomesChart(
      new Chart(document.getElementById('HomesChart').getContext('2d'), {
        type: 'bar',
        data: {
          labels: default_homes_data.map((item) => item.name),
          datasets: [
            {
              label: 'Number of Falls',
              data: default_homes_data.map((item) => item.value),
              backgroundColor: 'rgba(76, 175, 80, 0.6)',
              borderColor: 'rgb(76, 175, 80)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              const locationName = default_homes_data[index].name;
              const { unwrittenNotes, missingNotes } = default_homes_data.find((home) => home.name === locationName);
              const content = [
                `Unwritten fall notes by month's end: ${unwrittenNotes}`,
                `Number of missing post-fall notes: ${missingNotes}`,
              ];
              openModal(locationName, content);
            }
          },
        },
      })
    );
  }, []);

  const updateFallsChart = async () => {
    // const header = document.getElementById('fallsHeader');
    const timeRange = document.getElementById('fallsTimeRange').value;
    let newData = [];

    switch (timeRange) {
      case 'current':
        newData = [...data_for_current_falls];
        break;
      case '3months':
        newData = [...data_for_three_months_falls];
        break;
    }

    newData.sort((a, b) => b.value - a.value);

    fallsChart.destroy();

    setFallsChart(
      new Chart(document.getElementById('FallsChart').getContext('2d'), {
        type: 'bar',
        data: {
          labels: newData.map((item) => item.name),
          datasets: [
            {
              label: 'Number of Falls',
              data: newData.map((item) => item.value),
              backgroundColor: 'rgba(76, 175, 80, 0.6)',
              borderColor: 'rgb(76, 175, 80)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              const locationName = newData[index].name;
              const { headInjury, fracture, skinTear } = newData.find((fall) => fall.name === locationName);
              const content = [`Head injury: ${headInjury}`, `Fracture: ${fracture}`, `Skin Tear: ${skinTear}`];
              openModal(locationName, content);
            }
          },
        },
      })
    );
  };

  const updateHomesChart = async () => {
    // const header = document.getElementById('homesHeader');
    const timeRange = document.getElementById('homesTimeRange').value;
    let newData = [];

    switch (timeRange) {
      case 'current':
        newData = [...data_for_current_homes];
        break;
      case '3months':
        newData = [...data_for_three_months_homes];
        break;
    }

    newData.sort((a, b) => b.value - a.value);

    homesChart.destroy();

    setHomesChart(
      new Chart(document.getElementById('HomesChart').getContext('2d'), {
        type: 'bar',
        data: {
          labels: newData.map((item) => item.name),
          datasets: [
            {
              label: 'Number of Falls',
              data: newData.map((item) => item.value),
              backgroundColor: 'rgba(76, 175, 80, 0.6)',
              borderColor: 'rgb(76, 175, 80)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              const locationName = newData[index].name;
              const { unwrittenNotes, missingNotes } = newData.find((home) => home.name === locationName);
              const content = [
                `Unwritten fall notes by month's end: ${unwrittenNotes}`,
                `Number of missing post-fall notes: ${missingNotes}`,
              ];
              openModal(locationName, content);
            }
          },
        },
      })
    );
  };

  const logout = () => {
    navigate('/login');
  };

  const summaryData = [
    { value: 20, title: 'Falls', subtitle: 'Niagra LTC', linkTo: '/niagara-ltc' },
    { value: 18, title: 'Falls', subtitle: 'Mill creek LTC', linkTo: '/mill-creek-care' },
    { value: 10, title: 'Falls', subtitle: 'The Wellington LTC', linkTo: '/the-wellington-ltc' },
    { value: 15, title: 'Falls', subtitle: 'Ina Graftin LTC', linkTo: '/iggh-ltc' },
  ];

  return (
    <div className="dashboard">
      <h1>Responsive Management Falls</h1>
      <button className="logout-button" onClick={logout}>
        Log Out
      </button>

      <div className="chart-container">
        <div className="chart">
          <h2 id="fallsHeader">falls with significant injury</h2>
          <select id="fallsTimeRange" onChange={updateFallsChart}>
            <option value="current">Current Month</option>
            <option value="3months">Past 3 Months</option>
          </select>
          <canvas id="FallsChart"></canvas>
        </div>

        <div className="chart">
          <h2 id="homesHeader">Number of incidents of non-compliance</h2>
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

      <Modal showModal={showModal} handleClose={closeModal} modalContent={modalContent} title={modalTitle} />
    </div>
  );
}
