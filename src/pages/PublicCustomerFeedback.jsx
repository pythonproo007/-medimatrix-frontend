import React, { useState } from 'react';
import axios from 'axios';

const PublicCustomerFeedback = () => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [comments, setComments] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!comments.trim()) {
      setErrorMsg('Please enter your feedback comments.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('/api/customers/feedback', {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        rating,
        comments: comments.trim()
      });

      if (res.data && res.data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(res.data?.error || 'Failed to submit feedback. Please try again.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Error submitting feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (val) => {
    switch (val) {
      case 5: return '⭐ Excellent Experience';
      case 4: return '👍 Good Service';
      case 3: return '😐 Average Experience';
      case 2: return '👎 Below Expectation';
      case 1: return '⚠️ Poor Service';
      default: return '';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0b1329 100%)',
      color: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        background: 'rgba(30, 41, 59, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '32px 24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        
        {/* Brand Banner */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            borderRadius: '16px',
            fontSize: '1.8rem',
            marginBottom: '14px',
            boxShadow: '0 10px 20px rgba(2, 132, 199, 0.35)'
          }}>
            💊
          </div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
            MediMatrix Pharmacy
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>
            Customer Feedback & Service Review Portal
          </p>
        </div>

        {submitted ? (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10b981',
            borderRadius: '16px',
            padding: '28px 20px',
            textAlign: 'center',
            color: '#34d399'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', fontWeight: '700', color: '#6ee7b7' }}>
              Thank You for Your Feedback!
            </h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.5' }}>
              Your feedback has been recorded successfully. We appreciate your response and strive to provide you with the best pharmacy service!
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setName('');
                setPhone('');
                setEmail('');
                setComments('');
                setRating(5);
              }}
              style={{
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Submit Another Feedback
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.85rem'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Rating Selector */}
            <div style={{ textAlign: 'center', background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                Rate Your Experience
              </label>
              
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '2.2rem',
                      cursor: 'pointer',
                      color: star <= (hoverRating || rating) ? '#fbbf24' : '#475569',
                      transition: 'transform 0.15s ease, color 0.15s ease',
                      transform: star <= (hoverRating || rating) ? 'scale(1.15)' : 'scale(1)',
                      padding: '0 2px'
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#fbbf24' }}>
                {getRatingLabel(hoverRating || rating)}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                Your Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. John Doe"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Phone & Email Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Feedback Comments */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                Your Comments & Feedback *
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                required
                rows={4}
                placeholder="Tell us about your experience, staff service, medicine availability..."
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                marginTop: '6px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 10px 20px rgba(2, 132, 199, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Submitting Feedback...' : 'Submit Feedback ⭐'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.75rem', color: '#64748b' }}>
          MediMatrix Pharmacy • Customer Service Department
        </div>

      </div>
    </div>
  );
};

export default PublicCustomerFeedback;
