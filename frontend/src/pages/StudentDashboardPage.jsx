import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Calendar,
  CheckCircle2,
  XCircle,
  ScanLine,
  RefreshCw,
  Search,
  BookOpen,
  Award,
  Clock,
  Camera,
  X,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { studentApi } from '../api/studentApi';

export default function StudentDashboardPage({ onNavigateToScan }) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [profRes, statsRes, histRes] = await Promise.all([
        studentApi.getProfile(),
        studentApi.getStats(),
        studentApi.getHistory(),
      ]);

      if (profRes.success && profRes.data) setProfile(profRes.data);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (histRes.success && histRes.data) setHistory(histRes.data);
    } catch (err) {
      console.error('Error fetching student dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const filteredHistory = history.filter((h) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (h.subjectName && h.subjectName.toLowerCase().includes(term)) ||
      (h.subjectCode && h.subjectCode.toLowerCase().includes(term)) ||
      (h.sessionCode && h.sessionCode.toLowerCase().includes(term))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Student Profile Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          borderRadius: '16px',
          padding: '24px 30px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 800,
              border: '3px solid rgba(255,255,255,0.4)',
            }}
          >
            {profile?.user?.fullName?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{profile?.user?.fullName || 'Student Portal'}</h2>
            <p style={{ fontSize: '0.88rem', color: '#bfdbfe', marginTop: '2px' }}>
              Roll No: <strong>{profile?.rollNumber || '--'}</strong> | Class: <strong>{profile?.collegeClass?.className || '--'}</strong>
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '0.8rem', color: '#e0e7ff' }}>
              <span>Dept: {profile?.department || 'Computer Science'}</span>
              <span>•</span>
              <span>Semester: {profile?.semester || '6'}</span>
              <span>•</span>
              <span>Batch: {profile?.batch || '2023-2027'}</span>
            </div>
          </div>
        </div>

        <button
          className="btn"
          style={{ background: '#ffffff', color: '#1e40af', fontWeight: 700, padding: '12px 20px' }}
          onClick={onNavigateToScan}
        >
          <ScanLine size={18} />
          <span>Scan Faculty QR Now</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="stats-grid">
        <StatCard
          label="Lectures Attended"
          value={stats ? stats.attendedLectures : '--'}
          subtext="Verified present in classroom"
          icon={CheckCircle2}
          colorTheme="green"
        />

        <StatCard
          label="Total Scheduled Lectures"
          value={stats ? stats.totalLectures : '--'}
          subtext="Sessions recorded so far"
          icon={BookOpen}
          colorTheme="blue"
        />

        <StatCard
          label="Absent Lectures"
          value={stats ? stats.absentLectures : '--'}
          subtext="Missed or unverified lectures"
          icon={XCircle}
          colorTheme="red"
        />

        <StatCard
          label="Attendance Percentage"
          value={stats ? `${stats.attendancePercentage}%` : '--%'}
          subtext={stats?.attendancePercentage >= 75 ? 'Above 75% Criteria' : 'Requires improvement'}
          icon={Award}
          colorTheme={stats?.attendancePercentage >= 75 ? 'green' : 'purple'}
        />
      </div>

      {/* Personal Attendance History Table */}
      <div className="card-panel">
        <div className="card-header">
          <div className="card-title">
            <Clock size={18} color="#2563eb" />
            <span>My Attendance History</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '220px' }}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search subject..."
                className="form-input"
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-secondary" onClick={fetchStudentData} title="Refresh History" style={{ padding: '6px 12px' }}>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {filteredHistory.length === 0 ? (
            <div className="empty-state">
              <p>No attendance history found. Scan a faculty QR code to record your first lecture!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Session Code</th>
                    <th>Faculty</th>
                    <th>Status</th>
                    <th>Method</th>
                    <th>Captured Photo</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((h) => (
                    <tr key={h.id}>
                      <td>
                        <strong style={{ color: '#1e40af' }}>{h.subjectCode}</strong> - {h.subjectName}
                      </td>
                      <td>{h.recordDate?.toString()}</td>
                      <td>{h.recordTime ? h.recordTime.toString().substring(0, 5) : '-'}</td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{h.sessionCode}</td>
                      <td>{h.facultyName}</td>
                      <td>
                        <span className={`badge ${h.status === 'PRESENT' ? 'badge-present' : 'badge-absent'}`}>
                          <CheckCircle2 size={12} /> {h.status}
                        </span>
                      </td>
                      <td>
                        <span className="badge-method">{h.method}</span>
                      </td>
                      <td>
                        {h.capturedPhoto ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                              src={h.capturedPhoto}
                              alt="Captured Attendance Face"
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                border: '2px solid #2563eb',
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}
                              onClick={() => setSelectedPhoto(h.capturedPhoto)}
                              title="Click to view captured photo"
                            />
                            <span className="badge badge-present" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                              📸 Photo Saved
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>QR Scan</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{h.verificationDetails}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Photo Enlarge Modal */}
      {selectedPhoto && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#1e3a8a', marginBottom: '14px' }}>
              <Camera size={20} color="#2563eb" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Attendance Face Snapshot</h3>
            </div>

            <img
              src={selectedPhoto}
              alt="Full Captured Face"
              style={{
                width: '260px',
                height: '260px',
                objectFit: 'cover',
                borderRadius: '12px',
                border: '3px solid #2563eb',
                margin: '0 auto',
                display: 'block',
                boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)',
              }}
            />

            <div style={{ marginTop: '16px', padding: '12px', background: '#eff6ff', borderRadius: '10px' }}>
              <p style={{ fontSize: '0.84rem', color: '#1e40af', fontWeight: 600 }}>
                ✅ Photo verified and stored on your attendance sheet.
              </p>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                This image confirms your presence for this lecture.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
