import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ pageTitle }) => {
  const { user, shopName, updateShopName, updateProfile } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [editingShopName, setEditingShopName] = useState(shopName);
  
  // Theme state persisted in localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'emerald' : 'dark';
    setTheme(nextTheme);
  };

  // Profile form state
  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [clinicHospital, setClinicHospital] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const todayStr = new Date().toLocaleDateString('en-US', dateOptions);

  const handleOpenSettings = () => {
    setEditingShopName(shopName);
    setEmail(user?.email || '');
    setFullName('');
    setPassword('');
    setPhone('');
    setRegistrationNumber('');
    setClinicHospital('');
    setPosition('');
    setSalary('');
    setMessage('');
    setError('');
    setShowSettings(true);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      // 1. Update shop name
      updateShopName(editingShopName);

      // 2. Update user profile details
      const updateData = {};
      if (email) updateData.email = email;
      if (fullName) updateData.fullName = fullName;
      if (password) updateData.password = password;
      if (phone) updateData.phone = phone;
      if (registrationNumber) updateData.registrationNumber = registrationNumber;
      if (clinicHospital) updateData.clinicHospital = clinicHospital;
      if (position) updateData.position = position;
      if (salary) updateData.salary = salary;

      const res = await updateProfile(updateData);
      if (res.success) {
        setMessage('Settings and Profile updated successfully!');
        setTimeout(() => setShowSettings(false), 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="top-header">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '700', fontFamily: 'Outfit, sans-serif', color: 'var(--text-main)' }}>
            {pageTitle || 'Dashboard'}
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Welcome back, {user?.username}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Current Date */}
          <div id="current-date-display" className="header-date" style={{ color: 'var(--primary)', fontWeight: '500', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-regular fa-calendar"></i>
            <span>{todayStr}</span>
          </div>

          {/* Theme Change Icon Button (Persisted Theme Switcher) */}
          <button 
            type="button"
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'var(--transition)',
              color: 'var(--text-main)',
              fontSize: '0.82rem',
              fontWeight: '600'
            }}
            title={`Current Theme: ${theme.toUpperCase()}. Click to switch theme.`}
          >
            <i className={
              theme === 'dark' ? 'fa-solid fa-moon text-cyan' :
              theme === 'light' ? 'fa-solid fa-sun text-amber' :
              'fa-solid fa-leaf text-emerald'
            } style={{ fontSize: '1.05rem' }}></i>
            <span style={{ textTransform: 'capitalize' }}>{theme} Theme</span>
          </button>

          {/* Settings / Profile Icon */}
          <div 
            onClick={handleOpenSettings}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px', cursor: 'pointer' }}
            title="Edit Profile & Settings"
          >
            <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-highlight)' }}>
              <i className="fa-solid fa-gear" style={{ color: 'var(--primary)' }}></i>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>{user?.username}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>Settings / {user?.role}</span>
            </div>
          </div>
        </div>
      </header>


      {/* Settings Modal */}
      {showSettings && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '32px', borderRadius: 'var(--radius-lg)', width: '600px', maxHeight: '90vh', overflowY: 'auto', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700' }}>
              <span>Configure System & Account Settings</span>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
            </h3>

            {error && (
              <div style={{ background: 'var(--rose-light)', border: '1px solid var(--rose)', color: 'var(--rose)', padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            {message && (
              <div style={{ background: 'var(--emerald-light)', border: '1px solid var(--emerald)', color: 'var(--emerald)', padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
                {message}
              </div>
            )}

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group" style={{ background: 'rgba(6, 182, 212, 0.05)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
                <h4 style={{ color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '700' }}>MEDICAL SHOP CUSTOMIZATION</h4>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Shop Name</label>
                <input 
                  type="text" 
                  value={editingShopName} 
                  onChange={(e) => setEditingShopName(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px', background: '#070d19', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.9rem' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.9rem' }} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Update full name" style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.9rem' }} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Contact Phone</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Update phone" style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.9rem' }} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Reset Password (Optional)</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Type new password" style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.9rem' }} />
                </div>

                {user?.role === 'doctor' && (
                  <>
                    <div className="form-group">
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Doctor License Registration No.</label>
                      <input type="text" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="DOC-12345" style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.9rem' }} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Clinic / Hospital Location</label>
                      <input type="text" value={clinicHospital} onChange={(e) => setClinicHospital(e.target.value)} placeholder="City Health Care" style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.9rem' }} />
                    </div>
                  </>
                )}

                {user?.role === 'employee' && (
                  <>
                    <div className="form-group">
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Job Position</label>
                      <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Senior Pharmacist" style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.9rem' }} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Monthly Salary ($)</label>
                      <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="18000" style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.9rem' }} />
                    </div>
                  </>
                )}
              </div>

              <button type="submit" disabled={saving} className="btn-pos-checkout btn-emerald" style={{ padding: '12px', marginTop: '10px', cursor: 'pointer' }}>
                {saving ? 'Saving changes...' : 'Save Settings & Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

