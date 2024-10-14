import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
// import '../styles/ManagementDashboard.css';
import styles from '../styles/ManagementDashboard.module.css';
import { useNavigate } from 'react-router-dom';
import SummaryCard from './SummaryCard';
import Modal from './Modal';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Management_Dashboard({ dataLengths }) {
  // console.log('dashboard re-rendered');
  console.log('data length');
  console.log(dataLengths);
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

  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [fallsTimeRange, setFallsTimeRange] = useState('current');
  const [homesTimeRange, setHomesTimeRange] = useState('current');
  const [fallsChartData, setFallsChartData] = useState({
    labels: [],
    datasets: [],
  });

  const [homesChartData, setHomesChartData] = useState({
    labels: [],
    datasets: [],
  });

  // expandedLog(fallsChartData);

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

  const barCharOptions = {
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
    animations: {
      duration: 0,
      // duration: 1000,
      // easing: 'linear',
    },
  };

  const updateFallsChart = () => {
    let newData = [];

    switch (fallsTimeRange) {
      case 'current':
        newData = [...data_for_current_falls];
        break;
      case '3months':
        newData = [...data_for_three_months_falls];
        break;
    }

    newData.sort((a, b) => b.value - a.value);

    setFallsChartData({
      labels: newData.map((item) => item.name),
      datasets: [
        {
          data: newData.map((item) => item.value),
          backgroundColor: 'rgba(76, 175, 80, 0.6)',
          borderColor: 'rgb(76, 175, 80)',
          borderWidth: 1,
          indexAxis: 'x',
        },
      ],
    });
  };

  const updateHomesChart = () => {
    let newData = [];

    switch (homesTimeRange) {
      case 'current':
        newData = [...data_for_current_homes];
        break;
      case '3months':
        newData = [...data_for_three_months_homes];
        break;
    }

    newData.sort((a, b) => b.value - a.value);
    setHomesChartData({
      labels: newData.map((item) => item.name),
      datasets: [
        {
          // label: 'Number of Falls',
          data: newData.map((item) => item.value),
          backgroundColor: 'rgba(76, 175, 80, 0.6)',
          borderColor: 'rgb(76, 175, 80)',
          borderWidth: 1,
        },
      ],
    });
  };

  // useEffect(() => {
  //   updateFallsChart();
  // }, [fallsTimeRange]);

  useEffect(() => {
    console.log('Update Falls Chart');
    updateFallsChart();
  }, [fallsTimeRange]);

  useEffect(() => {
    console.log('Update Homes Chart');
    updateHomesChart();
  }, [homesTimeRange]);

  // useEffect(() => {
  //   console.log('fallsChartData');
  //   expandedLog(fallsChartData);
  // }, [fallsChartData]);

  // useEffect(() => {
  //   console.log('homesChartData');
  //   expandedLog(homesChartData);
  // }, [homesChartData]);

  const logout = () => {
    navigate('/login');
  };

  // let summaryData = [
  //   { value: 20, subtitle: 'Niagra LTC', linkTo: '/niagara-ltc' },
  //   { value: 18, subtitle: 'Mill creek LTC', linkTo: '/mill-creek-care' },
  //   { value: dataLengths['wellington'], subtitle: 'The Wellington LTC', linkTo: '/the-wellington-ltc' },
  //   { value: 15, subtitle: 'Ina Graftin LTC', linkTo: '/iggh-ltc' },
  // ];

  const summaryData = [
    { value: dataLengths['niagara'], subtitle: 'Niagara LTC', linkTo: '/niagara-ltc' },
    { value: dataLengths['millCreek'], subtitle: 'Mill Creek LTC', linkTo: '/mill-creek-care' },
    { value: dataLengths['wellington'], subtitle: 'The Wellington LTC', linkTo: '/the-wellington-ltc' },
    { value: dataLengths['iggh'], subtitle: 'Ina Graftin LTC', linkTo: '/iggh-ltc' },
  ];

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.h1}>Responsive Management Falls</h1>
      <button className={styles['logout-button']} onClick={logout}>
        Log Out
      </button>

      <div className={styles['chart-container']}>
        <div className={styles['chart']}>
          <h2 id="fallsHeader">Falls with significant injury</h2>
          <select
            id="fallsTimeRange"
            value={fallsTimeRange}
            className={styles.select}
            onChange={(e) => {
              setFallsTimeRange(e.target.value);
            }}
          >
            <option value="current">Current Month</option>
            <option value="3months">Past 3 Months</option>
          </select>
          {fallsChartData.datasets.length > 0 && <Bar data={fallsChartData} options={barCharOptions} />}
        </div>

        <div className={styles['chart']}>
          <h2 id="homesHeader">Number of incidents of non-compliance</h2>
          <select
            id="homesTimeRange"
            value={homesTimeRange}
            onChange={(e) => {
              setHomesTimeRange(e.target.value);
            }}
          >
            <option value="current">Current Month</option>
            <option value="3months">Past 3 Months</option>
          </select>

          {homesChartData.datasets.length > 0 && <Bar data={homesChartData} options={barCharOptions} />}
        </div>
      </div>

      <div className={styles['summary-container']}>
        <h2>Fall Summary</h2>
        <div className={styles['summary-cards']}>
          {summaryData.map((item, index) => (
            <SummaryCard
              key={index}
              value={item.value}
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

// onClick={(event, elements) => {
//   if (elements.length > 0) {
//     const index = elements[0].index;
//     const locationName = fallsChartData.datasets.data[index].name;
//     const { unwrittenNotes, missingNotes } = fallsChartData.datasets.data.find(
//       (home) => home.name === locationName
//     );
//     const content = [
//       `Unwritten fall notes by month's end: ${unwrittenNotes}`,
//       `Number of missing post-fall notes: ${missingNotes}`,
//     ];
//     openModal(locationName, content);
//   }
// }}

// onClick={(event, elements) => {
//   if (elements.length > 0) {
//     const index = elements[0].index;
//     const locationName = homesChartData.datasets.data[index].name;
//     const { unwrittenNotes, missingNotes } = homesChartData.datasets.data.find(
//       (home) => home.name === locationName
//     );
//     const content = [
//       `Unwritten fall notes by month's end: ${unwrittenNotes}`,
//       `Number of missing post-fall notes: ${missingNotes}`,
//     ];
//     openModal(locationName, content);
//   }
// }}
