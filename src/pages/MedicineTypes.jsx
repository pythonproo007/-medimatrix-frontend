import React, { useState } from 'react';
import { useMedicineCategories, useMedicineTypes, useAddCategory, useAddType } from '../hooks/useMedicines';

const MedicineTypes = () => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [message, setMessage] = useState('');

  // TanStack Query Hooks
  const { data: categoriesData = [], isLoading: catLoading } = useMedicineCategories();
  const { data: typesData = [], isLoading: typeLoading } = useMedicineTypes();

  const addCategoryMutation = useAddCategory();
  const addTypeMutation = useAddType();

  const categories = categoriesData;
  const types = typesData;
  const loading = catLoading || typeLoading;

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const res = await addCategoryMutation.mutateAsync(newCategoryName.trim());
      if (res.success) {
        setMessage('Category created successfully.');
        setNewCategoryName('');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddType = async (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    try {
      const res = await addTypeMutation.mutateAsync(newTypeName.trim());
      if (res.success) {
        setMessage('Medicine dosage type created successfully.');
        setNewTypeName('');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff' }}>Medicine Classifications & Types</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Configure drug therapeutic classifications (categories) and physical dosage types</p>
      </div>

      {message && (
        <div style={{ background: 'var(--emerald-light)', border: '1px solid var(--emerald)', color: 'var(--emerald)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* Categories Section */}
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>Drug Categories</h3>
          
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="e.g. Immunologicals" 
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
              style={{ flex: 1, padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
            />
            <button type="submit" className="badge info" style={{ border: 'none', cursor: 'pointer', padding: '0 16px' }}>Add Category</button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
            {categories.map((c) => (
              <span key={c._id} className="badge info" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                <i className="fa-solid fa-folder-open" style={{ marginRight: '6px' }}></i> {c.name}
              </span>
            ))}
          </div>
        </div>

        {/* Dosage Types Section */}
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>Dosage Form Types</h3>
          
          <form onSubmit={handleAddType} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="e.g. Inhaler / Spray" 
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              required
              style={{ flex: 1, padding: '10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
            />
            <button type="submit" className="badge info" style={{ border: 'none', cursor: 'pointer', padding: '0 16px' }}>Add Type</button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
            {types.map((t) => (
              <span key={t._id} className="badge success" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                <i className="fa-solid fa-prescription-bottle" style={{ marginRight: '6px' }}></i> {t.name}
              </span>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default MedicineTypes;
