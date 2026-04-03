import React from 'react';
import '../../styles/StatsCard.css';

const StatsCard = ({ title, value, subtitle, icon, color = '#4361ee' }) => {
  return (
    <div className="stats-card">
      <div className="stats-card-header">
        <div className="stats-card-icon" style={{ backgroundColor: `${color}20`, color }}>
          {icon}
        </div>
        <div className="stats-card-title">{title}</div>
      </div>
      <div className="stats-card-value">{value}</div>
      {subtitle && <div className="stats-card-subtitle">{subtitle}</div>}
    </div>
  );
};

export default StatsCard;