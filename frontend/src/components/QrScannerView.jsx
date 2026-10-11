import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  VideoOff,
  Zap,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { studentApi } from '../api/studentApi';

export default function QrScannerView({ onAttendanceMarked }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Result dialog
  const [successResult, setSuccessResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const startCamera = async () => {
    setCameraError(null);
    setErrorMessage(null);
    setSuccessResult(null);

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-container');
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleTokenScanned(decodedText);
        },
        (errorMessage) => {
          // ignore frame decode noise
        }
      );

      setCameraActive(true);
      setScanning(true);
    } catch (err) {
      console.error('Camera start error:', err);
      setCameraError('Unable to access device camera. Please allow camera permissions or enter the QR token manually below.');
      setCameraActive(false);
    }
  };

  const stopCamera = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
    } catch (err) {
      console.warn('Error stopping scanner:', err);
    } finally {
      setCameraActive(false);
      setScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handleTokenScanned = async (token) => {
    if (submitting) return;
    await submitToken(token);
  };

  const submitToken = async (token) => {
    if (!token || !token.trim()) return;
    setSubmitting(true);
    setErrorMessage(null);

    // Pause camera scan during submission
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.pause();
      } catch (e) {}
    }

    try {
      const res = await studentApi.markAttendance(token.trim(), navigator.userAgent || 'Web Camera Scanner');
      if (res.success && res.data) {
        setSuccessResult(res.data);
        if (onAttendanceMarked) onAttendanceMarked(res.data);
      } else {
        throw new Error(res.message || 'Failed to record attendance');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error recording attendance. Duplicate or expired session.');
    } finally {
      setSubmitting(false);
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        try {
          html5QrCodeRef.current.resume();
        } catch (e) {}
      }
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    submitToken(manualToken);
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div className="card-panel">
        <div className="card-header">
          <div className="card-title">
            <ScanLine size={20} color="#2563eb" />
            <span>Scan Faculty QR Code</span>
          </div>
          {cameraActive ? (
            <button className="btn btn-secondary" onClick={stopCamera} style={{ padding: '6px 12px' }}>
              <VideoOff size={15} />
              <span>Turn Off Camera</span>
            </button>
          ) : (
            <button className="btn btn-primary" onClick={startCamera} style={{ padding: '6px 14px' }}>
              <Camera size={15} />
              <span>Start Camera</span>
            </button>
          )}
        </div>

        <div className="card-body">
          {/* Notification Banners */}
          {errorMessage && (
            <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Attendance Notice:</strong>
                <p style={{ marginTop: '2px' }}>{errorMessage}</p>
              </div>
            </div>
          )}

          {successResult && (
            <div className="alert alert-success" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={22} style={{ flexShrink: 0, marginTop: '2px', color: '#059669' }} />
              <div>
                <strong style={{ fontSize: '1rem' }}>Attendance Successfully Verified!</strong>
                <p style={{ marginTop: '4px' }}>
                  Marked <strong>PRESENT</strong> for <strong>{successResult.subjectCode}: {successResult.subjectName}</strong>
                </p>
                <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '4px' }}>
                  Session: {successResult.sessionCode} | Recorded at: {successResult.recordTime?.toString() || 'Now'}
                </div>
              </div>
            </div>
          )}

          {/* Camera Viewport */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              id="qr-reader-container"
              style={{
                width: '100%',
                maxWidth: '440px',
                minHeight: cameraActive ? '330px' : '0px',
                borderRadius: '16px',
                overflow: 'hidden',
                background: cameraActive ? '#000000' : 'transparent',
              }}
            ></div>

            {!cameraActive && (
              <div
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '16px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  width: '100%',
                  background: '#f8fafc',
                }}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Camera size={30} />
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Camera Scanner Offline</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '320px', margin: '6px auto 16px' }}>
                  Click below to grant camera permission and scan the projector/faculty screen.
                </p>
                <button className="btn btn-primary" onClick={startCamera}>
                  <Camera size={16} />
                  <span>Activate Camera Scanner</span>
                </button>
              </div>
            )}
          </div>

          {/* Manual Token Fallback for testing/desktop users without webcams */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Zap size={15} color="#64748b" />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Or Enter Session QR Token Manually
              </span>
            </div>
            <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Paste or enter QR Token (e.g. ATT-ACTIVE-DEMO-TOKEN-2026)"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                disabled={submitting}
              />
              <button type="submit" className="btn btn-secondary" disabled={submitting || !manualToken.trim()}>
                {submitting ? <RefreshCw size={16} className="animate-spin" /> : <span>Submit</span>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
