import React from 'react';

export default function StatCard({ label, value, subtext, icon: Icon, colorTheme = 'blue' }) {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>
      <div className={`stat-icon-wrapper icon-${colorTheme}`}>
        {Icon && <Icon size={26} />}
      </div>
    </div>
  );
}
