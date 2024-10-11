import React from 'react';
import { Link } from 'react-router-dom'; // 引入Link组件
import '../styles/SummaryCard.css';

const SummaryCard = ({ value, title, subtitle, linkTo }) => {
  return (
    <div className="summary-card">
      <Link to={linkTo} className="summary-link">
        {/* 应用summary-link类 */}
        <div className="summary-value">{value}</div>
      </Link>
      <div className="summary-title">Falls</div>
      <div className="summary-subtitle">{subtitle}</div>
    </div>
  );
};

export default SummaryCard;
