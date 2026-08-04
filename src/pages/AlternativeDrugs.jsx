import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AlternativeDrugs = () => {
  const [medicines, setMedicines] = useState([]);
  const [selectedMedId, setSelectedMedId] = useState('');
  const [allergiesText, setAllergiesText] = useState('');
  const [alternates, setAlternates] = useState([]);
  const [originalMed, setOriginalMed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
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
    fetchMeds();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!selectedMedId) return;

    setLoading(true);
    setSearched(true);
    try {
      let url = `/api/medicines/${selectedMedId}/alternates`;
      if (allergiesText.trim()) {
        url += `?allergies=${encodeURIComponent(allergiesText.trim())}`;
      }
      const res = await api.get(url);
      if (res.success) {
        setAlternates(res.alternates);
        setOriginalMed(res.originalMedicine);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff' }}>Drug Substitutes / Alternates Engine</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Find alternative in-stock medicines matching therapeutic chemical ingredients while avoiding patient allergies</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        
        {/* Lookup Parameters */}
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', height: 'fit-content' }}>
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px' }}>Alternate Lookup Specs</h3>
          
          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Medicine</label>
              <select 
                value={selectedMedId} 
                onChange={(e) => setSelectedMedId(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                required
              >
                <option value="">-- Select Target Medicine --</option>
                {medicines.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Patient Allergies (comma-separated)</label>
              <input 
                type="text" 
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder="e.g. Penicillin, Amoxicillin" 
                style={{ width: '100%', padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Matches drug active ingredients and category names</span>
            </div>

            <button type="submit" disabled={loading} className="btn-pos-checkout" style={{ padding: '12px', marginTop: '10px', cursor: 'pointer' }}>
              {loading ? 'Finding Substitutes...' : 'Search Safe Substitutes'}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px' }}>Matching Safe Substitutes</h3>
          
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '30px', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', marginBottom: '10px' }}></i>
              <span>Processing substitute matches...</span>
            </div>
          ) : !searched ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', padding: '40px 0' }}>
              <i className="fa-solid fa-shuffle" style={{ fontSize: '3rem', marginBottom: '15px', color: 'var(--text-dim)' }}></i>
              <p>Configure lookup specifications on the left panel to scan for substitutes</p>
            </div>
          ) : (
            <div>
              {originalMed && (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--rose)', fontWeight: '600' }}>ORIGINAL PRESCRIBED / REQUESTED DRUG</span>
                  <h4 style={{ color: '#fff', fontSize: '1rem', marginTop: '4px' }}>{originalMed.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Active ingredient: <strong style={{ color: '#fff' }}>{originalMed.activeIngredient}</strong> | Category: {originalMed.category}
                  </p>
                </div>
              )}

              <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px 10px' }}>Medicine Name</th>
                    <th style={{ padding: '12px 10px' }}>Active Ingredient</th>
                    <th style={{ padding: '12px 10px' }}>Category</th>
                    <th style={{ padding: '12px 10px' }}>Location</th>
                    <th style={{ padding: '12px 10px' }}>In Stock</th>
                    <th style={{ padding: '12px 10px' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {alternates.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No safe in-stock substitutes matching criteria were found.
                      </td>
                    </tr>
                  ) : (
                    alternates.map((alt) => (
                      <tr key={alt._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.88rem' }}>
                        <td style={{ padding: '12px 10px', color: '#fff', fontWeight: '500' }}>{alt.name}</td>
                        <td style={{ padding: '12px 10px', color: 'var(--primary)' }}>{alt.activeIngredient}</td>
                        <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{alt.category}</td>
                        <td style={{ padding: '12px 10px', color: 'var(--text-dim)' }}>{alt.rackLocation}</td>
                        <td style={{ padding: '12px 10px', color: '#fff', fontWeight: '600' }}>{alt.quantity}</td>
                        <td style={{ padding: '12px 10px', color: '#10b981', fontWeight: '600' }}>₹{alt.sellingPrice.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AlternativeDrugs;
