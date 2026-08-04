import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PurchaseDetails = () => {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Purchase Form state
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [notes, setNotes] = useState('');
  
  const [cartItems, setCartItems] = useState([
    { medicineName: '', medicineType: 'Tablet', category: 'General Healthcare', batchNumber: '', quantity: 100, purchasePrice: '', sellingPrice: '', expiryDate: '' }
  ]);

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/purchases');
      if (res.success) {
        setPurchases(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const res = await api.get('/api/purchases/suppliers');
      if (res.success) setSuppliers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPurchases();
    loadSuppliers();
  }, []);

  const handleCartChange = (index, field, value) => {
    const newCart = [...cartItems];
    newCart[index][field] = value;
    setCartItems(newCart);
  };

  const addCartRow = () => {
    setCartItems([
      ...cartItems,
      { medicineName: '', medicineType: 'Tablet', category: 'General Healthcare', batchNumber: '', quantity: 100, purchasePrice: '', sellingPrice: '', expiryDate: '' }
    ]);
  };

  const removeCartRow = (index) => {
    if (cartItems.length > 1) {
      setCartItems(cartItems.filter((_, i) => i !== index));
    }
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate cart items
      for (let item of cartItems) {
        if (!item.medicineName || !item.batchNumber || !item.purchasePrice || !item.sellingPrice || !item.expiryDate) {
          alert('Please fill out all medicine item details.');
          return;
        }
      }

      const res = await api.post('/api/purchases', {
        supplierName,
        supplierPhone,
        supplierInvoiceNo,
        paymentStatus,
        notes,
        items: cartItems.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          purchasePrice: Number(item.purchasePrice),
          sellingPrice: Number(item.sellingPrice)
        }))
      });

      if (res.success) {
        setMessage(`PO purchase order registered successfully! PO ID: ${res.data.purchaseNo}`);
        setShowAddModal(false);
        setSupplierName('');
        setSupplierPhone('');
        setSupplierInvoiceNo('');
        setNotes('');
        setCartItems([{ medicineName: '', medicineType: 'Tablet', category: 'General Healthcare', batchNumber: '', quantity: 100, purchasePrice: '', sellingPrice: '', expiryDate: '' }]);
        loadPurchases();
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff' }}>Vendor Purchase Orders (PO)</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Log incoming shipments, wholesale pricing, and supplier records</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-pos-checkout" style={{ width: 'auto', padding: '10px 20px', cursor: 'pointer' }}>
          <i className="fa-solid fa-truck-loading" style={{ marginRight: '8px' }}></i> Log Vendor Purchase
        </button>
      </div>

      {message && (
        <div style={{ background: 'var(--emerald-light)', border: '1px solid var(--emerald)', color: 'var(--emerald)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* Purchases List */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px 10px' }}>Date</th>
              <th style={{ padding: '12px 10px' }}>PO Number</th>
              <th style={{ padding: '12px 10px' }}>Supplier Vendor</th>
              <th style={{ padding: '12px 10px' }}>Vendor Invoice No</th>
              <th style={{ padding: '12px 10px' }}>Total PO Amount</th>
              <th style={{ padding: '12px 10px' }}>Payment Status</th>
              <th style={{ padding: '12px 10px' }}>Notes / Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading purchases...
                </td>
              </tr>
            ) : purchases.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No vendor purchases recorded.
                </td>
              </tr>
            ) : (
              purchases.map((po) => (
                <tr key={po._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.88rem' }}>
                  <td style={{ padding: '12px 10px', color: 'var(--text-dim)' }}>
                    {new Date(po.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--primary)', fontWeight: '600' }}>{po.purchaseNo}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ color: '#fff', fontWeight: '500' }}>{po.supplierName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{po.supplierPhone}</div>
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{po.supplierInvoiceNo || 'N/A'}</td>
                  <td style={{ padding: '12px 10px', color: '#10b981', fontWeight: '700' }}>₹{po.totalAmount.toFixed(2)}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className={`badge ${po.paymentStatus === 'Paid' ? 'success' : po.paymentStatus === 'Pending' ? 'danger' : 'warning'}`}>
                      {po.paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-dim)', fontSize: '0.82rem' }}>{po.notes || 'None'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add PO Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '32px', borderRadius: 'var(--radius-lg)', width: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Log Vendor PO & Restock Shipment</span>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </h3>

            <form onSubmit={handlePurchaseSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supplier / Vendor Name</label>
                  <input type="text" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} required list="suppliers-list" placeholder="Choose or type vendor" style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
                  <datalist id="suppliers-list">
                    {suppliers.map(s => <option key={s._id} value={s.name} />)}
                  </datalist>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supplier Contact Phone</label>
                  <input type="text" value={supplierPhone} onChange={(e) => setSupplierPhone(e.target.value)} placeholder="e.g. +1 555-0988" style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supplier Invoice Reference</label>
                  <input type="text" value={supplierInvoiceNo} onChange={(e) => setSupplierInvoiceNo(e.target.value)} placeholder="e.g. INV-99042" style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
                </div>
              </div>

              <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '12px' }}>Inventory Shipment Items</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {cartItems.map((item, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1.2fr 40px', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Med Name</label>
                      <input type="text" value={item.medicineName} onChange={(e) => handleCartChange(index, 'medicineName', e.target.value)} placeholder="Name" required style={{ width: '100%', padding: '8px', background: '#070d19', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Type</label>
                      <input type="text" value={item.medicineType} onChange={(e) => handleCartChange(index, 'medicineType', e.target.value)} required style={{ width: '100%', padding: '8px', background: '#070d19', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Category</label>
                      <input type="text" value={item.category} onChange={(e) => handleCartChange(index, 'category', e.target.value)} required style={{ width: '100%', padding: '8px', background: '#070d19', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Batch No</label>
                      <input type="text" value={item.batchNumber} onChange={(e) => handleCartChange(index, 'batchNumber', e.target.value)} placeholder="Batch" required style={{ width: '100%', padding: '8px', background: '#070d19', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Qty</label>
                      <input type="number" value={item.quantity} onChange={(e) => handleCartChange(index, 'quantity', e.target.value)} required style={{ width: '100%', padding: '8px', background: '#070d19', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Cost Price</label>
                      <input type="number" step="0.01" value={item.purchasePrice} onChange={(e) => handleCartChange(index, 'purchasePrice', e.target.value)} placeholder="CP" required style={{ width: '100%', padding: '8px', background: '#070d19', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Sell Price</label>
                      <input type="number" step="0.01" value={item.sellingPrice} onChange={(e) => handleCartChange(index, 'sellingPrice', e.target.value)} placeholder="SP" required style={{ width: '100%', padding: '8px', background: '#070d19', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Expiry</label>
                      <input type="date" value={item.expiryDate} onChange={(e) => handleCartChange(index, 'expiryDate', e.target.value)} required style={{ width: '100%', padding: '8px', background: '#070d19', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff', fontSize: '0.72rem' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <button type="button" onClick={() => removeCartRow(index)} style={{ background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer', fontSize: '1.2rem', paddingBottom: '8px' }}>
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                ))}

                <button type="button" onClick={addCartRow} className="badge info" style={{ alignSelf: 'flex-start', padding: '8px 16px', border: 'none', cursor: 'pointer' }}>
                  <i className="fa-solid fa-circle-plus"></i> Add Row Item
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payment Status</label>
                  <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Purchase Remarks / Notes</label>
                  <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional comments..." style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
                </div>
              </div>

              <button type="submit" className="btn-pos-checkout btn-emerald" style={{ width: '100%', padding: '12px', marginTop: '24px', cursor: 'pointer' }}>
                Process Purchase Order & Stock In Items
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PurchaseDetails;
