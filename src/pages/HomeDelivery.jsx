import React, { useState, useEffect } from 'react';
import api from '../services/api';

const HomeDelivery = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedDel, setSelectedDel] = useState(null);

  // Form states
  const [deliveryStatus, setDeliveryStatus] = useState('Pending');
  const [deliveryBoyName, setDeliveryBoyName] = useState('');
  const [deliveryBoyPhone, setDeliveryBoyPhone] = useState('');

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/deliveries');
      if (res.success) setDeliveries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const handleUpdateClick = (del) => {
    setSelectedDel(del);
    setDeliveryStatus(del.deliveryStatus);
    setDeliveryBoyName(del.deliveryBoyName || '');
    setDeliveryBoyPhone(del.deliveryBoyPhone || '');
    setShowStatusModal(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/api/deliveries/${selectedDel._id}/status`, {
        deliveryStatus,
        deliveryBoyName,
        deliveryBoyPhone
      });
      if (res.success) {
        setMessage(`Delivery status for Invoice ${selectedDel.invoiceNo} successfully updated to "${deliveryStatus}"!`);
        setShowStatusModal(false);
        loadDeliveries();
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff' }}>Home Delivery Courier Center</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Monitor prescriptions shipping logs and manage status of customer home deliveries</p>
      </div>

      {message && (
        <div style={{ background: 'var(--emerald-light)', border: '1px solid var(--emerald)', color: 'var(--emerald)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* Deliveries Table */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px 10px' }}>Invoice No</th>
              <th style={{ padding: '12px 10px' }}>Recipient Name</th>
              <th style={{ padding: '12px 10px' }}>Phone Number</th>
              <th style={{ padding: '12px 10px' }}>Shipping Address</th>
              <th style={{ padding: '12px 10px' }}>Delivery Courier Agent</th>
              <th style={{ padding: '12px 10px' }}>Status</th>
              <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading shipping logs...
                </td>
              </tr>
            ) : deliveries.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No active home delivery orders queued.
                </td>
              </tr>
            ) : (
              deliveries.map((del) => (
                <tr key={del._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.88rem' }}>
                  <td style={{ padding: '12px 10px', color: 'var(--primary)', fontWeight: '600' }}>{del.invoiceNo}</td>
                  <td style={{ padding: '12px 10px', color: '#fff', fontWeight: '500' }}>{del.customerName}</td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{del.customerPhone}</td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-dim)', fontSize: '0.82rem' }}>{del.deliveryAddress}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ color: '#fff' }}>{del.deliveryBoyName || 'Unassigned'}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{del.deliveryBoyPhone}</div>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className={`badge ${
                      del.deliveryStatus === 'Delivered' ? 'success' : 
                      del.deliveryStatus === 'Out for Delivery' ? 'warning' : 
                      del.deliveryStatus === 'Cancelled' ? 'danger' : 'info'
                    }`}>
                      {del.deliveryStatus}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <button onClick={() => handleUpdateClick(del)} className="badge info" style={{ border: 'none', cursor: 'pointer' }}>
                      <i className="fa-solid fa-truck-ramp-box"></i> Manage Status
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && selectedDel && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '32px', borderRadius: 'var(--radius-lg)', width: '500px' }}>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Manage Delivery status (Inv {selectedDel.invoiceNo})</span>
              <button onClick={() => setShowStatusModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </h3>

            <form onSubmit={handleStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Shipping Status</label>
                <select value={deliveryStatus} onChange={(e) => setDeliveryStatus(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}>
                  <option value="Pending">Pending Assignment</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered Successfully</option>
                  <option value="Cancelled">Cancelled / Refused</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Delivery Boy / Courier Agent Name</label>
                <input type="text" value={deliveryBoyName} onChange={(e) => setDeliveryBoyName(e.target.value)} required placeholder="e.g. Courier Service / Agent Name" style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Courier Agent Contact Phone</label>
                <input type="text" value={deliveryBoyPhone} onChange={(e) => setDeliveryBoyPhone(e.target.value)} placeholder="e.g. +1 555-0909" style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
              </div>

              <button type="submit" className="btn-pos-checkout btn-emerald" style={{ padding: '12px', marginTop: '10px', cursor: 'pointer' }}>
                Save Delivery Configuration
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HomeDelivery;
