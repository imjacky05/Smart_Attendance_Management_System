import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Percent,
  QrCode,
  Clock,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Camera,
  X,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { facultyApi } from '../api/facultyApi';

export default function FacultyDashboardPage({ onNavigateToQr}) {
  const [stats, setStats] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, sessionsRes] = await Promise.all([
        facultyApi.getDashboardStats(),
        facultyApi.getActiveSessions(),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (sessionsRes.success && sessionsRes.data) {
        setActiveSessions(sessionsRes.data);
      }
    } catch (err) {
      console.error('Error loading faculty dashboard', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner & Quick Generate QR Button */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
          borderRadius: '16px',
          padding: '24px 30px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.3)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Welcome to Faculty Command Hub</h2>
          <p style={{ fontSize: '0.9rem', color: '#bfdbfe', marginTop: '4px' }}>
            Generate real-time QR codes for classroom attendance and monitor student scans live.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn"
            style={{ background: '#ffffff', color: '#1e40af', fontWeight: 700 }}
            onClick={onNavigateToQr}
          >
            <QrCode size={18} />
            <span>Generate QR Session</span>
          </button>
          <button
            className="btn"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
            onClick={fetchDashboardData}
            disabled={refreshing}
            title="Refresh Metrics"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Students"
          value={stats ? stats.totalStudents : '--'}
          subtext="Enrolled across semester classes"
          icon={Users}
          colorTheme="blue"
        />

        <StatCard
          label="Present Students Today"
          value={stats ? stats.presentToday : '--'}
          subtext="Marked in today's lectures"
          icon={UserCheck}
          colorTheme="green"
        />

        <StatCard
          label="Absent Students Today"
          value={stats ? stats.absentToday : '--'}
          subtext="Pending / absent roll numbers"
          icon={UserX}
          colorTheme="red"
        />

        <StatCard
          label="Attendance Rate"
          value={stats ? `${stats.attendancePercentage}%` : '--%'}
          subtext={`${stats?.activeSessions || 0} active live QR session(s)`}
          icon={Percent}
          colorTheme="purple"
        />
      </div>

      {/* Active Sessions Strip */}
      {activeSessions.length > 0 && (
        <div className="card-panel">
          <div className="card-header" style={{ background: '#eff6ff' }}>
            <div className="card-title">
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb', display: 'inline-block' }}></span>
              <span>Currently Active Classroom Attendance Sessions ({activeSessions.length})</span>
            </div>
            <button className="btn btn-outline" onClick={onNavigateToQr} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <span>View Live QR</span>
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Session Code</th>
                    <th>Subject</th>
                    <th>Class</th>
                    <th>Hall</th>
                    <th>Started</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSessions.map((s) => (
                    <tr key={s.id}>
                      <td><strong>{s.sessionCode}</strong></td>
                      <td>{s.subject?.subjectCode}: {s.subject?.subjectName}</td>
                      <td>{s.collegeClass?.className}</td>
                      <td>{s.roomNumber || 'LH-301'}</td>
                      <td>{s.startTime ? s.startTime.toString().substring(11, 16) : 'Now'}</td>
                      <td>
                        <span className="badge badge-present">ACTIVE</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Recent Attendance Activity Feed */}
      <div className="card-panel">
        <div className="card-header">
          <div className="card-title">
            <Clock size={18} color="#2563eb" />
            <span>Recent Attendance Activity Feed</span>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {!stats || !stats.recentActivity || stats.recentActivity.length === 0 ? (
            <div className="empty-state">
              <p>No recent attendance activity recorded yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Verification Method</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentActivity.map((act) => (
                    <tr key={act.id}>
                      <td>
                        {act.capturedPhoto ? (
                          <img
                            src={act.capturedPhoto}
                            alt={act.studentName}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '2px solid #2563eb',
                              cursor: 'pointer',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onClick={() => setSelectedPhoto({
                              photo: act.capturedPhoto,
                              name: act.studentName,
                              roll: act.rollNumber,
                              method: act.method
                            })}
                            title="Click to view student face snapshot"
                          />
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                      <td><strong>{act.studentName}</strong></td>
                      <td>{act.rollNumber}</td>
                      <td>{act.className}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#1e40af' }}>{act.subjectCode}</span> - {act.subjectName}
                      </td>
                      <td>{act.recordDate?.toString()}</td>
                      <td>{act.recordTime ? act.recordTime.toString().substring(0, 5) : '-'}</td>
                      <td>
                        <span className={`badge ${act.status === 'PRESENT' ? 'badge-present' : 'badge-absent'}`}>
                          <CheckCircle2 size={12} /> {act.status}
                        </span>
                      </td>
                      <td>
                        <span className="badge-method">{act.method}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Faculty Photo Enlarge Modal */}
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
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Student Verification Photo</h3>
            </div>

            <img
              src={selectedPhoto.photo}
              alt="Student Face Snapshot"
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
              <p style={{ fontSize: '0.92rem', color: '#1e40af', fontWeight: 700 }}>
                {selectedPhoto.name} ({selectedPhoto.roll})
              </p>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                Method: <strong style={{ color: '#2563eb' }}>{selectedPhoto.method}</strong> • Live Camera Snapshot
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
