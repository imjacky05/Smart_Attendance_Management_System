import React from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  QrCode,
  ScanLine,
  Camera,
  FileSpreadsheet,
  UserCheck,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentTab, setCurrentTab, mobileOpen, setMobileOpen }) {
  const { user, isFaculty, isStudent, logout } = useAuth();

  const handleNavClick = (tabId) => {
    setCurrentTab(tabId);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-icon">
          <GraduationCap size={24} />
        </div>
        <div>
          <h1 className="brand-title">Smart Attendance</h1>
          <p className="brand-subtitle">Apex College Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>

        <button
          className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNavClick('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        {isFaculty && (
          <button
            className={`nav-item ${currentTab === 'qr-session' ? 'active' : ''}`}
            onClick={() => handleNavClick('qr-session')}
          >
            <QrCode size={18} />
            <span>Generate QR Session</span>
          </button>
        )}

        {isStudent && (
          <button
            className={`nav-item ${currentTab === 'qr-scan' ? 'active' : ''}`}
            onClick={() => handleNavClick('qr-scan')}
          >
            <ScanLine size={18} />
            <span>Scan Faculty QR</span>
          </button>
        )}

        <div className="nav-section-label" style={{ marginTop: '16px' }}>
          {isFaculty ? 'Biometrics & Reports' : 'Biometrics'}
        </div>

        <button
          className={`nav-item ${currentTab === 'face-attendance' ? 'active' : ''}`}
          onClick={() => handleNavClick('face-attendance')}
        >
          <Camera size={18} />
          <span>Face Recognition</span>
        </button>

        {isFaculty && (
          <button
            className={`nav-item ${currentTab === 'reports' ? 'active' : ''}`}
            onClick={() => handleNavClick('reports')}
          >
            <FileSpreadsheet size={18} />
            <span>Attendance Reports</span>
          </button>
        )}
      </nav>

      {/* Footer / Profile Badge */}
      <div className="sidebar-footer">
        <div className="user-badge-card">
          <div className="user-avatar">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-details">
            <p className="user-name">{user?.fullName || 'User'}</p>
            <span className={`user-role-tag ${isFaculty ? 'role-faculty' : 'role-student'}`}>
              {user?.role || 'Guest'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
