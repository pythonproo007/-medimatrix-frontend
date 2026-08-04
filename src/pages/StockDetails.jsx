import React, { useState, useEffect } from 'react';
import api from '../services/api';

const StockDetails = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      let url = `/api/stock-logs?transactionType=${transactionType}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [search, transactionType]);

  return (
    <div style={{ padding: '32px' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff' }}>Stock Movement Audit Logs</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Trace entire history of stock inputs, sales checkout, manual stock outs and disposal logs</p>
      </div>

      {/* Filter toolbar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <input 
            type="text" 
            placeholder="Search logs by medicine name, reference ID, batch..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 16px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
          />
        </div>

        <select 
          value={transactionType} 
          onChange={(e) => setTransactionType(e.target.value)}
          style={{ padding: '10px 16px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', minWidth: '180px' }}
        >
          <option value="">All Movement Types</option>
          <option value="STOCK_IN">Initial Stock / Restock</option>
          <option value="PURCHASE_IN">Supplier Purchases</option>
          <option value="SALE_AUTO_OUT">Direct POS Sales Out</option>
          <option value="PRESCRIPTION_OUT">Prescription Auto Out</option>
          <option value="EXPIRED_OUT">Expired Stock Disposal</option>
          <option value="MANUAL_OUT">Manual Stock Adjustments</option>
        </select>
      </div>

      {/* Logs Table */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px 10px' }}>Timestamp</th>
              <th style={{ padding: '12px 10px' }}>Movement Type</th>
              <th style={{ padding: '12px 10px' }}>Medicine Name</th>
              <th style={{ padding: '12px 10px' }}>Batch No</th>
              <th style={{ padding: '12px 10px' }}>Quantity Change</th>
              <th style={{ padding: '12px 10px' }}>Reference / Link ID</th>
              <th style={{ padding: '12px 10px' }}>Reason / Notes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading audit history...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No stock logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const isAddition = log.quantityChange > 0;
                return (
                  <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.88rem' }}>
                    <td style={{ padding: '12px 10px', color: 'var(--text-dim)' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span className={`badge ${
                        log.transactionType === 'STOCK_IN' || log.transactionType === 'PURCHASE_IN' ? 'success' :
                        log.transactionType === 'EXPIRED_OUT' ? 'danger' : 'info'
                      }`}>
                        {log.transactionType}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', color: '#fff', fontWeight: '500' }}>{log.medicineName}</td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{log.batchNumber}</td>
                    <td style={{ padding: '12px 10px', color: isAddition ? 'var(--emerald)' : 'var(--rose)', fontWeight: '700' }}>
                      {isAddition ? `+${log.quantityChange}` : log.quantityChange}
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--primary)', fontWeight: '600' }}>
                      {log.referenceId || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                      {log.reason}
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

export default StockDetails;
