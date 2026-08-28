import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const CustomerPortal = () => {
  const [searchParams] = useSearchParams();
  const invoiceNo = searchParams.get('invoice');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sale, setSale] = useState(null);

  // Feedback Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Home Delivery State
  const [deliveryChoice, setDeliveryChoice] = useState(null); // 'YES' | 'NO'
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliverySubmitted, setDeliverySubmitted] = useState(false);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryMsg, setDeliveryMsg] = useState('');

  useEffect(() => {
    if (!invoiceNo) {
      setError('No invoice number provided in link.');
      setLoading(false);
      return;
    }

    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/sales/public/invoice/${invoiceNo}`);
        if (res.data.success) {
          setSale(res.data.data);
          if (res.data.data.deliveryAddress) {
            setDeliveryAddress(res.data.data.deliveryAddress);
          }
          if (res.data.data.deliveryRequest) {
            setDeliveryChoice('YES');
            setDeliverySubmitted(true);
          }
        } else {
          setError(res.data.error || 'Failed to load invoice.');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Invoice not found. Please check your link.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceNo]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!comments.trim()) {
      alert('Please enter a brief feedback comment.');
      return;
    }

    try {
      setFeedbackLoading(true);
      const res = await axios.post('/api/customers/feedback', {
        invoiceNo: sale.invoiceNo,
        name: sale.customerName,
        phone: sale.customerPhone,
        rating,
        comments
      });

      if (res.data.success) {
        setFeedbackSubmitted(true);
        setFeedbackMsg('Thank you! Your feedback has been recorded successfully. ⭐');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit feedback.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    if (!deliveryAddress.trim()) {
      alert('Please provide your complete delivery address.');
      return;
    }

    try {
      setDeliveryLoading(true);
      const res = await axios.post('/api/deliveries/public-request', {
        invoiceNo: sale.invoiceNo,
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        deliveryAddress
      });

      if (res.data.success) {
        setDeliverySubmitted(true);
        setDeliveryMsg('Home delivery request submitted! Our delivery partner will contact you shortly. 🚚');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to request home delivery.');
    } finally {
      setDeliveryLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p>Loading Invoice Details...</p>
        </div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', padding: '24px', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '32px', maxWidth: '450px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '8px', color: '#f87171' }}>Invoice Not Found</h2>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '24px' }}>{error || 'Unable to fetch billing details. Please check the URL link.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0b1329', color: '#f8fafc', padding: '20px 16px 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '540px', margin: '0 auto' }}>
        
        {/* Brand Banner */}
        <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', borderRadius: '20px', padding: '24px 20px', textAlign: 'center', marginBottom: '20px', boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.4)' }}>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>MediMatrix Pharmacy</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#e0f2fe' }}>Official Digital Invoice & Customer Portal</p>
          <div style={{ marginTop: '12px', display: 'inline-block', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(4px)', padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
            Invoice #{sale.invoiceNo}
          </div>
        </div>

        {/* Invoice Summary Card */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '12px', marginBottom: '16px', fontSize: '0.85rem', color: '#94a3b8' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>CUSTOMER</div>
              <div style={{ color: '#f8fafc', fontWeight: '600', fontSize: '0.95rem' }}>{sale.customerName}</div>
              {sale.customerPhone && <div style={{ fontSize: '0.8rem', color: '#38bdf8' }}>📱 {sale.customerPhone}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>DATE</div>
              <div style={{ color: '#f8fafc', fontWeight: '500' }}>{new Date(sale.createdAt).toLocaleDateString()}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{sale.paymentMethod}</div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#38bdf8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Purchased Items
            </div>
            {sale.items && sale.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: idx < sale.items.length - 1 ? '1px dashed #334155' : 'none', fontSize: '0.88rem' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#f1f5f9' }}>{item.medicineName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Qty: {item.quantity} × ₹{item.unitPrice}</div>
                </div>
                <div style={{ fontWeight: '700', color: '#38bdf8' }}>
                  ₹{item.total}
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#0f172a', borderRadius: '12px', padding: '14px', marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
              <span>Subtotal</span>
              <span>₹{sale.subtotal}</span>
            </div>
            {sale.totalDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#34d399', marginBottom: '6px' }}>
                <span>Discount</span>
                <span>-₹{sale.totalDiscount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '800', color: '#f8fafc', paddingTop: '8px', borderTop: '1px solid #334155' }}>
              <span>Grand Total</span>
              <span style={{ color: '#38bdf8' }}>₹{sale.grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Section 1: Customer Feedback */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: '700', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⭐ We Value Your Feedback!
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.83rem', color: '#94a3b8' }}>
            Please rate your shopping experience with MediMatrix.
          </p>

          {feedbackSubmitted ? (
            <div style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid #10b981', color: '#34d399', padding: '14px', borderRadius: '12px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '500' }}>
              {feedbackMsg}
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit}>
              {/* Star Selector */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '14px 0 20px' }}>
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
                      fontSize: '2rem',
                      cursor: 'pointer',
                      color: star <= (hoverRating || rating) ? '#fbbf24' : '#475569',
                      transition: 'transform 0.15s ease, color 0.15s ease',
                      transform: star <= (hoverRating || rating) ? 'scale(1.15)' : 'scale(1)'
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                placeholder="Share your experience or suggestion..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                required
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  marginBottom: '14px',
                  boxSizing: 'border-box'
                }}
              />

              <button
                type="submit"
                disabled={feedbackLoading}
                style={{
                  width: '100%',
                  background: '#fbbf24',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                {feedbackLoading ? 'Submitting Feedback...' : 'Submit Feedback ⭐'}
              </button>
            </form>
          )}
        </div>

        {/* Section 2: Home Delivery Option */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: '700', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏠🚚 Home Delivery Option
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.83rem', color: '#94a3b8' }}>
            Would you like this bill delivered directly to your doorstep?
          </p>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => setDeliveryChoice('YES')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: deliveryChoice === 'YES' ? '2px solid #0284c7' : '1px solid #334155',
                background: deliveryChoice === 'YES' ? 'rgba(2, 132, 199, 0.2)' : '#0f172a',
                color: deliveryChoice === 'YES' ? '#38bdf8' : '#94a3b8',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              YES 🚚
            </button>
            <button
              type="button"
              onClick={() => {
                setDeliveryChoice('NO');
                setDeliverySubmitted(false);
              }}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: deliveryChoice === 'NO' ? '2px solid #64748b' : '1px solid #334155',
                background: deliveryChoice === 'NO' ? 'rgba(100, 116, 139, 0.2)' : '#0f172a',
                color: deliveryChoice === 'NO' ? '#f1f5f9' : '#94a3b8',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              NO 🏪
            </button>
          </div>

          {deliveryChoice === 'NO' && (
            <div style={{ background: '#0f172a', border: '1px dashed #475569', color: '#94a3b8', padding: '14px', borderRadius: '12px', textAlign: 'center', fontSize: '0.88rem' }}>
              Thank you! Your order is marked for <strong>in-store pickup</strong>. Have a healthy day! 🙏
            </div>
          )}

          {deliveryChoice === 'YES' && (
            deliverySubmitted ? (
              <div style={{ background: 'rgba(2, 132, 199, 0.1)', border: '1px solid #0284c7', color: '#38bdf8', padding: '14px', borderRadius: '12px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '500' }}>
                {deliveryMsg || 'Home Delivery Request Recorded! Status: Pending 🚚'}
              </div>
            ) : (
              <form onSubmit={handleDeliverySubmit}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                  Delivery Address *
                </label>
                <textarea
                  placeholder="Enter house no, street, landmark, city & pincode..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={3}
                  required
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    padding: '12px',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none',
                    marginBottom: '14px',
                    boxSizing: 'border-box'
                  }}
                />

                <button
                  type="submit"
                  disabled={deliveryLoading}
                  style={{
                    width: '100%',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                >
                  {deliveryLoading ? 'Sending Request...' : 'Confirm Home Delivery Request 🏠🚚'}
                </button>
              </form>
            )
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.78rem', color: '#64748b' }}>
          MediMatrix Pharmacy Management OS • Thank you for choosing us!
        </div>

      </div>
    </div>
  );
};

export default CustomerPortal;
