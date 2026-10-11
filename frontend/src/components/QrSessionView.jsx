import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Clock,
  Users,
  CheckCircle2,
  StopCircle,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  Camera,
  X,
} from 'lucide-react';
import { facultyApi } from '../api/facultyApi';

export default function QrSessionView({ activeSession, setActiveSession, onSessionClosed }) {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Form states
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [roomNumber, setRoomNumber] = useState('LH-301');

  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  // Live session attendee monitoring
  const [scannedStudents, setScannedStudents] = useState([]);
  const [polling, setPolling] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  // Load subject and class dropdown options
  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const [subRes, clsRes] = await Promise.all([
          facultyApi.getSubjects(),
          facultyApi.getClasses(),
        ]);
        if (subRes.success && subRes.data) {
          setSubjects(subRes.data);
          if (subRes.data.length > 0) setSelectedSubjectId(subRes.data[0].id);
        }
        if (clsRes.success && clsRes.data) {
          setClasses(clsRes.data);
          if (clsRes.data.length > 0) setSelectedClassId(clsRes.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load subjects or classes', err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  // Poll for scanned students when an active session is visible
  useEffect(() => {
    let timer = null;
    if (activeSession && activeSession.id) {
      const fetchScanned = async () => {
        try {
          const res = await facultyApi.getScannedStudents(activeSession.id);
          if (res.success && res.data) {
            setScannedStudents(res.data);
          }
        } catch (err) {
          console.error('Error fetching attendees', err);
        }
      };

      fetchScanned();
      timer = setInterval(fetchScanned, 3000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeSession]);

  // Expiry countdown timer
  useEffect(() => {
    if (!activeSession || !activeSession.expiryTime) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const expiry = new Date(activeSession.expiryTime).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeLeft(diff);

      if (diff <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId || !selectedClassId) {
      setErrorMsg('Please select both a Subject and Class.');
      return;
    }

    setCreating(true);
    setErrorMsg(null);
    try {
      const res = await facultyApi.createSession({
        subjectId: Number(selectedSubjectId),
        classId: Number(selectedClassId),
        sessionDate,
        durationMinutes: Number(durationMinutes),
        roomNumber,
      });

      if (res.success && res.data) {
        setActiveSession(res.data);
        setScannedStudents([]);
      } else {
        throw new Error(res.message || 'Failed to create session');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error generating QR code session');
    } finally {
      setCreating(false);
    }
  };

  const handleCloseSession = async () => {
    if (!activeSession) return;
    try {
      await facultyApi.closeSession(activeSession.id);
      setActiveSession(null);
      if (onSessionClosed) onSessionClosed();
    } catch (err) {
      alert('Error closing session: ' + err.message);
    }
  };

  const copyToken = () => {
    if (activeSession?.qrToken) {
      navigator.clipboard.writeText(activeSession.qrToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCountdown = (seconds) => {
    if (seconds == null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: activeSession ? '1fr 1.2fr' : '1fr', gap: '24px' }}>
      {/* Session Generator Card */}
      <div className="card-panel">
        <div className="card-header">
          <div className="card-title">
            <QrCode size={20} color="#2563eb" />
            <span>{activeSession ? 'Session Details' : 'Generate New Attendance QR Session'}</span>
          </div>
        </div>

        <div className="card-body">
          {errorMsg && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {!activeSession ? (
            <form onSubmit={handleCreateSession}>
              <div className="form-group">
                <label className="form-label">Select Subject</label>
                <select
                  className="form-select"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  disabled={loadingOptions || creating}
                  required
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.subjectCode} - {sub.subjectName} ({sub.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Class / Section</label>
                <select
                  className="form-select"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  disabled={loadingOptions || creating}
                  required
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.className} ({cls.section || 'All'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Lecture Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">QR Valid Duration</label>
                  <select
                    className="form-select"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                  >
                    <option value={5}>5 Minutes (Strict)</option>
                    <option value={10}>10 Minutes</option>
                    <option value={15}>15 Minutes (Standard)</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Lecture Hall / Room</label>
                <input
                  type="text"
                  className="form-input"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. LH-301 or Lab 4"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '8px' }}
                disabled={creating || loadingOptions}
              >
                {creating ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
                <span>{creating ? 'Generating Secure QR...' : 'Generate Live Attendance QR Code'}</span>
              </button>
            </form>
          ) : (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Active Subject & Class
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                    {activeSession.subject?.subjectCode}: {activeSession.subject?.subjectName}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#3b82f6', fontWeight: 600, marginTop: '2px' }}>
                    {activeSession.collegeClass?.className}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} /> Session Code
                    </span>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{activeSession.sessionCode}</strong>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} /> Room
                    </span>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{activeSession.roomNumber || 'LH-301'}</strong>
                  </div>
                </div>

                {/* QR Token copy tool for simulation / manual testing */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={activeSession.qrToken}
                    className="form-input"
                    style={{ fontSize: '0.78rem', background: '#f1f5f9' }}
                  />
                  <button className="btn btn-secondary" onClick={copyToken} title="Copy QR Token">
                    {copied ? <Check size={16} color="#059669" /> : <Copy size={16} />}
                  </button>
                </div>

                <button
                  className="btn btn-danger"
                  onClick={handleCloseSession}
                  style={{ width: '100%', marginTop: '6px' }}
                >
                  <StopCircle size={18} />
                  <span>Close Session & Lock Attendance</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live QR Code Display & Live Attendees Monitor */}
      {activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* QR Display Card */}
          <div className="card-panel" style={{ textAlign: 'center' }}>
            <div className="card-header" style={{ justifyContent: 'center' }}>
              <span className="qr-timer-pill">
                <Clock size={16} />
                <span>Expires in: {formatCountdown(timeLeft)}</span>
              </span>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="qr-code-wrapper">
                <QRCodeSVG
                  value={activeSession.qrToken}
                  size={240}
                  level="H"
                  includeMargin={true}
                  bgColor="#FFFFFF"
                  fgColor="#1E3A8A"
                />
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                Scan with Student Camera
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '340px', marginTop: '4px' }}>
                Students in {activeSession.collegeClass?.className} can scan this code to mark immediate attendance.
              </p>
            </div>
          </div>

          {/* Real-time Attendees Feed */}
          <div className="card-panel">
            <div className="card-header">
              <div className="card-title">
                <Users size={18} color="#059669" />
                <span>Live Attendees Ticker ({scannedStudents.length} Present)</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                Live Syncing (3s)
              </span>
            </div>

            <div className="card-body" style={{ padding: 0 }}>
              {scannedStudents.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px' }}>
                  <p style={{ fontSize: '0.9rem' }}>Waiting for students to scan the QR code...</p>
                </div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '260px' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Photo</th>
                        <th>Roll No</th>
                        <th>Student Name</th>
                        <th>Time</th>
                        <th>Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scannedStudents.map((stu) => (
                        <tr key={stu.id}>
                          <td>
                            {stu.capturedPhoto ? (
                              <img
                                src={stu.capturedPhoto}
                                alt={stu.studentName}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  objectFit: 'cover',
                                  border: '2px solid #10b981',
                                  cursor: 'pointer'
                                }}
                                onClick={() => setSelectedPhoto(stu)}
                                title="Click to view student face snapshot"
                              />
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>-</span>
                            )}
                          </td>
                          <td><strong>{stu.rollNumber}</strong></td>
                          <td>{stu.studentName}</td>
                          <td>{stu.recordTime ? stu.recordTime.toString().substring(0, 5) : 'Now'}</td>
                          <td>
                            <span className="badge badge-present">
                              <CheckCircle2 size={12} /> {stu.method}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scanned Student Photo Modal */}
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
              maxWidth: '380px',
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
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Student Attendance Photo</h3>
            </div>

            <img
              src={selectedPhoto.capturedPhoto}
              alt="Student Face Snapshot"
              style={{
                width: '240px',
                height: '240px',
                objectFit: 'cover',
                borderRadius: '12px',
                border: '3px solid #10b981',
                margin: '0 auto',
                display: 'block',
              }}
            />

            <div style={{ marginTop: '16px', padding: '12px', background: '#f0fdf4', borderRadius: '10px' }}>
              <p style={{ fontSize: '0.92rem', color: '#15803d', fontWeight: 700 }}>
                {selectedPhoto.studentName} ({selectedPhoto.rollNumber})
              </p>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                Method: {selectedPhoto.method} • Live Session Attendee
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
