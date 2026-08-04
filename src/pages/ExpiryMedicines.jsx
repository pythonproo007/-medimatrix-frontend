import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ExpiryMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadExpiryData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/medicines?filterAlert=expiring_soon');
      if (res.success) {
        setMedicines(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpiryData();
  }, []);

  const handleDispose = async (id, quantity) => {
    if (window.confirm(`Are you sure you want to log disposal of all ${quantity} units of this expired medicine batch?`)) {
      try {
        const res = await api.post(`/api/medicines/${id}/stock-out`, {
          quantity,
          reason: 'Disposal of Expired Drug Batch'
        });
        if (res.success) {
          setMessage(`Successfully disposed of expired medicine batch! New stock quantity: ${res.data.quantity}`);
          loadExpiryData();
          setTimeout(() => setMessage(''), 4000);
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const now = new Date();

  return (
    <div style={{ padding: '32px' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff' }}>Expiry Warnings & Disposals</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Validate medicines approaching expiration limits (&lt;60 days) and log hazardous waste disposal transactions</p>
      </div>

      {message && (
        <div style={{ background: 'var(--emerald-light)', border: '1px solid var(--emerald)', color: 'var(--emerald)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* Warning Panel */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px 10px' }}>Medicine Code</th>
              <th style={{ padding: '12px 10px' }}>Medicine Name</th>
              <th style={{ padding: '12px 10px' }}>Batch Number</th>
              <th style={{ padding: '12px 10px' }}>Available Quantity</th>
              <th style={{ padding: '12px 10px' }}>Expiry Date</th>
              <th style={{ padding: '12px 10px' }}>Rack Location</th>
              <th style={{ padding: '12px 10px' }}>Days Remaining</th>
              <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Processing expiry calendar...
                </td>
              </tr>
            ) : medicines.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No medicines currently expiring within 60 days.
                </td>
              </tr>
            ) : (
              medicines.map((med) => {
                const expDate = new Date(med.expiryDate);
                const isExpired = expDate < now;
                const daysDiff = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
                return (
                  <tr key={med._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.88rem' }}>
                    <td style={{ padding: '12px 10px', color: 'var(--primary)', fontWeight: '600' }}>{med.code}</td>
                    <td style={{ padding: '12px 10px', color: '#fff', fontWeight: '500' }}>{med.name}</td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{med.batchNumber}</td>
                    <td style={{ padding: '12px 10px', color: '#fff', fontWeight: '600' }}>{med.quantity}</td>
                    <td style={{ padding: '12px 10px', color: isExpired ? 'var(--rose)' : 'var(--amber)', fontWeight: '600' }}>
                      {expDate.toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-dim)' }}>{med.rackLocation}</td>
                    <td style={{ padding: '12px 10px' }}>
                      {isExpired ? (
                        <span className="badge danger">Expired</span>
                      ) : (
                        <span className="badge warning">{daysDiff} days left</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      {med.quantity > 0 && (
                        <button onClick={() => handleDispose(med._id, med.quantity)} className="badge danger" style={{ border: 'none', cursor: 'pointer' }}>
                          <i className="fa-solid fa-trash-can"></i> Dispose Batch
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default ExpiryMedicines;
