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
  const [showPassword, setShowPassword] = useState(false);

  const { login, registerUser, forgotPassword } = useAuth();
  const navigate = useNavigate();

  const fillQuickLogin = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
    setMessage('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    const result = await login(username.trim(), password);
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
        // Automatically sign in the user upon successful registration
        const loginResult = await login(username.trim(), password);
        if (loginResult.success) {
          navigate('/');
          return;
        }
        setMessage('Account registered successfully! Please log in below.');
        setMode('login');
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
        setMessage(res.message || 'Password reset successful! Please log in.');
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
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 15% 15%, rgba(6, 182, 212, 0.15), transparent 45%), radial-gradient(circle at 85% 85%, rgba(139, 92, 246, 0.15), transparent 45%), #070d19',
      padding: '20px',
      position: 'relative',
      overflowX: 'hidden',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* Background Decorative Ambient Orbs */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '350px',
        height: '350px',
        background: 'rgba(6, 182, 212, 0.12)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: '400px',
        height: '400px',
        background: 'rgba(16, 185, 129, 0.1)',
        borderRadius: '50%',
        filter: 'blur(90px)',
        pointerEvents: 'none'
      }}></div>

      {/* Main Glassmorphic Wrapper */}
      <div style={{
        width: '100%',
        maxWidth: '1000px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        background: 'rgba(15, 26, 48, 0.75)',
        backdropFilter: 'blur(25px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(6, 182, 212, 0.15)',
        overflow: 'hidden'
      }}>
        {/* Left Side: Brand Banner */}
        <div style={{
          padding: '48px 40px',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(15, 26, 48, 0.9) 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div>
            {/* System Status Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontSize: '0.78rem',
              fontWeight: '600',
              marginBottom: '30px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 10px #10b981'
              }}></span>
              System Online • v2.5 Enterprise
            </div>

            {/* Main Brand Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.8rem',
                boxShadow: '0 10px 20px rgba(6, 182, 212, 0.35)'
              }}>
                <i className="fa-solid fa-prescription-bottle-medical"></i>
              </div>
              <div>
                <h1 style={{
                  fontSize: '2rem',
                  fontWeight: '800',
                  color: '#fff',
                  fontFamily: "'Outfit', sans-serif",
                  letterSpacing: '-0.5px',
                  margin: 0
                }}>
                  Medi<span style={{ color: '#06b6d4' }}>Matrix</span>
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '2px 0 0' }}>
                  Pharmacy POS & Medical Intelligence
                </p>
              </div>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '35px' }}>
              Empowering healthcare management with real-time stock control, automated POS billing, and intelligent prescription tracking.
            </p>

            {/* Feature Highlights Grid */}
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#e2e8f0', fontSize: '0.88rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
                  <i className="fa-solid fa-[#06b6d4] fa-cart-shopping"></i>
                </div>
                <span>Fast & Accurate POS Billing</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#e2e8f0', fontSize: '0.88rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <i className="fa-solid fa-boxes-stacked"></i>
                </div>
                <span>Automated Low-Stock & Expiry Alerts</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#e2e8f0', fontSize: '0.88rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                  <i className="fa-solid fa-file-prescription"></i>
                </div>
                <span>Doctor Prescription Auto-Deduction</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.78rem' }}>
            <span>© 2026 MediMatrix Inc.</span>
            <span>Secured with 256-bit JWT</span>
          </div>
        </div>

        {/* Right Side: Auth Form Container */}
        <div style={{ padding: '44px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Segmented Control Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(21, 35, 62, 0.8)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '28px'
          }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setMessage(''); }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: mode === 'login' ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : 'transparent',
                color: mode === 'login' ? '#fff' : '#94a3b8',
                fontWeight: mode === 'login' ? '700' : '500',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: mode === 'login' ? '0 4px 12px rgba(6, 182, 212, 0.3)' : 'none'
              }}
            >
              <i className="fa-solid fa-right-to-bracket" style={{ marginRight: '6px' }}></i> Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); setMessage(''); }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: mode === 'register' ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : 'transparent',
                color: mode === 'register' ? '#fff' : '#94a3b8',
                fontWeight: mode === 'register' ? '700' : '500',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: mode === 'register' ? '0 4px 12px rgba(6, 182, 212, 0.3)' : 'none'
              }}
            >
              <i className="fa-solid fa-user-plus" style={{ marginRight: '6px' }}></i> Register
            </button>
            <button
              type="button"
              onClick={() => { setMode('forgot'); setError(''); setMessage(''); }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: mode === 'forgot' ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : 'transparent',
                color: mode === 'forgot' ? '#fff' : '#94a3b8',
                fontWeight: mode === 'forgot' ? '700' : '500',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: mode === 'forgot' ? '0 4px 12px rgba(6, 182, 212, 0.3)' : 'none'
              }}
            >
              <i className="fa-solid fa-key" style={{ marginRight: '6px' }}></i> Reset
            </button>
          </div>

          {/* Alert Messages */}
          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#f43f5e',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '1rem' }}></i>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#10b981',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: '1rem' }}></i>
              <span>{message}</span>
            </div>
          )}

          {/* Mode 1: LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Quick Fill Demo Access Box */}
              <div style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px dashed rgba(6, 182, 212, 0.3)',
                padding: '12px 14px',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '0.74rem', color: '#06b6d4', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa-solid fa-bolt"></i> One-Click Demo Credentials
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => fillQuickLogin('admin', 'admin123')}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(6, 182, 212, 0.25)',
                      border: '1px solid #06b6d4',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    👑 Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickLogin('doctor', 'doctor123')}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(16, 185, 129, 0.25)',
                      border: '1px solid #10b981',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    🩺 Doctor
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickLogin('employee', 'employee123')}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(99, 102, 241, 0.25)',
                      border: '1px solid #6366f1',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    👤 Employee
                  </button>
                </div>
              </div>

              {/* Username Input */}
              <div>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                  Username, Email, or Mobile Number
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="fa-solid fa-user" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.9rem' }}></i>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="e.g. 9876543210 or admin"
                    style={{
                      width: '100%',
                      padding: '13px 14px 13px 40px',
                      background: 'rgba(21, 35, 62, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: '600' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setError(''); setMessage(''); setMode('forgot'); }}
                    style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600' }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <i className="fa-solid fa-lock" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.9rem' }}></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                    style={{
                      width: '100%',
                      padding: '13px 42px 13px 40px',
                      background: 'rgba(21, 35, 62, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  marginTop: '6px',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 10px 20px rgba(6, 182, 212, 0.35)',
                  transition: 'all 0.2s ease'
                }}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Authenticating...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-right-to-bracket"></i> Sign In to MediMatrix
                  </>
                )}
              </button>
            </form>
          )}

          {/* Mode 2: REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Select Account Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setRole('employee')}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '8px',
                      border: role === 'employee' ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
                      background: role === 'employee' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(21, 35, 62, 0.6)',
                      color: role === 'employee' ? '#06b6d4' : '#94a3b8',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    👤 Pharmacist
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('doctor')}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '8px',
                      border: role === 'doctor' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                      background: role === 'doctor' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(21, 35, 62, 0.6)',
                      color: role === 'doctor' ? '#10b981' : '#94a3b8',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    🩺 Doctor
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '8px',
                      border: role === 'admin' ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                      background: role === 'admin' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(21, 35, 62, 0.6)',
                      color: role === 'admin' ? '#8b5cf6' : '#94a3b8',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    👑 Admin
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Choose username"
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(21, 35, 62, 0.9)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Choose password"
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(21, 35, 62, 0.9)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Full Name & Email</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Full Name"
                    style={{ padding: '10px 12px', background: 'rgba(21, 35, 62, 0.9)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Email Address"
                    style={{ padding: '10px 12px', background: 'rgba(21, 35, 62, 0.9)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="e.g. +1 555 0192"
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(21, 35, 62, 0.9)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              {role === 'doctor' && (
                <>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '4px' }}>License / Reg. Number</label>
                    <input
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="e.g. DOC-98765"
                      required
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(21, 35, 62, 0.9)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Clinic / Hospital Name</label>
                    <input
                      type="text"
                      value={clinicHospital}
                      onChange={(e) => setClinicHospital(e.target.value)}
                      placeholder="e.g. Metro Health Hospital"
                      required
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(21, 35, 62, 0.9)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </>
              )}

              {role === 'employee' && (
                <>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Position Title</label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      required
                      placeholder="e.g. Senior Pharmacist"
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(21, 35, 62, 0.9)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '8px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)'
                }}
              >
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-user-plus"></i> Complete Account Registration</>}
              </button>
            </form>
          )}

          {/* Mode 3: FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  Account Username
                </label>
                <input
                  type="text"
                  value={forgotUsername}
                  onChange={(e) => setForgotUsername(e.target.value)}
                  required
                  placeholder="Enter registered username"
                  style={{ width: '100%', padding: '12px', background: 'rgba(21, 35, 62, 0.9)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  Registered Email
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  placeholder="Enter registered email"
                  style={{ width: '100%', padding: '12px', background: 'rgba(21, 35, 62, 0.9)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Set new password"
                  style={{ width: '100%', padding: '12px', background: 'rgba(21, 35, 62, 0.9)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px',
                  marginTop: '6px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.92rem',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)'
                }}
              >
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-key"></i> Reset Account Password</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
