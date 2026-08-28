import React, { useState } from 'react';
import { useStockLogs, useStockLevels, useUpdateStockItem } from '../hooks/useStockLogs';

const StockDetails = () => {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'logs'
  const [search, setSearch] = useState('');
  const [transactionType, setTransactionType] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Modals & Edit Form State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [editForm, setEditForm] = useState({
    batchNumber: '',
    currentQuantity: '',
    purchasePrice: '',
    sellingPrice: '',
    mfd: '',
    expiryDate: '',
    rackLocation: ''
  });

  // Queries & Mutations
  const { data: logsData = [], isLoading: logsLoading } = useStockLogs({ transactionType, search });
  const { data: stockLevelsData = [], isLoading: stockLoading } = useStockLevels();
  const updateStockMutation = useUpdateStockItem();

  const logs = logsData;
  const stockItems = (stockLevelsData || []).filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    const medName = item.medicineId?.name?.toLowerCase() || '';
    const batch = item.batchNumber?.toLowerCase() || '';
    const code = item.medicineId?.code?.toLowerCase() || '';
    return medName.includes(q) || batch.includes(q) || code.includes(q);
  });

  const handleEditClick = (item) => {
    setEditingStock(item);
    setEditForm({
      batchNumber: item.batchNumber || '',
      currentQuantity: item.currentQuantity || 0,
      purchasePrice: item.purchasePrice || 0,
      sellingPrice: item.sellingPrice || 0,
      mfd: item.mfd ? new Date(item.mfd).toISOString().split('T')[0] : (item.medicineId?.mfd ? new Date(item.medicineId.mfd).toISOString().split('T')[0] : ''),
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
      rackLocation: item.rackLocation || 'Shelf A1'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await updateStockMutation.mutateAsync({
        id: editingStock._id,
        data: {
          batchNumber: editForm.batchNumber,
          currentQuantity: Number(editForm.currentQuantity),
          purchasePrice: Number(editForm.purchasePrice),
          sellingPrice: Number(editForm.sellingPrice),
          mfd: editForm.mfd || null,
          expiryDate: editForm.expiryDate,
          rackLocation: editForm.rackLocation
        }
      });

      if (res.success) {
        setMessage('Stock record & MFD updated successfully!');
        setShowEditModal(false);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(res.error || 'Failed to update stock record.');
      }
    } catch (err) {
      setError(err.message || 'Error updating stock item');
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff', margin: 0 }}>Stock Details & MFD Audit</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Manage manufacturing dates (MFD), batch details, rack locations, and audit stock movement logs
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('inventory')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'inventory' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'inventory' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <i className="fa-solid fa-boxes-stacked" style={{ marginRight: '6px' }}></i> Stock Inventory & MFD
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'logs' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'logs' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: '6px' }}></i> Audit Movement Logs
          </button>
        </div>
      </div>

      {message && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.88rem' }}>
          ✅ {message}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.88rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Search Toolbar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <input 
            type="text" 
            placeholder="Search by medicine name, code, batch number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 16px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
          />
        </div>

        {activeTab === 'logs' && (
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
        )}
      </div>

      {/* TAB 1: Stock Inventory & MFD Details */}
      {activeTab === 'inventory' && (
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
          <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px 10px' }}>Medicine Name</th>
                <th style={{ padding: '12px 10px' }}>Batch No</th>
                <th style={{ padding: '12px 10px' }}>Current Stock</th>
                <th style={{ padding: '12px 10px' }}>MFD (Mfg Date)</th>
                <th style={{ padding: '12px 10px' }}>Expiry Date</th>
                <th style={{ padding: '12px 10px' }}>Rack Location</th>
                <th style={{ padding: '12px 10px' }}>Buy / Sell Price</th>
                <th style={{ padding: '12px 10px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading stock inventory levels...
                  </td>
                </tr>
              ) : stockItems.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No stock inventory items found matching your search.
                  </td>
                </tr>
              ) : (
                stockItems.map((item) => {
                  const mfdDisplay = item.mfd 
                    ? new Date(item.mfd).toLocaleDateString() 
                    : item.medicineId?.mfd 
                    ? new Date(item.medicineId.mfd).toLocaleDateString() 
                    : 'N/A';
                    
                  const expDisplay = item.expiryDate 
                    ? new Date(item.expiryDate).toLocaleDateString() 
                    : 'N/A';

                  return (
                    <tr key={item._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.88rem' }}>
                      <td style={{ padding: '12px 10px', color: '#fff', fontWeight: '600' }}>
                        {item.medicineId?.name || 'Unlinked Product'}
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Code: {item.medicineId?.code || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
                          {item.batchNumber}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', color: item.currentQuantity <= 15 ? '#f87171' : '#34d399', fontWeight: '700' }}>
                        {item.currentQuantity} units
                      </td>
                      <td style={{ padding: '12px 10px', color: '#fbbf24', fontWeight: '600' }}>
                        <i className="fa-regular fa-calendar-check" style={{ marginRight: '4px' }}></i> {mfdDisplay}
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                        <i className="fa-regular fa-calendar-xmark" style={{ marginRight: '4px' }}></i> {expDisplay}
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-dim)' }}>
                        {item.rackLocation || 'Shelf A1'}
                      </td>
                      <td style={{ padding: '12px 10px', fontSize: '0.82rem' }}>
                        <div>Cost: ₹{item.purchasePrice}</div>
                        <div style={{ color: 'var(--emerald)', fontWeight: '600' }}>Sell: ₹{item.sellingPrice}</div>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleEditClick(item)}
                          style={{
                            background: 'rgba(14, 165, 233, 0.15)',
                            border: '1px solid #0ea5e9',
                            color: '#38bdf8',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          <i className="fa-solid fa-pen-to-square" style={{ marginRight: '4px' }}></i> Edit MFD & Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: Stock Audit Movement Logs */}
      {activeTab === 'logs' && (
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
              {logsLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading audit history...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No stock movement logs found.
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
      )}

      {/* Edit Stock Item Modal */}
      {showEditModal && editingStock && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '16px', padding: '28px', maxWidth: '480px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#0284c7' }}>
                ✏️ Edit Stock & MFD ({editingStock.medicineId?.name || 'Stock Item'})
              </h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Batch Number *</label>
                <input
                  type="text"
                  value={editForm.batchNumber}
                  onChange={(e) => setEditForm({ ...editForm, batchNumber: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: '700', display: 'block', marginBottom: '4px' }}>MFD (Mfg Date) *</label>
                  <input
                    type="date"
                    value={editForm.mfd}
                    onChange={(e) => setEditForm({ ...editForm, mfd: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #fbbf24', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Expiry Date *</label>
                  <input
                    type="date"
                    value={editForm.expiryDate}
                    onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Current Stock Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.currentQuantity}
                    onChange={(e) => setEditForm({ ...editForm, currentQuantity: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Rack Location</label>
                  <input
                    type="text"
                    value={editForm.rackLocation}
                    onChange={(e) => setEditForm({ ...editForm, rackLocation: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Purchase Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.purchasePrice}
                    onChange={(e) => setEditForm({ ...editForm, purchasePrice: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.sellingPrice}
                    onChange={(e) => setEditForm({ ...editForm, sellingPrice: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{ flex: 1, padding: '12px', background: '#334155', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', background: '#0284c7', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                >
                  Save Stock & MFD
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default StockDetails;
