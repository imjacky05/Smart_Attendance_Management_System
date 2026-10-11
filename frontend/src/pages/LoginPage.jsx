import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  User,
  Phone,
  Briefcase,
  KeyRound,
  ArrowLeft,
  Send,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';

export default function LoginPage() {
  const { login, register, loading, authError } = useAuth();

  // Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regRole, setRegRole] = useState('STUDENT'); // STUDENT or FACULTY
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Student specific fields
  const [rollNumber, setRollNumber] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [semester, setSemester] = useState(1);
  const [batch, setBatch] = useState('2025-2029');

  // Faculty specific fields
  const [facultyCode, setFacultyCode] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [officeRoom, setOfficeRoom] = useState('Cabin A-101');

  // Classes list for student registration
  const [classList, setClassList] = useState([]);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  // Status feedback
  const [localError, setLocalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    async function loadRegistrationClasses() {
      try {
        const res = await authApi.getRegistrationClasses();
        if (res.success && res.data) {
          setClassList(res.data);
          if (res.data.length > 0) {
            setSelectedClassId(res.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load classes for registration', err);
      }
    }
    loadRegistrationClasses();
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);
    if (!loginEmail || !loginPassword) {
      setLocalError('Please enter both email and password.');
      return;
    }

    const res = await login(loginEmail, loginPassword);
    if (!res.success) {
      setLocalError(res.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);

    if (!fullName || !regEmail || !regPassword) {
      setLocalError('Please fill in all required fields (Name, Email, Password).');
      return;
    }

    const payload = {
      fullName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      phone,
      department,
      ...(regRole === 'STUDENT'
        ? {
            rollNumber: rollNumber || `CS2025${Math.floor(100 + Math.random() * 900)}`,
            classId: selectedClassId ? Number(selectedClassId) : null,
            semester: Number(semester),
            batch,
          }
        : {
            facultyCode: facultyCode || `FAC-CSE-${Math.floor(100 + Math.random() * 900)}`,
            designation,
            officeRoom,
          }),
    };

    const res = await register(payload);
    if (!res.success) {
      setLocalError(res.error || 'Registration failed.');
    } else {
      setSuccessMsg('Registration successful! Logging you in...');
    }
  };

  // Forgot Password: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);

    if (!forgotEmail) {
      setLocalError('Please enter your registered college email address.');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await authApi.forgotPassword(forgotEmail);
      if (res.success) {
        setOtpSent(true);
        if (res.data?.otp) {
          setEnteredOtp(res.data.otp); // Pre-fill for seamless evaluation
        }
        setSuccessMsg(res.message || 'OTP verification code has been sent!');
      } else {
        throw new Error(res.message || 'Failed to send reset code');
      }
    } catch (err) {
      setLocalError(err.message || 'Error sending password reset request.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Forgot Password: Reset with OTP
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);

    if (!enteredOtp || !newPassword) {
      setLocalError('Please provide both the 6-digit OTP and new password.');
      return;
    }

    if (newPassword.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('New password and confirm password do not match.');
      return;
    }

    setResettingPassword(true);
    try {
      const res = await authApi.resetPassword(forgotEmail, enteredOtp, newPassword);
      if (res.success) {
        setSuccessMsg('Password has been reset successfully! Please sign in with your new password.');
        setLoginEmail(forgotEmail);
        setLoginPassword('');
        setOtpSent(false);
        setEnteredOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setMode('login');
        }, 1500);
      } else {
        throw new Error(res.message || 'Failed to reset password');
      }
    } catch (err) {
      setLocalError(err.message || 'Error updating password.');
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card" style={{ maxWidth: mode === 'register' ? '540px' : '450px' }}>
        {/* College Logo & Title */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <GraduationCap size={32} />
          </div>
          <h2 className="login-title">Apex College Portal</h2>
          <p className="login-subtitle">Smart Attendance Management System</p>
        </div>

        {/* Auth Mode Toggle Tabs (Hidden during Forgot Password flow) */}
        {mode !== 'forgot' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: '#f1f5f9',
              borderRadius: '10px',
              padding: '4px',
              marginBottom: '24px',
              gap: '4px',
            }}
          >
            <button
              type="button"
              className="btn"
              style={{
                padding: '8px 14px',
                fontSize: '0.88rem',
                borderRadius: '8px',
                fontWeight: 600,
                background: mode === 'login' ? '#ffffff' : 'transparent',
                color: mode === 'login' ? '#1d4ed8' : '#64748b',
                boxShadow: mode === 'login' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
              }}
              onClick={() => {
                setMode('login');
                setLocalError(null);
                setSuccessMsg(null);
              }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              className="btn"
              style={{
                padding: '8px 14px',
                fontSize: '0.88rem',
                borderRadius: '8px',
                fontWeight: 600,
                background: mode === 'register' ? '#ffffff' : 'transparent',
                color: mode === 'register' ? '#1d4ed8' : '#64748b',
                boxShadow: mode === 'register' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
              }}
              onClick={() => {
                setMode('register');
                setLocalError(null);
                setSuccessMsg(null);
              }}
            >
              <UserPlus size={15} />
              <span>Register</span>
            </button>
          </div>
        )}

        {/* Notifications */}
        {(localError || authError) && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{localError || authError}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">College Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="e.g. faculty@college.edu or student@college.edu"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <Mail
                  size={18}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="Enter account password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <Lock
                  size={18}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '14px', padding: '12px' }}
              disabled={loading}
            >
              <LogIn size={18} />
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            </button>

            {/* Links below login: Register here, and Forgot Password below it */}
            <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '0.86rem', color: '#64748b' }}>
                Don't have an account?{' '}
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setMode('register');
                    setLocalError(null);
                    setSuccessMsg(null);
                  }}
                >
                  Register here
                </button>
              </p>

              <p style={{ fontSize: '0.84rem' }}>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setForgotEmail(loginEmail);
                    setMode('forgot');
                    setLocalError(null);
                    setSuccessMsg(null);
                  }}
                >
                  Forgot Password?
                </button>
              </p>
            </div>
          </form>
        )}

        {/* 2. REGISTRATION FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            {/* Role Selection */}
            <div className="form-group">
              <label className="form-label">Register As</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  className="btn"
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    border: regRole === 'STUDENT' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: regRole === 'STUDENT' ? '#eff6ff' : '#ffffff',
                    color: regRole === 'STUDENT' ? '#1d4ed8' : '#475569',
                    fontWeight: regRole === 'STUDENT' ? 700 : 500,
                  }}
                  onClick={() => setRegRole('STUDENT')}
                >
                  <GraduationCap size={16} />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  className="btn"
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    border: regRole === 'FACULTY' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: regRole === 'FACULTY' ? '#eff6ff' : '#ffffff',
                    color: regRole === 'FACULTY' ? '#1d4ed8' : '#475569',
                    fontWeight: regRole === 'FACULTY' ? 700 : 500,
                  }}
                  onClick={() => setRegRole('FACULTY')}
                >
                  <Briefcase size={16} />
                  <span>Faculty</span>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder={regRole === 'STUDENT' ? 'e.g. Rahul Sharma' : 'e.g. Dr. Priya Patel'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <User
                  size={18}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                    placeholder="email@college.edu"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                  <Mail
                    size={18}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Phone
                    size={16}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Create Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="Minimum 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
                <Lock
                  size={18}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            {/* Student Specific Fields */}
            {regRole === 'STUDENT' ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Roll Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. CS202510"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Class / Section</label>
                    <select
                      className="form-select"
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                    >
                      {classList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.className}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-input"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <select
                      className="form-select"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Sem {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            ) : (
              /* Faculty Specific Fields */
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Faculty Code</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. FAC-CSE-201"
                      value={facultyCode}
                      onChange={(e) => setFacultyCode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Assistant Professor"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-input"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Office Room</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Cabin B-201"
                      value={officeRoom}
                      onChange={(e) => setOfficeRoom(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '16px', padding: '12px' }}
              disabled={loading}
            >
              <UserPlus size={18} />
              <span>{loading ? 'Registering...' : `Register as ${regRole === 'STUDENT' ? 'Student' : 'Faculty'}`}</span>
            </button>

            <div style={{ textAlign: 'center', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '0.86rem', color: '#64748b' }}>
                Already have an account?{' '}
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setMode('login');
                    setLocalError(null);
                    setSuccessMsg(null);
                  }}
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        )}

        {/* 3. FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <KeyRound size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Forgot Password</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Recover your college account access</p>
              </div>
            </div>

            {!otpSent ? (
              /* Step 1: Enter Email to receive OTP */
              <form onSubmit={handleRequestOtp}>
                <p style={{ fontSize: '0.86rem', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
                  Enter your registered college email. We will generate a 6-digit verification code to reset your password.
                </p>

                <div className="form-group">
                  <label className="form-label">Registered College Email</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                      placeholder="e.g. student@college.edu"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                    <Mail
                      size={18}
                      color="#94a3b8"
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '12px', padding: '12px' }}
                  disabled={sendingOtp}
                >
                  {sendingOtp ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                  <span>{sendingOtp ? 'Generating Code...' : 'Send Verification OTP'}</span>
                </button>
              </form>
            ) : (
              /* Step 2: Enter OTP & Set New Password */
              <form onSubmit={handleResetPasswordSubmit}>
                <div className="form-group">
                  <label className="form-label">6-Digit Verification OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    className="form-input"
                    placeholder="Enter 6-digit OTP code"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    style={{ letterSpacing: '4px', textAlign: 'center', fontWeight: 700, fontSize: '1.1rem' }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <Lock
                      size={18}
                      color="#94a3b8"
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <Lock
                      size={18}
                      color="#94a3b8"
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '14px', padding: '12px' }}
                  disabled={resettingPassword}
                >
                  {resettingPassword ? <RefreshCw size={16} className="animate-spin" /> : <KeyRound size={16} />}
                  <span>{resettingPassword ? 'Updating Password...' : 'Reset & Update Password'}</span>
                </button>
              </form>
            )}

            {/* Back to Sign In button */}
            <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.86rem', padding: '8px 16px', width: '100%' }}
                onClick={() => {
                  setMode('login');
                  setLocalError(null);
                  setSuccessMsg(null);
                  setOtpSent(false);
                }}
              >
                <ArrowLeft size={15} />
                <span>Back to Sign In</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
