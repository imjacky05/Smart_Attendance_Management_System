import React from 'react';
import { Menu, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ currentTab, onToggleMobileMenu }) {
  const { user, isFaculty, isStudent, logout } = useAuth();

  const getPageMeta = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: isFaculty ? 'Faculty Management Dashboard' : 'Student Academic Dashboard',
          desc: isFaculty
            ? 'Monitor attendance sessions, present counts, and generate live QR codes'
            : 'Track your subject attendance percentages, history, and scan live sessions',
        };
      case 'qr-session':
        return {
          title: 'Live QR Session Generator',
          desc: 'Select a subject and class to broadcast a unique timed attendance QR code',
        };
      case 'qr-scan':
        return {
          title: 'Camera QR Code Scanner',
          desc: 'Scan the faculty classroom QR code to record your real-time attendance',
        };
      case 'face-attendance':
        return {
          title: 'Biometric Face Recognition Attendance',
          desc: 'Privacy-focused biometric verification (zero raw photos stored)',
        };
      case 'reports':
        return {
          title: 'College Attendance Reports & Analytics',
          desc: 'Filter attendance records across students, subjects, classes, and export to CSV',
        };
      default:
        return { title: 'Smart Attendance System', desc: 'College Attendance Management' };
    }
  };

  const meta = getPageMeta();
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle-btn" onClick={onToggleMobileMenu} title="Toggle Sidebar">
          <Menu size={22} />
        </button>
        <div>
          <h2 className="page-header-title">{meta.title}</h2>
          <p className="page-header-desc">{meta.desc}</p>
        </div>
      </div>

      <div className="topbar-right">
        <div className="date-pill">
          <Calendar size={15} />
          <span>{todayFormatted}</span>
        </div>

        <button className="btn-logout" onClick={logout} title="Sign Out">
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
