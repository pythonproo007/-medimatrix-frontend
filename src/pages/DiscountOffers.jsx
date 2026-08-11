import React, { useState } from 'react';
import { useOffers, useCreateOffer, useBroadcastOffer } from '../hooks/useOffers';

const DiscountOffers = () => {
  const [message, setMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // TanStack Query Hooks
  const { data: offersData = [], isLoading: loading } = useOffers();
  const createOfferMutation = useCreateOffer();
  const broadcastOfferMutation = useBroadcastOffer();

  const offers = offersData;

  // Form states
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('15');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('regular');
  const [validTill, setValidTill] = useState('');
  const [broadcastNow, setBroadcastNow] = useState(true);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createOfferMutation.mutateAsync({
        title,
        code: code.trim().toUpperCase(),
        discountPercentage: Number(discountPercentage),
        description,
        targetAudience,
        validTill,
        broadcastNow
      });
      if (res.success) {
        setMessage(`Discount offer "${res.data.title}" successfully created!`);
        setShowAddModal(false);
        setTitle('');
        setCode('');
        setDescription('');
        setValidTill('');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBroadcast = async (id) => {
    try {
      const res = await broadcastOfferMutation.mutateAsync(id);
      if (res.success) {
        setMessage(res.message);
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff' }}>Discount Offers & Promo Broadcast</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Configure coupon promo codes and broadcast details to target customers via system alerts</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-pos-checkout" style={{ width: 'auto', padding: '10px 20px', cursor: 'pointer' }}>
          <i className="fa-solid fa-tags" style={{ marginRight: '8px' }}></i> Create Promo Offer
        </button>
      </div>

      {message && (
        <div style={{ background: 'var(--emerald-light)', border: '1px solid var(--emerald)', color: 'var(--emerald)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* Offers Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px', fontSize: '1.5rem' }}></i> Loading offers...
        </div>
      ) : offers.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', padding: '40px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          No active discount offers configured.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {offers.map((offer) => {
            const isExpired = new Date(offer.validTill) < new Date();
            return (
              <div key={offer._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span className={`badge ${isExpired ? 'danger' : 'success'}`} style={{ position: 'absolute', top: '16px', right: '16px' }}>
                  {isExpired ? 'Expired' : 'Active'}
                </span>
                
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>
                    Audience: {offer.targetAudience} members
                  </span>
                  <h4 style={{ color: '#fff', fontSize: '1.1rem', margin: '4px 0 8px' }}>{offer.title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{offer.description || 'No description provided.'}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>PROMO CODE</span>
                    <strong style={{ color: '#fff', letterSpacing: '0.5px' }}>{offer.code}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', textalign: 'right' }}>DISCOUNT</span>
                    <strong style={{ color: '#10b981', fontSize: '1.2rem' }}>{offer.discountPercentage}% OFF</strong>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Valid until: <strong style={{ color: '#fff' }}>{new Date(offer.validTill).toLocaleDateString()}</strong>
                </div>

                {!isExpired && (
                  <button 
                    onClick={() => handleBroadcast(offer._id)}
                    className="btn-pos-checkout"
                    style={{ width: '100%', padding: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px' }}
                  >
                    <i className="fa-solid fa-bullhorn"></i> Broadcast Promo to regular list
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '32px', borderRadius: 'var(--radius-lg)', width: '500px' }}>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Create Discount Offer</span>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </h3>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Offer / Campaign Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Summer Health Special" style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Promo Coupon Code</label>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required placeholder="e.g. SUMMER15" style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', textTransform: 'uppercase' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Discount Percentage (%)</label>
                <input type="number" min="1" max="100" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} required style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Offer Description</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. 15% discount on all purchases" style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Audience</label>
                <select value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}>
                  <option value="regular">Regular Members Only</option>
                  <option value="all">All Registered Customers</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expiry Validity Date</label>
                <input type="date" value={validTill} onChange={(e) => setValidTill(e.target.value)} required style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                <input type="checkbox" id="broadcastNow" checked={broadcastNow} onChange={(e) => setBroadcastNow(e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                <label htmlFor="broadcastNow" style={{ color: '#fff', fontSize: '0.85rem', cursor: 'pointer' }}>Broadcast via system notifications immediately</label>
              </div>

              <button type="submit" className="btn-pos-checkout btn-emerald" style={{ padding: '12px', marginTop: '10px', cursor: 'pointer' }}>
                Create Campaign Offer
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DiscountOffers;
