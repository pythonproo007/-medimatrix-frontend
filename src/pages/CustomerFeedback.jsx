import React, { useState } from 'react';
import { useFeedbacks, useSubmitFeedback, useDeleteFeedback } from '../hooks/useCustomers';

const CustomerFeedback = () => {
  const [search, setSearch] = useState('');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Queries & Mutations
  const { data: feedbackQueryData, isLoading: loading } = useFeedbacks(search, selectedRatingFilter);
  const submitFeedbackMutation = useSubmitFeedback();
  const deleteFeedbackMutation = useDeleteFeedback();

  const feedbacks = feedbackQueryData?.data || [];
  const meta = feedbackQueryData?.meta || {
    totalCount: 0,
    averageRating: 0,
    positivePercentage: 0,
    ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  };

  // Log WhatsApp Poll Rating State
  const [logName, setLogName] = useState('');
  const [logPhone, setLogPhone] = useState('');
  const [logInvoiceNo, setLogInvoiceNo] = useState('');
  const [logRating, setLogRating] = useState(5);
  const [logComments, setLogComments] = useState('');

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!logRating) {
      alert('Please select a star rating.');
      return;
    }

    try {
      const res = await submitFeedbackMutation.mutateAsync({
        name: logName.trim() || 'WhatsApp Customer',
        phone: logPhone.trim(),
        invoiceNo: logInvoiceNo.trim(),
        rating: Number(logRating),
        comments: logComments.trim() || 'WhatsApp Rating Poll Response',
        source: 'WhatsApp Poll'
      });

      if (res.success) {
        setMessage('WhatsApp customer rating logged successfully!');
        setShowLogModal(false);
        setLogName('');
        setLogPhone('');
        setLogInvoiceNo('');
        setLogRating(5);
        setLogComments('');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to log feedback');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer feedback entry?')) {
      try {
        const res = await deleteFeedbackMutation.mutateAsync(id);
        if (res.success) {
          setMessage('Feedback entry removed.');
          setTimeout(() => setMessage(''), 3000);
        }
      } catch (err) {
        alert(err.message || 'Failed to delete feedback');
      }
    }
  };

  const renderStars = (ratingVal) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= ratingVal ? '#fbbf24' : '#475569', fontSize: '1.1rem', marginRight: '2px' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  const getRatingBadgeClass = (val) => {
    if (val >= 4) return 'success';
    if (val === 3) return 'warning';
    return 'danger';
  };

  // Share Feedback Link Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareInvoice, setShareInvoice] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const getShareableLink = (inv) => {
    const origin = window.location.origin;
    return inv.trim() ? `${origin}/customer-feedback?invoice=${encodeURIComponent(inv.trim())}` : `${origin}/customer-feedback`;
  };

  const handleCopyLink = (inv) => {
    const link = getShareableLink(inv);
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div style={{ padding: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff', margin: 0 }}>Pharmacist Customer Feedback Dashboard</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Store-level customer ratings, real-time feedback stream, and service review analytics
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowShareModal(true)}
            style={{
              background: 'rgba(2, 132, 199, 0.15)',
              color: '#38bdf8',
              border: '1px solid #0284c7',
              borderRadius: '10px',
              padding: '10px 16px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fa-solid fa-share-nodes"></i>
            Share Feedback Link
          </button>

          <button
            onClick={() => setShowLogModal(true)}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 18px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.1rem', color: '#22c55e' }}></i>
            Log WhatsApp Customer Rating
          </button>
        </div>
      </div>

      {message && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.88rem' }}>
          ✅ {message}
        </div>
      )}

      {/* Analytics Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        
        {/* Card 1: Average Rating */}
        <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
            ★
          </div>
          <div>
            <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#fff', lineHeight: 1.1 }}>
              {meta.averageRating || '0.0'} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 5.0</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Average Rating Score</div>
          </div>
        </div>

        {/* Card 2: Total Ratings */}
        <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
            <i className="fa-solid fa-comments"></i>
          </div>
          <div>
            <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#fff', lineHeight: 1.1 }}>
              {meta.totalCount}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Total Ratings Received</div>
          </div>
        </div>

        {/* Card 3: Satisfaction Rate */}
        <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
            <i className="fa-solid fa-face-smile"></i>
          </div>
          <div>
            <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#4ade80', lineHeight: 1.1 }}>
              {meta.positivePercentage}%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>4★ & 5★ Satisfaction</div>
          </div>
        </div>

      </div>

      {/* Star Breakdown Card */}
      <div style={{ background: 'var(--bg-surface)', padding: '20px 24px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '28px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#fff', fontWeight: '700' }}>
          📊 Customer Rating Poll Breakdown (1 to 5 Stars)
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          {[5, 4, 3, 2, 1].map((starVal) => {
            const count = meta.ratingBreakdown?.[starVal] || 0;
            const pct = meta.totalCount > 0 ? Math.round((count / meta.totalCount) * 100) : 0;
            return (
              <div key={starVal} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', color: '#fff', marginBottom: '6px' }}>
                  <span>{starVal} Stars ⭐</span>
                  <span style={{ color: '#fbbf24' }}>{count} ({pct}%)</span>
                </div>
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, background: starVal >= 4 ? '#22c55e' : starVal === 3 ? '#eab308' : '#ef4444', height: '100%', borderRadius: '3px' }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter toolbar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <input 
            type="text" 
            placeholder="Search by customer name, order ID, phone, comments..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 16px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
          />
        </div>

        <select 
          value={selectedRatingFilter} 
          onChange={(e) => setSelectedRatingFilter(e.target.value)}
          style={{ padding: '10px 16px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', minWidth: '180px' }}
        >
          <option value="">All Ratings (1 - 5 Stars)</option>
          <option value="5">⭐⭐⭐⭐⭐ 5 Stars (Excellent)</option>
          <option value="4">⭐⭐⭐⭐ 4 Stars (Good)</option>
          <option value="3">⭐⭐⭐ 3 Stars (Average)</option>
          <option value="2">⭐⭐ 2 Stars (Poor)</option>
          <option value="1">⭐ 1 Star (Very Poor)</option>
        </select>
      </div>

      {/* Ratings Table */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px 10px' }}>Date & Time</th>
              <th style={{ padding: '12px 10px' }}>Customer Name</th>
              <th style={{ padding: '12px 10px' }}>Order / Invoice ID</th>
              <th style={{ padding: '12px 10px' }}>Rating (1–5 Stars)</th>
              <th style={{ padding: '12px 10px' }}>Customer Feedback & Comments</th>
              <th style={{ padding: '12px 10px' }}>Source</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading feedback ratings...
                </td>
              </tr>
            ) : feedbacks.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No customer ratings found matching your search.
                </td>
              </tr>
            ) : (
              feedbacks.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.88rem' }}>
                  <td style={{ padding: '12px 10px', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 10px', color: '#fff', fontWeight: '600' }}>
                    {item.name || 'Customer'}
                    {item.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📱 {item.phone}</div>}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
                      {item.invoiceNo || 'Direct'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`badge ${getRatingBadgeClass(item.rating)}`}>
                        {item.rating} / 5
                      </span>
                      <div>{renderStars(item.rating)}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px', color: '#cbd5e1', maxWidth: '280px', lineHeight: '1.4', fontSize: '0.84rem' }}>
                    {item.comments}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                      💬 {item.source || 'WhatsApp Poll'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDelete(item._id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}
                      title="Delete Feedback Entry"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Log WhatsApp Rating Modal */}
      {showLogModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '16px', padding: '28px', maxWidth: '460px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-brands fa-whatsapp"></i> Log WhatsApp Rating Poll Response
              </h3>
              <button onClick={() => setShowLogModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}>&times;</button>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.84rem' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Customer Mobile Number</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={logPhone}
                  onChange={(e) => setLogPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Order / Invoice ID</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-994821"
                    value={logInvoiceNo}
                    onChange={(e) => setLogInvoiceNo(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Customer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={logName}
                    onChange={(e) => setLogName(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Select WhatsApp Rating (1 to 5 Stars) *</label>
                <select
                  value={logRating}
                  onChange={(e) => setLogRating(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #fbbf24', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                >
                  <option value="5">⭐⭐⭐⭐⭐ 5 – Excellent</option>
                  <option value="4">⭐⭐⭐⭐ 4 – Good</option>
                  <option value="3">⭐⭐⭐ 3 – Average</option>
                  <option value="2">⭐⭐ 2 – Poor</option>
                  <option value="1">⭐ 1 – Very Poor</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Customer Feedback Comments</label>
                <textarea
                  rows={3}
                  placeholder="Enter comments sent by customer on WhatsApp..."
                  value={logComments}
                  onChange={(e) => setLogComments(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  style={{ flex: 1, padding: '12px', background: '#334155', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', background: '#22c55e', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                >
                  Save WhatsApp Rating
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Share Feedback Link Modal */}
      {showShareModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '16px', padding: '28px', maxWidth: '480px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🔗 Shareable Customer Feedback Link
              </h3>
              <button onClick={() => setShowShareModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                  Order / Invoice ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-1001 (Leave empty for general link)"
                  value={shareInvoice}
                  onChange={(e) => setShareInvoice(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                  Direct Shareable URL:
                </label>
                <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px', fontSize: '0.82rem', color: '#38bdf8', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {getShareableLink(shareInvoice)}
                </div>
              </div>

              {copySuccess && (
                <div style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '8px 12px', borderRadius: '6px', fontSize: '0.82rem', textAlign: 'center' }}>
                  ✅ Shareable feedback link copied to clipboard!
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleCopyLink(shareInvoice)}
                  style={{ flex: 1, padding: '12px', background: '#0284c7', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  📋 Copy Feedback Link
                </button>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  style={{ padding: '12px 20px', background: '#334155', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerFeedback;
