import React from 'react';

const ProductCard = ({ medicine, onAdd }) => {
  const isLowStock = medicine.quantity <= medicine.minStockAlert;
  const isExpired = new Date(medicine.expiryDate) < new Date();
  
  return (
    <div className={`med-card ${isLowStock ? 'alert-low' : ''}`} style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: '16px',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      transition: 'var(--transition)'
    }}>
      {isLowStock && (
        <span className="badge danger" style={{ position: 'absolute', top: '12px', right: '12px' }}>
          Low Stock
        </span>
      )}
      {isExpired && (
        <span className="badge danger" style={{ position: 'absolute', top: '12px', right: '12px' }}>
          Expired
        </span>
      )}

      <div>
        <span style={{ fontSize: '0.75rem', color: '#06b6d4', textTransform: 'uppercase', fontWeight: '600' }}>
          {medicine.category}
        </span>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#fff', margin: '4px 0' }}>
          {medicine.name}
        </h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Active: {medicine.activeIngredient || 'None'}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
        <div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Price</p>
          <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#10b981' }}>
            ₹{medicine.sellingPrice.toFixed(2)}
          </span>
        </div>
        <div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'right' }}>Stock</p>
          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: isLowStock ? '#ef4444' : '#fff' }}>
            {medicine.quantity} {medicine.medicineType}s
          </span>
        </div>
      </div>

      {onAdd && !isExpired && medicine.quantity > 0 && (
        <button 
          onClick={() => onAdd(medicine)}
          className="btn-add-to-cart"
          style={{
            width: '100%',
            padding: '8px',
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '6px',
            color: '#06b6d4',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'var(--transition)'
          }}
        >
          <i className="fa-solid fa-cart-plus"></i> Add to Billing
        </button>
      )}
    </div>
  );
};

export default ProductCard;
