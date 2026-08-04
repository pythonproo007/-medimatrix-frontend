import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('employee');
  
  // Forgot password inputs
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Doctor properties
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [clinicHospital, setClinicHospital] = useState('');

  // Employee properties
  const [position, setPosition] = useState('Pharmacist');
  const [salary, setSalary] = useState('18000');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, registerUser, forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const data = {
        username,
        password,
        email,
        role,
        fullName,
        phone,
        registrationNumber,
        clinicHospital,
        position,
        salary
      };
      const res = await registerUser(data);
      if (res.success) {
        setMessage('Registration successful! Please login.');
        setMode('login');
        setPassword('');
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await forgotPassword(forgotUsername, forgotEmail, newPassword);
      if (res.success) {
        setMessage(res.message || 'Password reset successful! Please login.');
        setMode('login');
        setForgotUsername('');
        setForgotEmail('');
        setNewPassword('');
      } else {
        setError(res.error || 'Reset failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      position: 'relative',
      fontFamily: 'Plus Jakarta Sans, sans-serif'
    }}>
      <div style={{
        width: '450px',
        background: 'var(--bg-surface)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '40px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div className="logo-icon" style={{ margin: '0 auto 15px', width: '56px', height: '56px' }}>
            <i className="fa-solid fa-prescription" style={{ fontSize: '1.8rem' }}></i>
          </div>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', fontWeight: '700', fontFamily: 'Outfit, sans-serif' }}>
            Medi<span>Matrix</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '5px', textTransform: 'uppercase' }}>
            {mode === 'login' && 'AUTHENTICATE USER SESSION'}
            {mode === 'register' && 'REGISTER SYSTEM ACCOUNT'}
            {mode === 'forgot' && 'RECOVER ACCOUNT ACCESS'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'var(--rose-light)', border: '1px solid var(--rose)', color: 'var(--rose)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div style={{ background: 'var(--emerald-light)', border: '1px solid var(--emerald)', color: 'var(--emerald)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-circle-check"></i>
            <span>{message}</span>
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                placeholder="Enter username"
                style={{ width: '100%', padding: '12px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              />
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Password</label>
                <button 
                  type="button" 
                  onClick={() => { setError(''); setMessage(''); setMode('forgot'); }}
                  style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', fontSize: '0.78rem' }}
                >
                  Forgot Password?
                </button>
              </div>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="Enter password"
                style={{ width: '100%', padding: '12px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-pos-checkout" 
              style={{ width: '100%', padding: '12px', marginTop: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
            >
              {loading ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                <>
                  <i className="fa-solid fa-key"></i> Sign In to Dashboard
                </>
              )}
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Account Username</label>
              <input 
                type="text" 
                value={forgotUsername} 
                onChange={(e) => setForgotUsername(e.target.value)} 
                required 
                placeholder="Enter username"
                style={{ width: '100%', padding: '12px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Registered Email Address</label>
              <input 
                type="email" 
                value={forgotEmail} 
                onChange={(e) => setForgotEmail(e.target.value)} 
                required 
                placeholder="Enter email address"
                style={{ width: '100%', padding: '12px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>New Password Setup</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                placeholder="Enter new password"
                style={{ width: '100%', padding: '12px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-pos-checkout btn-emerald" 
              style={{ width: '100%', padding: '12px', marginTop: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
            >
              {loading ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                <>
                  <i className="fa-solid fa-shield-halved"></i> Reset Account Password
                </>
              )}
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '5px' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Role</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              >
                <option value="employee" style={{ background: '#0b1528' }}>Pharmacist Employee</option>
                <option value="doctor" style={{ background: '#0b1528' }}>Prescribing Doctor</option>
                <option value="admin" style={{ background: '#0b1528' }}>System Administrator</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Full Name</label>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Phone</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              />
            </div>

            {role === 'doctor' && (
              <>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Medical License / Registration No.</label>
                  <input 
                    type="text" 
                    value={registrationNumber} 
                    onChange={(e) => setRegistrationNumber(e.target.value)} 
                    placeholder="e.g. DOC-12345" 
                    required 
                    style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Clinic / Hospital Location</label>
                  <input 
                    type="text" 
                    value={clinicHospital} 
                    onChange={(e) => setClinicHospital(e.target.value)} 
                    placeholder="e.g. City Health Clinic" 
                    required 
                    style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                  />
                </div>
              </>
            )}

            {role === 'employee' && (
              <>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Job Position</label>
                  <input 
                    type="text" 
                    value={position} 
                    onChange={(e) => setPosition(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Monthly Salary ($)</label>
                  <input 
                    type="number" 
                    value={salary} 
                    onChange={(e) => setSalary(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                  />
                </div>
              </>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-pos-checkout btn-emerald" 
              style={{ width: '100%', padding: '12px', marginTop: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
            >
              {loading ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                <>
                  <i className="fa-solid fa-user-plus"></i> Register Account
                </>
              )}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {mode !== 'login' ? (
            <button 
              onClick={() => { setError(''); setMessage(''); setMode('login'); }}
              style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
            >
              Back to Sign In
            </button>
          ) : (
            <>
              <button 
                onClick={() => { setError(''); setMessage(''); setMode('register'); }}
                style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
              >
                Create Account
              </button>
              <button 
                onClick={() => { setError(''); setMessage(''); setMode('forgot'); }}
                style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
              >
                Forgot Password?
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
