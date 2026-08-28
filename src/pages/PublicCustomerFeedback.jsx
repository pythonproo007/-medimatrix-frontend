import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PublicCustomerFeedback = () => {
  const [token, setToken] = useState('');
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [invalidReason, setInvalidReason] = useState('');

  // Token Data
  const [invoiceNo, setInvoiceNo] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token') || '';

    if (!tokenParam) {
      setValidatingToken(false);
      setTokenValid(false);
      setInvalidReason('Feedback link is missing a security token. Please check your WhatsApp link.');
      return;
    }

    setToken(tokenParam);

    // Validate Token on Mount
    axios.get(`/api/customers/feedback-token/validate?token=${encodeURIComponent(tokenParam)}`)
      .then((res) => {
        if (res.data && res.data.success && res.data.data) {
          const d = res.data.data;
          setInvoiceNo(d.invoiceNo || '');
          setCustomerName(d.customerName || '');
          setCustomerPhone(d.customerPhone || '');
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setInvalidReason(res.data?.error || 'Invalid or non-existent feedback token.');
        }
      })
      .catch((err) => {
        setTokenValid(false);
        setInvalidReason(err.response?.data?.error || 'This feedback link is invalid or has expired.');
      })
      .finally(() => {
        setValidatingToken(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!rating) {
      setErrorMsg('Please select a star rating.');
      return;
    }
    if (!comments.trim()) {
      setErrorMsg('Please share a few comments about your experience.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('/api/customers/feedback-token/submit', {
        token,
        rating,
        comments: comments.trim(),
        name: customerName,
        phone: customerPhone
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
      case 5: return '⭐ 5 – Excellent Service';
      case 4: return '👍 4 – Good Experience';
      case 3: return '😐 3 – Average';
      case 2: return '👎 2 – Below Expectation';
      case 1: return '⚠️ 1 – Very Poor';
      default: return '';
    }
  };

  // Loading State
  if (validatingToken) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0b1329',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔄</div>
          <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>Verifying secure feedback link token...</p>
        </div>
      </div>
    );
  }

  // Invalid or Expired Token View
  if (!tokenValid) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0f172a 100%)',
        color: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}>
        <div style={{
          maxWidth: '480px',
          width: '100%',
          background: 'rgba(30, 41, 59, 0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '24px',
          padding: '36px 28px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '72px',
            height: '72px',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            borderRadius: '50%',
            fontSize: '2.4rem',
            marginBottom: '18px'
          }}>
            🚫
          </div>

          <h2 style={{ margin: '0 0 10px 0', fontSize: '1.45rem', fontWeight: '800', color: '#fca5a5' }}>
            Invalid or Expired Link
          </h2>

          <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            {invalidReason || 'This customer feedback link is invalid, expired, or has already been used to submit a review.'}
          </p>

          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '14px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '0.82rem',
            color: '#94a3b8',
            marginBottom: '20px'
          }}>
            🛡️ Security Notice: Feedback links are single-use and time-limited to protect pharmacy record integrity.
          </div>

          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            MediMatrix Pharmacy • Customer Review Portal
          </div>
        </div>
      </div>
    );
  }

  // Valid Token Form View
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
        background: 'rgba(30, 41, 59, 0.88)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '32px 24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.45)'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            borderRadius: '16px',
            fontSize: '1.8rem',
            marginBottom: '12px',
            boxShadow: '0 10px 20px rgba(2, 132, 199, 0.35)'
          }}>
            💊
          </div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '1.55rem', fontWeight: '800', color: '#ffffff' }}>
            MediMatrix Pharmacy
          </h1>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#94a3b8' }}>
            Verified Customer Experience Feedback
          </p>
        </div>

        {/* Invoice Info Card */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(2, 132, 199, 0.25)',
          borderRadius: '14px',
          padding: '14px 18px',
          marginBottom: '22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Invoice</div>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#38bdf8' }}>{invoiceNo}</div>
          </div>
          {customerName && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Customer</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#f8fafc' }}>{customerName}</div>
            </div>
          )}
        </div>

        {submitted ? (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid #10b981',
            borderRadius: '18px',
            padding: '32px 20px',
            textAlign: 'center',
            color: '#34d399'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎉</div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', fontWeight: '700', color: '#6ee7b7' }}>
              Feedback Submitted Successfully!
            </h2>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.5' }}>
              Thank you for sharing your experience with MediMatrix Pharmacy! Your rating has been recorded for Order <strong>#{invoiceNo}</strong>.
            </p>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '14px' }}>
              🔒 Single-Use Token Completed. You may now close this page.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '12px',
                borderRadius: '10px',
                fontSize: '0.86rem'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Clickable Star Rating */}
            <div style={{ textAlign: 'center', background: 'rgba(15, 23, 42, 0.6)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '10px' }}>
                Rate Your Pharmacy Experience *
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
                      fontSize: '2.4rem',
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
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fbbf24' }}>
                {getRatingLabel(hoverRating || rating)}
              </div>
            </div>

            {/* Name & Mobile Editable Input */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. John Doe"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Feedback Comments */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                Your Comments & Suggestions *
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                required
                rows={4}
                placeholder="Share your thoughts on staff service, speed, packaging, or medicine availability..."
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                  resize: 'vertical'
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

        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.75rem', color: '#64748b' }}>
          🔒 Secure Time-Limited Feedback System • MediMatrix Pharmacy
        </div>

      </div>
    </div>
  );
};

export default PublicCustomerFeedback;
