import React, { useState } from 'react';
import api from '../services/api';
import {
  useCustomers,
  useCustomerHistory,
  useCreateCustomer,
  useToggleRegularCustomer,
  useDeleteCustomer
} from '../hooks/useCustomers';

const CustomerDetails = () => {
  const [search, setSearch] = useState('');
  const [regularOnly, setRegularOnly] = useState(false);
  const [message, setMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmAdd, setShowConfirmAdd] = useState(false);

  // TanStack Query Hooks
  const { data: customersData = [], isLoading: loading } = useCustomers(search);
  const createCustomerMutation = useCreateCustomer();
  const toggleRegularMutation = useToggleRegularCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  const customers = regularOnly ? customersData.filter(c => c.isRegular) : customersData;

  // Profile & History Modal State
  const [activeCustomerId, setActiveCustomerId] = useState(null);
  const { data: historyData, isLoading: historyLoading } = useCustomerHistory(activeCustomerId);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    allergies: '',
    medicalHistory: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Customer Name and Phone Number are required.');
      return;
    }
    setShowConfirmAdd(true);
  };

  const handleConfirmAddSubmit = async () => {
    setShowConfirmAdd(false);
    try {
      const allergyArr = formData.allergies ? formData.allergies.split(',').map(a => a.trim()).filter(Boolean) : [];
      const res = await createCustomerMutation.mutateAsync({
        ...formData,
        allergies: allergyArr
      });
      if (res.success) {
        setMessage('Customer registered successfully!');
        setShowAddModal(false);
        setFormData({ name: '', phone: '', email: '', address: '', allergies: '', medicalHistory: '' });
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleViewCustomerHistory = (customerId) => {
    setActiveCustomerId(customerId);
  };

  const handleToggleRegular = async (id) => {
    try {
      const res = await toggleRegularMutation.mutateAsync(id);
      if (res.success) {
        // Updated via mutation invalidation
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer record?')) {
      try {
        const res = await deleteCustomerMutation.mutateAsync(id);
        if (res.success) {
          setMessage('Customer record removed.');
          if (activeCustomerId === id) setActiveCustomerId(null);
          setTimeout(() => setMessage(''), 3000);
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleViewInvoice = async (saleId) => {
    try {
      const res = await api.get(`/api/sales/${saleId}`);
      if (res.success) {
        setSelectedInvoice(res.data);
      }
    } catch (err) {
      alert(`Could not load invoice: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff' }}>Customer Tracking & History Center</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Manage patient profiles, drug allergies, purchase histories, and prescription logs</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-pos-checkout" style={{ width: 'auto', padding: '10px 20px', cursor: 'pointer' }}>
          <i className="fa-solid fa-user-plus" style={{ marginRight: '8px' }}></i> Add Customer Profile
        </button>
      </div>

      {message && (
        <div style={{ background: 'var(--emerald-light)', border: '1px solid var(--emerald)', color: 'var(--emerald)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <input 
            type="text" 
            placeholder="Search by customer name or phone number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 16px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="checkbox" 
            id="regularOnly" 
            checked={regularOnly} 
            onChange={(e) => setRegularOnly(e.target.checked)} 
            style={{ transform: 'scale(1.2)' }}
          />
          <label htmlFor="regularOnly" style={{ color: '#fff', fontSize: '0.9rem', cursor: 'pointer' }}>Show Regular Members Only</label>
        </div>
      </div>

      {/* Customer List */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px 10px' }}>Customer Name</th>
              <th style={{ padding: '12px 10px' }}>Phone Number</th>
              <th style={{ padding: '12px 10px' }}>Email Address</th>
              <th style={{ padding: '12px 10px' }}>Allergies</th>
              <th style={{ padding: '12px 10px' }}>Visits</th>
              <th style={{ padding: '12px 10px' }}>Total Spent</th>
              <th style={{ padding: '12px 10px' }}>Member Status</th>
              <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading customer directory...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No customer records found.
                </td>
              </tr>
            ) : (
              customers.map((cust) => (
                <tr key={cust._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.88rem' }}>
                  <td style={{ padding: '12px 10px', color: '#fff', fontWeight: '500' }}>{cust.name}</td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{cust.phone}</td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-dim)' }}>{cust.email || 'N/A'}</td>
                  <td style={{ padding: '12px 10px' }}>
                    {cust.allergies && cust.allergies.length > 0 ? (
                      cust.allergies.map((alg, index) => (
                        <span key={index} className="badge danger" style={{ marginRight: '4px', fontSize: '0.72rem', padding: '1px 6px' }}>{alg}</span>
                      ))
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>None</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 10px', color: '#fff', fontWeight: '600' }}>{cust.visitsCount}</td>
                  <td style={{ padding: '12px 10px', color: '#10b981', fontWeight: '600' }}>₹{cust.totalSpent.toFixed(2)}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span 
                      onClick={() => handleToggleRegular(cust._id)}
                      className={`badge ${cust.isRegular ? 'success' : 'info'}`} 
                      style={{ cursor: 'pointer' }}
                      title="Click to toggle Regular Member status"
                    >
                      {cust.isRegular ? 'Regular Member (10% Off)' : 'Walk-in'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => handleViewCustomerHistory(cust._id)}
                      className="badge info"
                      style={{ border: 'none', cursor: 'pointer', padding: '6px 10px', fontSize: '0.78rem' }}
                    >
                      <i className="fa-solid fa-id-card-clip" style={{ marginRight: '4px' }}></i> View Profile & History
                    </button>
                    <button onClick={() => handleDelete(cust._id)} className="badge danger" style={{ border: 'none', cursor: 'pointer', padding: '6px 10px', fontSize: '0.78rem' }}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '32px', borderRadius: 'var(--radius-lg)', width: '500px' }}>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Register Patient Profile</span>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </h3>
            
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Resident Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Drug Allergies (comma-separated)</label>
                <input type="text" name="allergies" value={formData.allergies} onChange={handleInputChange} placeholder="e.g. Penicillin, Amoxicillin" style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Medical History</label>
                <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleInputChange} rows="2" placeholder="e.g. Chronic Hypertension" style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', resize: 'none' }}></textarea>
              </div>

              <button type="submit" className="btn-pos-checkout" style={{ padding: '12px', marginTop: '10px', cursor: 'pointer' }}>
                Save & Create Customer Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal before creating Customer Profile (Requirement 4) */}
      {showConfirmAdd && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '28px', borderRadius: 'var(--radius-lg)', width: '450px' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-user-check" style={{ color: 'var(--primary)' }}></i> Confirm Customer Profile
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Confirm saving profile for <strong>{formData.name}</strong> ({formData.phone})? Inputs will be committed to master database.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowConfirmAdd(false)}
                style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              >
                Cancel / Keep Form
              </button>
              <button 
                onClick={handleConfirmAddSubmit}
                className="btn-pos-checkout btn-emerald"
                style={{ padding: '8px 20px', cursor: 'pointer' }}
              >
                Confirm & Create Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Profile & History Modal */}
      {historyData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', width: '800px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '700' }}>
                  <i className="fa-solid fa-id-card" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>
                  Patient Profile & History: {historyData.customer.name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered Member Profile & Audit Log</span>
              </div>
              <button onClick={() => setHistoryData(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>&times;</button>
            </div>

            {/* Demographics Overview Card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>PHONE NUMBER</span>
                <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>{historyData.customer.phone}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>EMAIL</span>
                <span style={{ color: '#fff', fontSize: '0.88rem' }}>{historyData.customer.email || 'N/A'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>MEMBER LEVEL</span>
                <span className={`badge ${historyData.customer.isRegular ? 'success' : 'info'}`} style={{ marginTop: '2px', display: 'inline-block' }}>
                  {historyData.customer.isRegular ? 'Regular Member (10% Off)' : 'Walk-in Member'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>VISITS & SPEND</span>
                <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.9rem' }}>
                  {historyData.customer.visitsCount} visits | ₹{historyData.customer.totalSpent.toFixed(2)}
                </span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>KNOWN DRUG ALLERGIES</span>
                <div>
                  {historyData.customer.allergies && historyData.customer.allergies.length > 0 ? (
                    historyData.customer.allergies.map((a, i) => (
                      <span key={i} className="badge danger" style={{ marginRight: '6px', fontSize: '0.75rem' }}>{a}</span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No known drug allergies reported</span>
                  )}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>MEDICAL HISTORY</span>
                <span style={{ color: '#fff', fontSize: '0.85rem' }}>{historyData.customer.medicalHistory || 'None'}</span>
              </div>
            </div>

            {/* Sales & Invoice History */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <i className="fa-solid fa-receipt" style={{ color: 'var(--emerald)', marginRight: '8px' }}></i>
                Sales & Invoice History ({historyData.sales.length} Transactions)
              </h4>

              {historyData.sales.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)' }}>
                  No past purchase invoices recorded for this customer.
                </div>
              ) : (
                <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px' }}>Invoice #</th>
                      <th style={{ padding: '8px' }}>Date</th>
                      <th style={{ padding: '8px' }}>Doctor</th>
                      <th style={{ padding: '8px' }}>Payment</th>
                      <th style={{ padding: '8px' }}>Grand Total</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.sales.map((sale) => (
                      <tr key={sale._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '8px', color: 'var(--primary)', fontWeight: '600' }}>{sale.invoiceNo}</td>
                        <td style={{ padding: '8px', color: 'var(--text-dim)' }}>{new Date(sale.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{sale.doctorName || 'N/A'}</td>
                        <td style={{ padding: '8px' }}>
                          <span className="badge info" style={{ padding: '1px 6px', fontSize: '0.72rem' }}>{sale.paymentMethod}</span>
                        </td>
                        <td style={{ padding: '8px', color: '#10b981', fontWeight: '700' }}>₹{sale.grandTotal.toFixed(2)}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>
                          <button onClick={() => handleViewInvoice(sale._id)} className="badge info" style={{ border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
                            <i className="fa-solid fa-eye"></i> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Prescriptions History */}
            <div>
              <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <i className="fa-solid fa-file-prescription" style={{ color: 'var(--amber)', marginRight: '8px' }}></i>
                Prescription Records History ({historyData.prescriptions.length} Records)
              </h4>

              {historyData.prescriptions.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)' }}>
                  No prescription logs filed for this patient.
                </div>
              ) : (
                <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px' }}>Rx No</th>
                      <th style={{ padding: '8px' }}>Doctor Name</th>
                      <th style={{ padding: '8px' }}>Diagnosis</th>
                      <th style={{ padding: '8px' }}>Status</th>
                      <th style={{ padding: '8px' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.prescriptions.map((rx) => (
                      <tr key={rx._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '8px', color: 'var(--primary)', fontWeight: '600' }}>{rx.prescriptionNo}</td>
                        <td style={{ padding: '8px', color: '#fff' }}>Dr. {rx.doctorName}</td>
                        <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{rx.diagnosis || 'N/A'}</td>
                        <td style={{ padding: '8px' }}>
                          <span className={`badge ${rx.status === 'Fulfilled' ? 'success' : 'warning'}`} style={{ padding: '1px 6px', fontSize: '0.72rem' }}>
                            {rx.status}
                          </span>
                        </td>
                        <td style={{ padding: '8px', color: 'var(--text-dim)' }}>{new Date(rx.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Printable Invoice View inside Customer Modal */}
      {selectedInvoice && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', color: '#1e293b', borderRadius: 'var(--radius-md)', width: '650px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <span style={{ fontWeight: '700', color: '#0f172a' }}>Invoice - {selectedInvoice.invoiceNo}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => window.print()} style={{ padding: '6px 14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Print</button>
                <button onClick={() => setSelectedInvoice(null)} style={{ padding: '6px 14px', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>MEDICARE PHARMACY</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0' }}>Invoice No: {selectedInvoice.invoiceNo} | Date: {new Date(selectedInvoice.createdAt).toLocaleString()}</p>
            </div>

            <div style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
              <p style={{ margin: '2px 0' }}><strong>Customer:</strong> {selectedInvoice.customerName} ({selectedInvoice.customerPhone || 'N/A'})</p>
              <p style={{ margin: '2px 0' }}><strong>Doctor:</strong> {selectedInvoice.doctorName ? `Dr. ${selectedInvoice.doctorName}` : 'N/A'}</p>
              <p style={{ margin: '2px 0' }}><strong>Payment:</strong> {selectedInvoice.paymentMethod}</p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '6px' }}>Item</th>
                  <th style={{ padding: '6px' }}>Batch</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Price</th>
                  <th style={{ padding: '6px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                  selectedInvoice.items.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '6px', fontWeight: '600' }}>{it.medicineName}</td>
                      <td style={{ padding: '6px', color: '#64748b' }}>{it.batchNumber}</td>
                      <td style={{ padding: '6px', textAlign: 'right' }}>₹{it.unitPrice.toFixed(2)}</td>
                      <td style={{ padding: '6px', textAlign: 'center' }}>{it.quantity}</td>
                      <td style={{ padding: '6px', textAlign: 'right' }}>₹{it.total.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>POS Sale Details</td></tr>
                )}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', fontSize: '1rem', fontWeight: '700', color: '#059669' }}>
              Grand Total: ₹{selectedInvoice.grandTotal.toFixed(2)}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerDetails;

