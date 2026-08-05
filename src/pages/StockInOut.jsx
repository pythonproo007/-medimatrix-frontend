import React, { useState, useEffect } from 'react';
import api from '../services/api';

const StockInOut = () => {
  // Mode: 'in' (Stock In Batches Addition) | 'out' (Stock Out Batches Deduction)
  const [activeTab, setActiveTab] = useState('in');

  const [medicines, setMedicines] = useState([]);
  const [logs, setLogs] = useState([]);

  // Stock IN Form State
  const [inMedName, setInMedName] = useState('');
  const [inMedId, setInMedId] = useState('');
  const [inQty, setInQty] = useState('');
  const [inBatchNo, setInBatchNo] = useState('');
  const [inPurchasePrice, setInPurchasePrice] = useState('');
  const [inSellingPrice, setInSellingPrice] = useState('');
  const [inExpiryDate, setInExpiryDate] = useState('');
  const [inSupplier, setInSupplier] = useState('');
  const [inReason, setInReason] = useState('Restock Purchase Batch Addition');

  // Stock OUT Form State
  const [outMedId, setOutMedId] = useState('');
  const [outQty, setOutQty] = useState('');
  const [outReason, setOutReason] = useState('Damaged / Broken container');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Confirmation Modals (Requirement 4: Don't clear inputs until confirmed)
  const [showConfirmInModal, setShowConfirmInModal] = useState(false);
  const [showConfirmOutModal, setShowConfirmOutModal] = useState(false);

  const fetchMeds = async () => {
    try {
      const res = await api.get('/api/medicines');
      if (res.success) {
        setMedicines(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get('/api/stock-logs');
      if (res.success) {
        setLogs(res.data.slice(0, 10));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMeds();
    fetchLogs();
  }, []);

  // Handle manual medicine name input change for Stock IN
  const handleInMedNameChange = (val) => {
    setInMedName(val);
    const matched = medicines.find(m => m.name.toLowerCase() === val.trim().toLowerCase());
    if (matched) {
      setInMedId(matched._id);
      setInBatchNo(matched.batchNumber || '');
      setInPurchasePrice(matched.purchasePrice || '');
      setInSellingPrice(matched.sellingPrice || '');
      if (matched.expiryDate) {
        setInExpiryDate(new Date(matched.expiryDate).toISOString().split('T')[0]);
      }
    } else {
      setInMedId('');
    }
  };

  // Handle Stock IN Form Submission Initiated
  const handleInitiateStockIn = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!inMedName.trim() || !inQty || Number(inQty) <= 0) {
      setError('Please enter a medicine name and a valid positive quantity.');
      return;
    }

    setShowConfirmInModal(true);
  };

  // Execute Stock IN API call after user confirmation
  const handleConfirmExecuteStockIn = async () => {
    setShowConfirmInModal(false);
    setLoading(true);
    try {
      let res;
      if (inMedId) {
        // Update existing medicine stock
        res = await api.post(`/api/medicines/${inMedId}/stock-in`, {
          quantity: Number(inQty),
          batchNumber: inBatchNo,
          purchasePrice: inPurchasePrice ? Number(inPurchasePrice) : undefined,
          sellingPrice: inSellingPrice ? Number(inSellingPrice) : undefined,
          expiryDate: inExpiryDate || undefined,
          supplierName: inSupplier,
          reason: inReason
        });
      } else {
        // Register new medicine or match by name on backend
        res = await api.post('/api/medicines', {
          name: inMedName.trim(),
          quantity: Number(inQty),
          batchNumber: inBatchNo || `BT-${Date.now().toString().slice(-4)}`,
          purchasePrice: inPurchasePrice ? Number(inPurchasePrice) : 0,
          sellingPrice: inSellingPrice ? Number(inSellingPrice) : 0,
          expiryDate: inExpiryDate || undefined,
          manufacturer: inSupplier || 'Generic Supplier',
          notes: inReason
        });
      }

      if (res.success) {
        const addedName = res.data?.name || inMedName;
        const totalQty = res.data?.quantity ?? 'Updated';
        setMessage(`Successfully added +${inQty} units to "${addedName}"! Total Stock: ${totalQty}`);
        setInMedName('');
        setInMedId('');
        setInQty('');
        setInBatchNo('');
        setInPurchasePrice('');
        setInSellingPrice('');
        setInExpiryDate('');
        setInSupplier('');
        fetchMeds();
        fetchLogs();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Stock OUT Form Submission Initiated
  const handleInitiateStockOut = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!outMedId || !outQty || Number(outQty) <= 0) {
      setError('Please select a medicine batch and enter a valid quantity.');
      return;
    }

    const med = medicines.find(m => m._id === outMedId);
    if (med && Number(outQty) > med.quantity) {
      setError(`Cannot deduct ${outQty} units. Only ${med.quantity} available in batch.`);
      return;
    }

    setShowConfirmOutModal(true);
  };

  // Execute Stock OUT API call after user confirmation
  const handleConfirmExecuteStockOut = async () => {
    setShowConfirmOutModal(false);
    setLoading(true);
    try {
      const res = await api.post(`/api/medicines/${outMedId}/stock-out`, {
        quantity: Number(outQty),
        reason: outReason
      });

      if (res.success) {
        setMessage(`Successfully deducted -${outQty} units from ${res.data.name}! Remaining Stock: ${res.data.quantity}`);
        setOutQty('');
        fetchMeds();
        fetchLogs();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedInMed = medicines.find(m => m._id === inMedId);
  const selectedOutMed = medicines.find(m => m._id === outMedId);

  return (
    <div style={{ padding: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff' }}>Stock IN & Stock OUT Batch Operations</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Separately process wholesale stock additions and manual batch stock reductions</p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-surface)', padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => { setActiveTab('in'); setError(''); setMessage(''); }}
            style={{
              padding: '10px 20px',
              background: activeTab === 'in' ? '#10b981' : 'transparent',
              color: activeTab === 'in' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.85rem'
            }}
          >
            <i className="fa-solid fa-boxes-packing" style={{ marginRight: '8px' }}></i> Stock IN (Add Batches)
          </button>
          <button
            onClick={() => { setActiveTab('out'); setError(''); setMessage(''); }}
            style={{
              padding: '10px 20px',
              background: activeTab === 'out' ? 'var(--rose)' : 'transparent',
              color: activeTab === 'out' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.85rem'
            }}
          >
            <i className="fa-solid fa-box-open" style={{ marginRight: '8px' }}></i> Stock OUT (Deduct Batches)
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--rose-light)', border: '1px solid var(--rose)', color: 'var(--rose)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{ background: 'var(--emerald-light)', border: '1px solid var(--emerald)', color: 'var(--emerald)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* Main Split Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
        
        {/* Form Column */}
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          {activeTab === 'in' ? (
            /* Stock IN Form */
            <>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-circle-plus" style={{ color: '#10b981' }}></i> Add Stock Batch Intake (Stock IN)
              </h3>

              <form onSubmit={handleInitiateStockIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Medicine Name (Manual Input) *</label>
                  <input 
                    type="text" 
                    list="medicine-name-suggestions"
                    value={inMedName} 
                    onChange={(e) => handleInMedNameChange(e.target.value)}
                    placeholder="Type medicine name manually..."
                    required
                    style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                  />
                  <datalist id="medicine-name-suggestions">
                    {medicines.map(m => (
                      <option key={m._id} value={m.name}>
                        Batch: {m.batchNumber} | Current Stock: {m.quantity}
                      </option>
                    ))}
                  </datalist>
                  {selectedInMed ? (
                    <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
                      <i className="fa-solid fa-circle-check" style={{ marginRight: '4px' }}></i>
                      Matched existing product (Current Stock: {selectedInMed.quantity})
                    </div>
                  ) : inMedName.trim() ? (
                    <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '4px' }}>
                      <i className="fa-solid fa-circle-info" style={{ marginRight: '4px' }}></i>
                      New product will be registered in inventory upon intake
                    </div>
                  ) : null}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quantity to Add *</label>
                    <input 
                      type="number" 
                      min="1"
                      value={inQty}
                      onChange={(e) => setInQty(e.target.value)}
                      placeholder="e.g. 50"
                      required
                      style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Batch Number</label>
                    <input 
                      type="text" 
                      value={inBatchNo}
                      onChange={(e) => setInBatchNo(e.target.value)}
                      placeholder="e.g. BT-9948"
                      style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Purchase Unit Price (₹)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={inPurchasePrice}
                      onChange={(e) => setInPurchasePrice(e.target.value)}
                      placeholder="Unit buy cost"
                      style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Selling Unit Price (₹)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={inSellingPrice}
                      onChange={(e) => setInSellingPrice(e.target.value)}
                      placeholder="Retail sell price"
                      style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expiry Date</label>
                    <input 
                      type="date" 
                      value={inExpiryDate}
                      onChange={(e) => setInExpiryDate(e.target.value)}
                      style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supplier / Vendor Name</label>
                    <input 
                      type="text" 
                      value={inSupplier}
                      onChange={(e) => setInSupplier(e.target.value)}
                      placeholder="e.g. Apex Pharma Distributors"
                      style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Intake Reason / Category</label>
                  <select 
                    value={inReason} 
                    onChange={(e) => setInReason(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                  >
                    <option value="Restock Purchase Batch Addition">Restock Purchase Batch Addition</option>
                    <option value="Supplier Replacement Intake">Supplier Replacement Intake</option>
                    <option value="Customer Return Stock Re-entry">Customer Return Stock Re-entry</option>
                    <option value="Manual Inventory Audit Surplus">Manual Inventory Audit Surplus</option>
                  </select>
                </div>

                <button type="submit" disabled={loading} className="btn-pos-checkout btn-emerald" style={{ padding: '12px', marginTop: '8px', cursor: 'pointer', fontWeight: '700' }}>
                  {loading ? 'Processing Stock IN...' : 'Add Stock Batch Intake'}
                </button>
              </form>
            </>
          ) : (
            /* Stock OUT Form */
            <>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-circle-minus" style={{ color: 'var(--rose)' }}></i> Deduct Stock Batch (Stock OUT)
              </h3>

              <form onSubmit={handleInitiateStockOut} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Medicine Batch *</label>
                  <select 
                    value={outMedId} 
                    onChange={(e) => setOutMedId(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                  >
                    <option value="">-- Choose Product --</option>
                    {medicines.map(m => (
                      <option key={m._id} value={m._id}>
                        {m.name} (Batch: {m.batchNumber}) - Avail: {m.quantity}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Deduction Quantity *</label>
                  <input 
                    type="number" 
                    min="1"
                    value={outQty}
                    onChange={(e) => setOutQty(e.target.value)}
                    placeholder="Enter units to deduct"
                    required
                    style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reason / Adjustment Type *</label>
                  <select 
                    value={outReason} 
                    onChange={(e) => setOutReason(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                  >
                    <option value="Damaged / Broken container">Damaged / Broken container</option>
                    <option value="Expired drugs disposal">Expired drugs disposal</option>
                    <option value="Customer Return adjustment">Customer Return adjustment</option>
                    <option value="Disposal of contaminated sample">Disposal of contaminated sample</option>
                    <option value="Manual Inventory Audit Correction">Manual Inventory Audit Correction</option>
                  </select>
                </div>

                <button type="submit" disabled={loading} className="btn-pos-checkout btn-danger" style={{ padding: '12px', marginTop: '10px', cursor: 'pointer', fontWeight: '700' }}>
                  {loading ? 'Deducting...' : 'Deduct Selected Stock Batch'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Selected Product Summary Box */}
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px' }}>Active Batch Specifications</h3>
          
          {activeTab === 'in' && (selectedInMed || inMedName.trim()) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Target Medicine Name:</span>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '1.05rem' }}>{selectedInMed ? selectedInMed.name : inMedName}</div>
              </div>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Batch Number:</span>
                <div style={{ color: 'var(--primary)', fontWeight: '600' }}>{inBatchNo || (selectedInMed ? selectedInMed.batchNumber : 'Auto-generated')}</div>
              </div>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Current Stock Level:</span>
                <div style={{ color: '#10b981', fontWeight: '700', fontSize: '1.1rem' }}>{selectedInMed ? `${selectedInMed.quantity} ${selectedInMed.medicineType}s` : 'New Medicine (0 existing)'}</div>
              </div>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Purchase Price vs Selling Price:</span>
                <div style={{ color: '#fff' }}>
                  ₹{inPurchasePrice || (selectedInMed ? selectedInMed.purchasePrice : 0)} buy | ₹{inSellingPrice || (selectedInMed ? selectedInMed.sellingPrice : 0)} sell
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Supplier / Vendor:</span>
                <div style={{ color: '#fff' }}>{inSupplier || (selectedInMed ? selectedInMed.manufacturer : 'Not specified')}</div>
              </div>
            </div>
          ) : activeTab === 'out' && selectedOutMed ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Medicine Name:</span>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '1.05rem' }}>{selectedOutMed.name}</div>
              </div>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Batch Number:</span>
                <div style={{ color: 'var(--primary)', fontWeight: '600' }}>{selectedOutMed.batchNumber}</div>
              </div>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Available Stock:</span>
                <div style={{ color: selectedOutMed.quantity <= selectedOutMed.minStockAlert ? 'var(--rose)' : '#fff', fontWeight: '700', fontSize: '1.1rem' }}>{selectedOutMed.quantity} {selectedOutMed.medicineType}s</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Expiration Date:</span>
                <div style={{ color: '#fff' }}>{new Date(selectedOutMed.expiryDate).toLocaleDateString()}</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-boxes-stacked" style={{ fontSize: '3rem', marginBottom: '15px', color: 'var(--text-dim)' }}></i>
              <p>Type or select a medicine name to view active stock specifications</p>
            </div>
          )}
        </div>

      </div>

      {/* Stock Movement Logs Table */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '16px' }}>Recent Stock Movement Audit Trail</h3>
        <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px' }}>Timestamp</th>
              <th style={{ padding: '10px' }}>Type</th>
              <th style={{ padding: '10px' }}>Medicine</th>
              <th style={{ padding: '10px' }}>Batch</th>
              <th style={{ padding: '10px' }}>Qty Change</th>
              <th style={{ padding: '10px' }}>Reason</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No stock movement logs found.</td>
              </tr>
            ) : (
              logs.map((log) => {
                const isAddition = log.quantityChange > 0;
                return (
                  <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '10px', color: 'var(--text-dim)' }}>{new Date(log.createdAt).toLocaleString()}</td>
                    <td style={{ padding: '10px' }}>
                      <span className={`badge ${isAddition ? 'success' : 'danger'}`} style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                        {log.transactionType}
                      </span>
                    </td>
                    <td style={{ padding: '10px', color: '#fff', fontWeight: '500' }}>{log.medicineName}</td>
                    <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{log.batchNumber}</td>
                    <td style={{ padding: '10px', color: isAddition ? 'var(--emerald)' : 'var(--rose)', fontWeight: '700' }}>
                      {isAddition ? `+${log.quantityChange}` : log.quantityChange}
                    </td>
                    <td style={{ padding: '10px', color: 'var(--text-dim)' }}>{log.reason}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Stock IN Confirmation Modal (Requirement 4) */}
      {showConfirmInModal && (inMedName.trim() || selectedInMed) && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '28px', borderRadius: 'var(--radius-lg)', width: '480px' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-box-archive" style={{ color: '#10b981' }}></i> Confirm Stock IN Intake
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Confirm adding <strong>+{inQty} units</strong> to <strong>{selectedInMed ? selectedInMed.name : inMedName}</strong> (Batch: {inBatchNo || (selectedInMed ? selectedInMed.batchNumber : 'Auto-generated')})? Inputs will not be cleared until confirmed.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowConfirmInModal(false)}
                style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              >
                Cancel / Keep Form
              </button>
              <button 
                onClick={handleConfirmExecuteStockIn}
                className="btn-pos-checkout btn-emerald"
                style={{ padding: '8px 20px', cursor: 'pointer' }}
              >
                Confirm & Add Stock IN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock OUT Confirmation Modal (Requirement 4) */}
      {showConfirmOutModal && selectedOutMed && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '28px', borderRadius: 'var(--radius-lg)', width: '480px' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--rose)' }}></i> Confirm Stock OUT Reduction
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Confirm deducting <strong>-{outQty} units</strong> from <strong>{selectedOutMed.name}</strong> (Batch: {selectedOutMed.batchNumber}) for <em>{outReason}</em>?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowConfirmOutModal(false)}
                style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              >
                Cancel / Keep Form
              </button>
              <button 
                onClick={handleConfirmExecuteStockOut}
                className="btn-pos-checkout btn-danger"
                style={{ padding: '8px 20px', cursor: 'pointer' }}
              >
                Confirm & Deduct Stock OUT
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StockInOut;

