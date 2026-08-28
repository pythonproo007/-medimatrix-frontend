import React, { useState } from 'react';
import { useCustomers, useFeedbacks, useSubmitFeedback, useDeleteFeedback } from '../hooks/useCustomers';

const CustomerFeedback = () => {
  const [search, setSearch] = useState('');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Queries & Mutations
  const { data: customersData = [] } = useCustomers('');
  const { data: feedbackQueryData, isLoading } = useFeedbacks(search, selectedRatingFilter);
  const submitFeedbackMutation = useSubmitFeedback();
  const deleteFeedbackMutation = useDeleteFeedback();

  const feedbacks = feedbackQueryData?.data || [];
  const meta = feedbackQueryData?.meta || {
    totalCount: 0,
    averageRating: 0,
    positivePercentage: 0,
    ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  };

  // Form State for Submit Feedback
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [comments, setComments] = useState('');

  const handleCustomerSelect = (e) => {
    const custId = e.target.value;
    setSelectedCustomer(custId);
    if (custId) {
      const found = customersData.find((c) => c._id === custId);
      if (found) {
        setName(found.name);
        setPhone(found.phone);
        setEmail(found.email || '');
      }
    } else {
      setName('');
      setPhone('');
      setEmail('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comments.trim()) {
      alert('Please enter feedback comments.');
      return;
    }

    try {
      const res = await submitFeedbackMutation.mutateAsync({
        customerId: selectedCustomer || null,
        name: name.trim() || 'Walk-in Customer',
        phone: phone.trim(),
        email: email.trim(),
        rating,
        comments: comments.trim()
      });

      if (res.success) {
        setSuccessMessage('Feedback logged successfully!');
        setShowSubmitModal(false);
        // Reset form
        setSelectedCustomer('');
        setRating(5);
        setName('');
        setPhone('');
        setEmail('');
        setComments('');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit feedback');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer feedback entry?')) {
      try {
        const res = await deleteFeedbackMutation.mutateAsync(id);
        if (res.success) {
          setSuccessMessage('Feedback entry removed.');
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } catch (err) {
        alert(err.message || 'Failed to delete feedback');
      }
    }
  };

  const getRatingLabel = (val) => {
    switch (val) {
      case 5: return '5 - Excellent';
      case 4: return '4 - Good';
      case 3: return '3 - Average';
      case 2: return '2 - Fair';
      case 1: return '1 - Poor';
      default: return '';
    }
  };

  const renderStars = (starCount) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`fa-solid fa-star ${i <= starCount ? 'star-gold' : 'star-gray'}`}
          style={{ color: i <= starCount ? '#f59e0b' : 'rgba(255,255,255,0.2)', marginRight: '2px' }}
        ></i>
      );
    }
    return stars;
  };

  const breakdown = meta.ratingBreakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <div style={{ padding: '32px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-star" style={{ color: '#f59e0b' }}></i>
            Customer Feedback & Reviews Hub
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Track patient satisfaction metrics, service reviews, rating distribution, and log customer feedback
          </p>
        </div>
        <button
          onClick={() => setShowSubmitModal(true)}
          className="btn-pos-checkout"
          style={{ width: 'auto', padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <i className="fa-solid fa-comment-medical"></i> Log Customer Feedback
        </button>
      </div>

      {successMessage && (
        <div style={{ background: 'var(--emerald-light)', border: '1px solid var(--emerald)', color: 'var(--emerald)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.9rem' }}>
          <i className="fa-solid fa-circle-check" style={{ marginRight: '8px' }}></i> {successMessage}
        </div>
      )}

      {/* Satisfaction Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        {/* Average Rating */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overall Satisfaction</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '10px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: '800', color: '#fff' }}>{meta.averageRating || '0.0'}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>/ 5.0</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '1.1rem' }}>
            {renderStars(Math.round(meta.averageRating || 0))}
          </div>
        </div>

        {/* Total Reviews */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Reviews Logged</span>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#38bdf8', marginTop: '10px' }}>
            {meta.totalCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '8px' }}>
            <i className="fa-solid fa-users" style={{ marginRight: '6px' }}></i> Patient feedback entries
          </div>
        </div>

        {/* Positive Sentiment % */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Positive Sentiment</span>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#10b981', marginTop: '10px' }}>
            {meta.positivePercentage}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '8px' }}>
            <i className="fa-solid fa-thumbs-up" style={{ marginRight: '6px', color: '#10b981' }}></i> 4 & 5 Star ratings
          </div>
        </div>

        {/* Rating Breakdown */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px 20px', gridColumn: 'span 1' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Rating Breakdown</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[5, 4, 3, 2, 1].map((starNum) => {
              const count = breakdown[starNum] || 0;
              const pct = meta.totalCount > 0 ? (count / meta.totalCount) * 100 : 0;
              return (
                <div key={starNum} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', width: '24px' }}>{starNum}★</span>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, background: starNum >= 4 ? '#10b981' : starNum === 3 ? '#f59e0b' : '#ef4444', height: '100%', borderRadius: '4px', transition: 'width 0.3s' }}></div>
                  </div>
                  <span style={{ color: 'var(--text-dim)', width: '20px', textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Filters & Search Toolbar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <input
            type="text"
            placeholder="Search by customer name, phone number, or feedback text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 16px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Filter Rating:</label>
          <select
            value={selectedRatingFilter}
            onChange={(e) => setSelectedRatingFilter(e.target.value)}
            style={{ padding: '10px 14px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', cursor: 'pointer' }}
          >
            <option value="">All Star Ratings</option>
            <option value="5">5 Stars (Excellent)</option>
            <option value="4">4 Stars (Good)</option>
            <option value="3">3 Stars (Average)</option>
            <option value="2">2 Stars (Fair)</option>
            <option value="1">1 Star (Poor)</option>
          </select>
        </div>
      </div>

      {/* Feedbacks Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '1.5rem', marginBottom: '10px' }}></i>
          <p>Loading customer reviews...</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-comment-slash" style={{ fontSize: '2rem', marginBottom: '12px', color: 'var(--text-dim)' }}></i>
          <p style={{ fontSize: '1rem', color: '#fff', marginBottom: '6px' }}>No customer feedback found</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>Log feedback using the "+ Log Customer Feedback" button above.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {feedbacks.map((item) => (
            <div
              key={item._id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', margin: 0 }}>{item.name}</h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.phone && <span><i className="fa-solid fa-phone" style={{ marginRight: '4px' }}></i>{item.phone}</span>}
                      {item.email && <span><i className="fa-solid fa-envelope" style={{ marginRight: '4px' }}></i>{item.email}</span>}
                    </div>
                  </div>
                  <span
                    className={`badge ${item.customerId?.isRegular ? 'success' : 'info'}`}
                    style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                  >
                    {item.customerId?.isRegular ? 'Regular Member' : 'Walk-in'}
                  </span>
                </div>

                {/* Rating stars */}
                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '1rem' }}>{renderStars(item.rating)}</div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>({item.rating}/5)</span>
                </div>

                {/* Comments box */}
                <div style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid var(--primary)', padding: '12px', borderRadius: '4px', fontSize: '0.88rem', color: '#e2e8f0', lineHeight: '1.4', marginBottom: '16px' }}>
                  "{item.comments}"
                </div>
              </div>

              {/* Footer date & delete */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                <span>
                  <i className="fa-regular fa-clock" style={{ marginRight: '6px' }}></i>
                  {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="badge danger"
                  style={{ border: 'none', cursor: 'pointer', padding: '4px 8px', fontSize: '0.75rem' }}
                  title="Delete Feedback"
                >
                  <i className="fa-solid fa-trash" style={{ marginRight: '4px' }}></i> Delete
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Submit Feedback Modal */}
      {showSubmitModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '32px', borderRadius: 'var(--radius-lg)', width: '520px', maxWidth: '100%' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <i className="fa-solid fa-comment-medical" style={{ color: 'var(--primary)' }}></i>
                Log Patient Feedback & Review
              </h3>
              <button onClick={() => setShowSubmitModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Select Registered Customer */}
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Select Registered Customer (Optional)</label>
                <select
                  value={selectedCustomer}
                  onChange={handleCustomerSelect}
                  style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                >
                  <option value="">-- Walk-in / Unregistered Customer --</option>
                  {customersData.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              {/* Star Rating Picker */}
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Rating</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '6px', fontSize: '1.6rem', cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const active = (hoverRating || rating) >= starVal;
                      return (
                        <i
                          key={starVal}
                          className={`fa-solid fa-star`}
                          style={{ color: active ? '#f59e0b' : 'rgba(255,255,255,0.2)', transition: 'color 0.15s' }}
                          onClick={() => setRating(starVal)}
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                        ></i>
                      );
                    })}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: '600' }}>
                    {getRatingLabel(hoverRating || rating)}
                  </span>
                </div>
              </div>

              {/* Name & Contact */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Customer Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Smith"
                    style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 555-0199"
                    style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. customer@example.com"
                  style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                />
              </div>

              {/* Comments */}
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Comments / Review Details *</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows="4"
                  required
                  placeholder="Enter patient comments, prescription fulfillment service feedback, delivery notes, etc..."
                  style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', resize: 'none' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pos-checkout"
                  disabled={submitFeedbackMutation.isPending}
                  style={{ padding: '10px 24px', cursor: 'pointer' }}
                >
                  {submitFeedbackMutation.isPending ? 'Saving...' : 'Submit Feedback'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerFeedback;
