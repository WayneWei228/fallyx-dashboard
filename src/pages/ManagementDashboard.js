import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import styles from '../styles/ManagementDashboard.module.css';
import { useNavigate } from 'react-router-dom';
import SummaryCard from './SummaryCard';
import Modal from './Modal';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ManagementDashboard() {
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

  const [fallsPopUpData, setFallsPopUpData] = useState([]);

  const [homesPopUpData, setHomesPopUpData] = useState([]);

  const data_for_three_months_falls = [
    { name: 'Niagara LTC', value: 8, headInjury: 3, fracture: 2, skinTear: 3 },
    { name: 'Mill Creek LTC', value: 12, headInjury: 4, fracture: 3, skinTear: 5 },
    { name: 'The Wellington LTC', value: 15, headInjury: 5, fracture: 4, skinTear: 6 },
    { name: 'Ina Graftin LTC', value: 14, headInjury: 4, fracture: 5, skinTear: 5 },
  ];

  const data_for_three_months_non_compliance = [
    { name: 'Niagara LTC', poaNotNotified: 5, unwrittenNotes: 3 },
    { name: 'Mill Creek LTC', poaNotNotified: 6, unwrittenNotes: 4 },
    { name: 'The Wellington LTC', poaNotNotified: 10, unwrittenNotes: 7 },
    { name: 'Ina Graftin LTC', poaNotNotified: 8, unwrittenNotes: 6 },
  ];

  const [dataLengths, setDataLengths] = useState({});

  const getDataLengths = async () => {
    const homes = ['niagara', 'millCreek', 'wellington', 'iggh'];
    const dataLengths = {};

    await Promise.all(
      homes.map((home) => {
        return new Promise((resolve) => {
          const homeRef = ref(db, home); // Reference to the home in Firebase

          onValue(homeRef, (snapshot) => {
            const data = snapshot.val();
            // Count the number of items (rows) under each home
            dataLengths[home] = data ? Object.keys(data).length : 0;
            resolve();
          });
        });
      })
    );

    return dataLengths; // { niagara: X, millCreek: Y, wellington: Z, iggh: W }
  };

  useEffect(() => {
    const fetchData = async () => {
      const lengths = await getDataLengths();
      setDataLengths(lengths);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const homes = ['iggh', 'millCreek', 'niagara', 'wellington'];

    if (fallsTimeRange === '3months') {
      const popupData = data_for_three_months_falls.map((item) => ({
        name: item.name,
        headInjury: item.headInjury,
        fracture: item.fracture,
        skinTear: item.skinTear,
      }));

      setFallsPopUpData(popupData);
      updateFallsChart(
        data_for_three_months_falls.reduce((acc, item) => {
          acc[item.name] = item.headInjury + item.fracture + item.skinTear;
          return acc;
        }, {})
      );
    } else {
      let injuryCounts = {
        'Niagara LTC': 0,
        'Mill Creek LTC': 0,
        'The Wellington LTC': 0,
        'Ina Graftin LTC': 0,
      };
      let popupData = [];

      homes.forEach((home) => {
        const fallsRef = ref(db, home);
        onValue(fallsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const fallsData = Object.values(data).map((item) => {
              const hasHeadInjury = item.injury.toLowerCase().includes('head injury');
              const hasFracture = item.injury.toLowerCase().includes('fracture');
              const hasSkinTear = item.injury.toLowerCase().includes('skin tear');
              const homeName = homeToName(home);

              if (hasHeadInjury || hasFracture || hasSkinTear) {
                injuryCounts[homeName] += 1;
              }

              return {
                name: homeName,
                headInjury: hasHeadInjury ? 1 : 0,
                fracture: hasFracture ? 1 : 0,
                skinTear: hasSkinTear ? 1 : 0,
              };
            });

            popupData = [...popupData, ...fallsData];
            setFallsPopUpData(popupData);
            updateFallsChart(injuryCounts);
          } else {
            console.warn(`No data found in Firebase for ${home}`);
          }
        });
      });
    }
  }, [fallsTimeRange]);

  useEffect(() => {
    const homes = ['iggh', 'millCreek', 'niagara', 'wellington'];

    if (homesTimeRange === '3months') {
      updateHomesChart(
        data_for_three_months_non_compliance.reduce((acc, item) => {
          acc[item.name] = {
            poaNotNotified: item.poaNotNotified,
            unwrittenNotes: item.unwrittenNotes,
          };
          return acc;
        }, {})
      );
    } else {
      let nonComplianceCounts = {
        'Niagara LTC': { poaNotNotified: 0, unwrittenNotes: 0 },
        'Mill Creek LTC': { poaNotNotified: 0, unwrittenNotes: 0 },
        'The Wellington LTC': { poaNotNotified: 0, unwrittenNotes: 0 },
        'Ina Graftin LTC': { poaNotNotified: 0, unwrittenNotes: 0 },
      };

      homes.forEach((home) => {
        const fallsRef = ref(db, home);
        onValue(fallsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            Object.values(data).forEach((item) => {
              const homeName = homeToName(home);
              const fallDate = new Date(item.date);
              const currentDate = new Date();
              const daysDifference = Math.abs(currentDate - fallDate) / (1000 * 60 * 60 * 24);

              //count POAs not contacted
              if (item.poaContacted.toLowerCase() !== 'yes') {
                nonComplianceCounts[homeName].poaNotNotified += 1;
              }

              //count unwritten post-fall notes (if more than 3 days after the fall and postFallNotes < 3)
              if (daysDifference > 3 && parseInt(item.postFallNotes) < 3) {
                nonComplianceCounts[homeName].unwrittenNotes += 1;
              }
            });
            updateHomesChart(nonComplianceCounts);
          } else {
            console.warn(`No data found in Firebase for ${home}`);
          }
        });
      });
    }
  }, [homesTimeRange]);

  const homeToName = (home) => {
    switch (home) {
      case 'iggh':
        return 'Ina Graftin LTC';
      case 'millCreek':
        return 'Mill Creek LTC';
      case 'niagara':
        return 'Niagara LTC';
      case 'wellington':
        return 'The Wellington LTC';
      default:
        return home;
    }
  };

  const updateFallsChart = (injuryCounts) => {
    const newData = Object.entries(injuryCounts).map(([name, value]) => ({ name, value }));

    newData.sort((a, b) => b.value - a.value);

    setFallsChartData({
      labels: newData.map((item) => item.name),
      datasets: [
        {
          label: 'Total Significant Injuries',
          data: newData.map((item) => item.value),
          backgroundColor: 'rgba(76, 175, 80, 0.6)',
          borderColor: 'rgb(76, 175, 80)',
          borderWidth: 1,
          indexAxis: 'x',
        },
      ],
    });
  };

  const updateHomesChart = (nonComplianceCounts) => {
    const newData = Object.entries(nonComplianceCounts).map(([name, values]) => ({
      name,
      totalNonCompliance: values.poaNotNotified + values.unwrittenNotes,
      poaNotNotified: values.poaNotNotified,
      unwrittenNotes: values.unwrittenNotes,
    }));

    newData.sort((a, b) => b.totalNonCompliance - a.totalNonCompliance);

    setHomesChartData({
      labels: newData.map((item) => item.name),
      datasets: [
        {
          label: 'Total Non-Compliance',
          data: newData.map((item) => item.totalNonCompliance),
          backgroundColor: 'rgba(76, 175, 80, 0.6)',
          borderColor: 'rgb(76, 175, 80)',
          borderWidth: 1,
          indexAxis: 'x',
        },
      ],
    });

    setHomesPopUpData([...newData]);
  };

  const onClickFalls = (event, elements) => {
    if (!elements.length) return;

    const index = elements[0].index;
    const locationName = fallsChartData.labels[index];
    const fallsData = fallsPopUpData.filter((item) => item.name === locationName);

    const headInjury = fallsData.reduce((acc, item) => acc + item.headInjury, 0);
    const fracture = fallsData.reduce((acc, item) => acc + item.fracture, 0);
    const skinTear = fallsData.reduce((acc, item) => acc + item.skinTear, 0);

    const content = [`Head injuries: ${headInjury}`, `Fractures: ${fracture}`, `Skin tears: ${skinTear}`];

    openModal(locationName, content);
  };

  const onClickHomes = (event, elements) => {
    if (!elements.length) return;

    const index = elements[0].index;
    const locationName = homesChartData.labels[index];
    const homeData = homesPopUpData.find((item) => item.name === locationName);

    const content = [
      `Number of POAs not notified: ${homeData.poaNotNotified}`,
      `Number of unwritten post-fall notes: ${homeData.unwrittenNotes}`,
    ];
    openModal(locationName, content);
  };

  const openModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const baseOptions = {
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
      legend: { display: true },
    },
    animations: {
      duration: 0,
    },
  };

  const createOptions = (onClickHandler) => ({
    ...baseOptions,
    onClick: onClickHandler,
  });

  const [summaryData, setSummaryData] = useState([]);

  useEffect(() => {
    const updatedSummaryData = [
      { value: dataLengths['niagara'], subtitle: 'Niagara LTC', linkTo: '/niagara-ltc' },
      { value: dataLengths['millCreek'], subtitle: 'Mill Creek LTC', linkTo: '/mill-creek-care' },
      { value: dataLengths['wellington'], subtitle: 'The Wellington LTC', linkTo: '/the-wellington-ltc' },
      { value: dataLengths['iggh'], subtitle: 'Ina Graftin LTC', linkTo: '/iggh-ltc' },
    ];

    setSummaryData(updatedSummaryData);
  }, [dataLengths]);

  const logout = () => {
    navigate('/login');
  };

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
            {/* <option value="3months">Past 3 Months</option> */}
          </select>
          {fallsChartData.datasets.length > 0 && <Bar data={fallsChartData} options={createOptions(onClickFalls)} />}
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
            {/* <option value="3months">Past 3 Months</option> */}
          </select>

          {homesChartData.datasets.length > 0 && <Bar data={homesChartData} options={createOptions(onClickHomes)} />}
        </div>
      </div>

      <div className={styles['summary-container']}>
        <h2>Fall Summary</h2>
        <div className={styles['summary-cards']}>
          {summaryData.map((item, index) => (
            <SummaryCard key={index} value={item.value} subtitle={item.subtitle} linkTo={item.linkTo} />
          ))}
        </div>
      </div>

      <Modal showModal={showModal} handleClose={closeModal} modalContent={modalContent} title={modalTitle} />
    </div>
  );
}
