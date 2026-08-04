import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer style={{ padding: '20px 32px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(11,21,40,0.5)', marginTop: 'auto' }}>
      <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
        &copy; {currentYear} MediMatrix Pro. All rights reserved. Restructured Node-React Stack.
      </p>
    </footer>
  );
};

export default Footer;
