import React from 'react';
import { Link } from 'react-router-dom'; // 引入Link组件
import '../styles/SummaryCard.css';

const SummaryCard = ({ value, title, subtitle, linkTo }) => {
  return (
    <div className="summary-card">
      <a href={linkTo} className="summary-link"> {/* 应用summary-link类 */}
        <div className="summary-value">{value}</div>
      </a>
      <div className="summary-title">{title}</div>
      <div className="summary-subtitle">{subtitle}</div>
    </div>
  );
};

export default SummaryCard;
