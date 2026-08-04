import React, { useState, useEffect } from 'react';
import api from '../services/api';

const LowStock = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLowStock = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/medicines?filterAlert=low_stock');
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
    loadLowStock();
  }, []);

  return (
    <div style={{ padding: '32px' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff' }}>Low Stock Warning Panel</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Validate medicines whose quantity has dropped below configured minimum alert thresholds</p>
      </div>

      {/* Warning Panel */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px 10px' }}>Med Code</th>
              <th style={{ padding: '12px 10px' }}>Medicine Name</th>
              <th style={{ padding: '12px 10px' }}>Rack Location</th>
              <th style={{ padding: '12px 10px' }}>Available Qty</th>
              <th style={{ padding: '12px 10px' }}>Min Alert Threshold</th>
              <th style={{ padding: '12px 10px' }}>Supplier / Manufacturer</th>
              <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Scanning inventory...
                </td>
              </tr>
            ) : medicines.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-circle-check text-emerald" style={{ marginRight: '8px' }}></i> All stocks are healthy! No low stock alerts active.
                </td>
              </tr>
            ) : (
              medicines.map((med) => (
                <tr key={med._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.88rem' }}>
                  <td style={{ padding: '12px 10px', color: 'var(--primary)', fontWeight: '600' }}>{med.code}</td>
                  <td style={{ padding: '12px 10px', color: '#fff', fontWeight: '500' }}>{med.name}</td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-dim)' }}>{med.rackLocation}</td>
                  <td style={{ padding: '12px 10px', color: 'var(--rose)', fontWeight: '700' }}>
                    {med.quantity} {med.medicineType}s
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{med.minStockAlert} units</td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{med.manufacturer}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <a href="#/purchase-details" className="badge info" style={{ textDecoration: 'none' }}>
                      <i className="fa-solid fa-cart-flatbed"></i> Reorder Now
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default LowStock;
