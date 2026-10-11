import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import FacultyDashboardPage from './pages/FacultyDashboardPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import QrSessionView from './components/QrSessionView';
import QrScannerView from './components/QrScannerView';
import FaceRecognitionView from './components/FaceRecognitionView';
import ReportView from './components/ReportView';

export default function App() {
  const { user, isFaculty, isStudent } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  // If user is not logged in, show login page
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main View Area */}
      <div className="main-content">
        <Topbar
          currentTab={currentTab}
          onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
        />

        <main className="content-body">
          {currentTab === 'dashboard' && (
            isFaculty ? (
              <FacultyDashboardPage onNavigateToQr={() => setCurrentTab('qr-session')} />
            ) : (
              <StudentDashboardPage onNavigateToScan={() => setCurrentTab('qr-scan')} />
            )
          )}

          {currentTab === 'qr-session' && (
            <QrSessionView
              activeSession={activeSession}
              setActiveSession={setActiveSession}
              onSessionClosed={() => setActiveSession(null)}
            />
          )}

          {currentTab === 'qr-scan' && (
            <QrScannerView
              onAttendanceMarked={(record) => {
                // Return to dashboard or keep confirmation
              }}
            />
          )}

          {currentTab === 'face-attendance' && (
            <FaceRecognitionView />
          )}

          {currentTab === 'reports' && (
            isFaculty ? <ReportView /> : <StudentDashboardPage onNavigateToScan={() => setCurrentTab('qr-scan')} />
          )}
        </main>
      </div>
    </div>
  );
}
