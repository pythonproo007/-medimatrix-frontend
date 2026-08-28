import React, { useState } from 'react';
import {
  useMedicines,
  useMedicineCategories,
  useMedicineTypes,
  useCreateMedicine,
  useUpdateMedicine,
  useDeleteMedicine,
  useStockOut
} from '../hooks/useMedicines';

const ProductDetails = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterAlert, setFilterAlert] = useState('all'); // 'all', 'low_stock', 'expiring_soon', 'expired'
  const [message, setMessage] = useState('');

  // TanStack Query Hooks
  const { data: medicinesData = [], isLoading: loading } = useMedicines({ filterAlert, search, category: selectedCategory });
  const { data: categoriesData = [] } = useMedicineCategories();
  const { data: typesData = [] } = useMedicineTypes();

  const createMedicineMutation = useCreateMedicine();
  const updateMedicineMutation = useUpdateMedicine();
  const deleteMedicineMutation = useDeleteMedicine();
  const stockOutMutation = useStockOut();

  const medicines = medicinesData;
  const categories = categoriesData;
  const types = typesData;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);

  const [currentMed, setCurrentMed] = useState(null);

  // Quick Stock Out state
  const [stockOutQty, setStockOutQty] = useState('1');
  const [stockOutReason, setStockOutReason] = useState('Damaged Container');

  // New/Edit Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Antibiotics',
    medicineType: 'Tablet',
    activeIngredient: '',
    manufacturer: '',
    batchNumber: '',
    quantity: '',
    minStockAlert: '15',
    purchasePrice: '',
    sellingPrice: '',
    mfd: '',
    expiryDate: '',
    rackLocation: 'Rack A-1',
    requiresPrescription: false
  });

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createMedicineMutation.mutateAsync(formData);
      if (res.success) {
        setMessage('Product batch added successfully!');
        setShowAddModal(false);
        setFormData({
          name: '', code: '', category: 'Antibiotics', medicineType: 'Tablet', activeIngredient: '',
          manufacturer: '', batchNumber: '', quantity: '', minStockAlert: '15', purchasePrice: '',
          sellingPrice: '', mfd: '', expiryDate: '', rackLocation: 'Rack A-1', requiresPrescription: false
        });
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditClick = (med) => {
    setCurrentMed(med);
    setFormData({
      name: med.name,
      code: med.code,
      category: med.category,
      medicineType: med.medicineType,
      activeIngredient: med.activeIngredient || '',
      manufacturer: med.manufacturer || '',
      batchNumber: med.batchNumber,
      quantity: med.quantity,
      minStockAlert: med.minStockAlert,
      purchasePrice: med.purchasePrice,
      sellingPrice: med.sellingPrice,
      mfd: med.mfd ? med.mfd.split('T')[0] : '',
      expiryDate: med.expiryDate ? med.expiryDate.split('T')[0] : '',
      rackLocation: med.rackLocation,
      requiresPrescription: med.requiresPrescription
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateMedicineMutation.mutateAsync({ id: currentMed._id, formData });
      if (res.success) {
        setMessage('Product updated successfully!');
        setShowEditModal(false);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        const res = await deleteMedicineMutation.mutateAsync(id);
        if (res.success) {
          setMessage('Product removed successfully.');
          setTimeout(() => setMessage(''), 3000);
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleOpenStockOut = (med) => {
    setCurrentMed(med);
    setStockOutQty('1');
    setStockOutReason('Damaged Container');
    setShowStockOutModal(true);
  };

  const handleExecuteStockOut = async (e) => {
    e.preventDefault();
    if (!currentMed) return;
    try {
      const res = await stockOutMutation.mutateAsync({
        id: currentMed._id,
        quantity: Number(stockOutQty),
        reason: stockOutReason
      });
      if (res.success) {
        setMessage(`Deducted ${stockOutQty} units from ${currentMed.name}`);
        setShowStockOutModal(false);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(err.message);
    }
  };


  return (
    <div style={{ padding: '32px' }}>
      
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '700', color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>
            Stock Inventory Management
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Manage Stock In, Stock Out, batch tracking, rack locations & alert thresholds
          </p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)} 
          style={{
            padding: '10px 20px',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px var(--primary-glow)'
          }}
        >
          <i className="fa-solid fa-folder-plus"></i> + Stock In (Add Batch)
        </button>
      </div>

      {message && (
        <div style={{ background: 'var(--emerald-light)', border: '1px solid var(--emerald)', color: 'var(--emerald)', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.88rem' }}>
          {message}
        </div>
      )}

      {/* Main Inventory Card */}
      <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
        
        {/* Toolbar: Filter Pills on left, Search Pill on right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Pill Tabs Filter */}
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.04)', padding: '4px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'all', label: 'All Medicines', icon: '' },
              { id: 'low_stock', label: 'Low Stock', icon: '⚠️' },
              { id: 'expiring_soon', label: 'Expiring Soon (< 60 Days)', icon: '⏰' },
              { id: 'expired', label: 'Expired Items', icon: '🚫' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterAlert(tab.id)}
                style={{
                  padding: '8px 16px',
                  background: filterAlert === tab.id ? 'var(--bg-surface)' : 'transparent',
                  color: filterAlert === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                  border: filterAlert === tab.id ? '1px solid var(--border-color)' : 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  boxShadow: filterAlert === tab.id ? '0 2px 4px rgba(0,0,0,0.04)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search Bar Pill */}
          <div style={{ width: '260px' }}>
            <input 
              type="text" 
              placeholder="Search by name, code..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 16px',
                background: 'rgba(0,0,0,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                color: 'var(--text-main)',
                fontSize: '0.82rem'
              }}
            />
          </div>
        </div>

        {/* Inventory Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 10px' }}>Code / Barcode</th>
                <th style={{ padding: '12px 10px' }}>Medicine Name</th>
                <th style={{ padding: '12px 10px' }}>Category</th>
                <th style={{ padding: '12px 10px' }}>Batch No</th>
                <th style={{ padding: '12px 10px' }}>Rack</th>
                <th style={{ padding: '12px 10px' }}>Quantity</th>
                <th style={{ padding: '12px 10px' }}>Buy / Sell Price</th>
                <th style={{ padding: '12px 10px' }}>Expiry Date</th>
                <th style={{ padding: '12px 10px' }}>Status</th>
                <th style={{ padding: '12px 10px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading stock inventory...
                  </td>
                </tr>
              ) : medicines.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No medicines found matching the active filters.
                  </td>
                </tr>
              ) : (
                medicines.map((med) => {
                  const isLow = med.quantity <= med.minStockAlert;
                  const daysUntilExp = (new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
                  const isExp = daysUntilExp < 0;
                  const isExpSoon = !isExp && daysUntilExp <= 60;

                  return (
                    <tr key={med._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      
                      {/* Code / Barcode */}
                      <td style={{ padding: '14px 10px', color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: '500' }}>
                        {med.code}
                      </td>

                      {/* Medicine Name & Details */}
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem' }}>{med.name}</span>
                          {med.requiresPrescription && (
                            <span style={{ background: '#f3e8ff', color: '#9333ea', fontSize: '0.68rem', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' }}>
                              Rx Only
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {med.manufacturer || med.activeIngredient || 'Pharma'}
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 10px', color: 'var(--text-muted)' }}>
                        {med.category}
                      </td>

                      {/* Batch No Badge */}
                      <td style={{ padding: '14px 10px' }}>
                        <span style={{ background: '#e6fffa', color: '#0d9488', fontSize: '0.78rem', fontWeight: '600', padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }}>
                          {med.batchNumber}
                        </span>
                      </td>

                      {/* Rack */}
                      <td style={{ padding: '14px 10px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {med.rackLocation}
                      </td>

                      {/* Quantity */}
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ fontWeight: '700', color: isLow ? '#d97706' : 'var(--text-main)', fontSize: '0.9rem' }}>
                          {med.quantity} units
                        </div>
                        <div style={{ fontSize: '0.72rem', color: isLow ? '#d97706' : 'var(--text-dim)' }}>
                          Alert: {med.minStockAlert}
                        </div>
                      </td>

                      {/* Buy / Sell Price */}
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Buy: ₹{med.purchasePrice?.toFixed(2)}</div>
                        <div style={{ fontSize: '0.85rem', color: '#0d9488', fontWeight: '700' }}>Sell: ₹{med.sellingPrice?.toFixed(2)}</div>
                      </td>

                      {/* Expiry Date */}
                      <td style={{ padding: '14px 10px', color: (isExp || isExpSoon) ? 'var(--rose)' : 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {new Date(med.expiryDate).toLocaleDateString('en-GB')}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 10px' }}>
                        {isExp ? (
                          <span style={{ background: '#fee2e2', color: '#e11d48', fontSize: '0.72rem', fontWeight: '700', padding: '4px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <i className="fa-solid fa-ban"></i> EXPIRED
                          </span>
                        ) : isExpSoon ? (
                          <span style={{ background: '#ffe4e6', color: '#e11d48', fontSize: '0.72rem', fontWeight: '700', padding: '4px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <i className="fa-solid fa-clock"></i> Expiring Soon
                          </span>
                        ) : (
                          <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: '700', padding: '4px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <button 
                            onClick={() => handleOpenStockOut(med)}
                            style={{ background: 'transparent', border: '1px solid #f43f5e', color: '#f43f5e', fontSize: '0.75rem', fontWeight: '600', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            &minus; Stock Out
                          </button>
                          <button 
                            onClick={() => handleEditClick(med)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.9rem', cursor: 'pointer' }}
                            title="Edit medicine"
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(med._id)}
                            style={{ background: 'none', border: 'none', color: '#f43f5e', fontSize: '0.9rem', cursor: 'pointer' }}
                            title="Delete medicine"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '32px', borderRadius: 'var(--radius-lg)', width: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Add New Medicine Batch</span>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </h3>
            
            <form onSubmit={handleAddSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Product / Medicine Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unique Code / Barcode</label>
                <input type="text" name="code" value={formData.code} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manufacturer / Active Ingredient</label>
                <input type="text" name="activeIngredient" value={formData.activeIngredient} onChange={handleFormChange} placeholder="e.g. Sun Pharma" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category</label>
                <input type="text" name="category" value={formData.category} onChange={handleFormChange} required list="categories-list" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
                <datalist id="categories-list">
                  {categories.map(c => <option key={c._id} value={c.name} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Medicine Type</label>
                <input type="text" name="medicineType" value={formData.medicineType} onChange={handleFormChange} required list="types-list" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
                <datalist id="types-list">
                  {types.map(t => <option key={t._id} value={t.name} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Batch Number</label>
                <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleFormChange} required placeholder="BT-2024-01" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quantity</label>
                <input type="number" name="quantity" value={formData.quantity} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Purchase Price (₹)</label>
                <input type="number" step="0.01" name="purchasePrice" value={formData.purchasePrice} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Selling Price (₹)</label>
                <input type="number" step="0.01" name="sellingPrice" value={formData.sellingPrice} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MFD (Mfg Date)</label>
                <input type="date" name="mfd" value={formData.mfd} onChange={handleFormChange} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expiry Date</label>
                <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rack Location</label>
                <input type="text" name="rackLocation" value={formData.rackLocation} onChange={handleFormChange} required placeholder="Rack A-1" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Min Stock Alert Threshold</label>
                <input type="number" name="minStockAlert" value={formData.minStockAlert} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" name="requiresPrescription" checked={formData.requiresPrescription} onChange={handleFormChange} style={{ transform: 'scale(1.2)' }} />
                <label style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Requires Doctor Prescription (Rx Only)</label>
              </div>

              <button type="submit" className="btn-pos-checkout btn-emerald" style={{ gridColumn: 'span 2', padding: '12px', marginTop: '10px', cursor: 'pointer' }}>
                Register Product Batch
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Medicine Modal */}
      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '32px', borderRadius: 'var(--radius-lg)', width: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Edit Medicine Details</span>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </h3>
            
            <form onSubmit={handleEditSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Product Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unique Code</label>
                <input type="text" name="code" value={formData.code} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Ingredient / Manufacturer</label>
                <input type="text" name="activeIngredient" value={formData.activeIngredient} onChange={handleFormChange} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category</label>
                <input type="text" name="category" value={formData.category} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Type</label>
                <input type="text" name="medicineType" value={formData.medicineType} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Batch Number</label>
                <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quantity</label>
                <input type="number" name="quantity" value={formData.quantity} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Purchase Price (₹)</label>
                <input type="number" step="0.01" name="purchasePrice" value={formData.purchasePrice} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Selling Price (₹)</label>
                <input type="number" step="0.01" name="sellingPrice" value={formData.sellingPrice} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MFD (Mfg Date)</label>
                <input type="date" name="mfd" value={formData.mfd} onChange={handleFormChange} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expiry Date</label>
                <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rack Location</label>
                <input type="text" name="rackLocation" value={formData.rackLocation} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Min Stock Alert</label>
                <input type="number" name="minStockAlert" value={formData.minStockAlert} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" name="requiresPrescription" checked={formData.requiresPrescription} onChange={handleFormChange} style={{ transform: 'scale(1.2)' }} />
                <label style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Requires Doctor Prescription (Rx Only)</label>
              </div>

              <button type="submit" className="btn-pos-checkout btn-emerald" style={{ gridColumn: 'span 2', padding: '12px', marginTop: '10px', cursor: 'pointer' }}>
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quick Stock Out Modal */}
      {showStockOutModal && currentMed && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '28px', borderRadius: 'var(--radius-md)', width: '450px' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Deduct Stock Batch (&minus; Stock Out)</span>
              <button onClick={() => setShowStockOutModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </h3>
            
            <form onSubmit={handleExecuteStockOut} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Medicine:</span>
                <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1rem' }}>{currentMed.name} (Batch: {currentMed.batchNumber})</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Available Qty: {currentMed.quantity} units</div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Deduction Quantity *</label>
                <input 
                  type="number" 
                  min="1" 
                  max={currentMed.quantity}
                  value={stockOutQty} 
                  onChange={(e) => setStockOutQty(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }} 
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reason for Stock Reduction</label>
                <select 
                  value={stockOutReason} 
                  onChange={(e) => setStockOutReason(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                >
                  <option value="Damaged Container">Damaged Container</option>
                  <option value="Expired Product Disposal">Expired Product Disposal</option>
                  <option value="Customer Return Adjustment">Customer Return Adjustment</option>
                  <option value="Manual Inventory Audit">Manual Inventory Audit</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowStockOutModal(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-pos-checkout btn-danger" style={{ padding: '8px 20px', cursor: 'pointer' }}>
                  Confirm & Deduct
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetails;

