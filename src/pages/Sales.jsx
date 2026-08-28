import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useMedicines } from '../hooks/useMedicines';
import { useCustomers } from '../hooks/useCustomers';
import { useSales, useCreateSale, useValidatePromo } from '../hooks/useSales';
import { useAuth } from '../context/AuthContext';

const Sales = () => {
  const { user } = useAuth();
  const userPhone = user?.phone || '';
  const userPaymentQr = user?.paymentQr || '';

  const getQrImageSrc = (qrData, amount) => {
    if (!qrData) return null;
    if (qrData.startsWith('http://') || qrData.startsWith('https://') || qrData.startsWith('data:image/')) {
      return qrData;
    }
    let payload = qrData;
    if (!payload.includes('am=') && amount > 0) {
      if (payload.includes('?')) {
        payload += `&am=${amount.toFixed(2)}&cu=INR`;
      } else if (payload.startsWith('upi://pay')) {
        payload += `?am=${amount.toFixed(2)}&cu=INR`;
      } else {
        payload = `upi://pay?pa=${encodeURIComponent(payload)}&pn=${encodeURIComponent(user?.username || 'MediMatrix')}&am=${amount.toFixed(2)}&cu=INR`;
      }
    }
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(payload)}`;
  };

  // Main View Mode: 'pos' (POS Checkout Terminal) | 'history' (Sales Transactions & Invoice Records)
  const [activeView, setActiveView] = useState('pos');
  const [search, setSearch] = useState('');

  // TanStack Query Hooks
  const { data: medicinesData = [] } = useMedicines({ search });
  const medicines = medicinesData.filter(m => m.quantity > 0);

  const { data: customersData = [] } = useCustomers();
  const customers = customersData;

  const { data: salesListData = [], isLoading: salesLoading } = useSales();
  const salesList = salesListData;

  const createSaleMutation = useCreateSale();
  const validatePromoMutation = useValidatePromo();

  // Multi-Tab Billing State (Persisted so draft is never lost)
  const [bills, setBills] = useState(() => {
    try {
      const saved = localStorage.getItem('pos_billing_draft_tickets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 1,
        name: 'Bill 1',
        cart: [],
        customerPhone: '',
        customerName: '',
        selectedCustomer: null,
        doctorName: '',
        promoCode: '',
        appliedPromo: null,
        paymentMethod: 'Cash',
        isHomeDelivery: false,
        deliveryAddress: ''
      }
    ];
  });
  const [activeBillIndex, setActiveBillIndex] = useState(0);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Confirmation modal state before clearing/completing checkout
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showWhatsappSuccessModal, setShowWhatsappSuccessModal] = useState(false);
  const [completedSaleData, setCompletedSaleData] = useState(null);

  // Sales History & Invoice Record state
  const [salesSearch, setSalesSearch] = useState('');
  const [salesPaymentFilter, setSalesPaymentFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const currentBill = bills[activeBillIndex] || bills[0];

  // Auto-save draft tickets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pos_billing_draft_tickets', JSON.stringify(bills));
    } catch (e) {}
  }, [bills]);


  // Hook to automatically link customer by typing phone number (PRESERVE customerName!)
  useEffect(() => {
    const phone = currentBill.customerPhone ? currentBill.customerPhone.trim() : '';
    if (phone) {
      const found = customers.find(c => c.phone === phone);
      if (found) {
        updateCurrentBill({
          selectedCustomer: found,
          customerName: found.name,
          deliveryAddress: found.homeDeliveryAddress || currentBill.deliveryAddress
        });
      } else {
        updateCurrentBill({ selectedCustomer: null });
      }
    } else {
      updateCurrentBill({ selectedCustomer: null });
    }
  }, [currentBill.customerPhone, customers]);


  const updateCurrentBill = (fields) => {
    setBills(bills.map((b, idx) => 
      idx === activeBillIndex ? { ...b, ...fields } : b
    ));
  };

  const handleAddNewBill = () => {
    if (bills.length >= 5) {
      alert('Maximum of 5 concurrent billing tickets is supported.');
      return;
    }
    const nextNum = bills.length + 1;
    const newBill = {
      id: Date.now(),
      name: `Bill ${nextNum}`,
      cart: [],
      customerPhone: '',
      customerName: '',
      selectedCustomer: null,
      doctorName: '',
      promoCode: '',
      appliedPromo: null,
      paymentMethod: 'Cash',
      isHomeDelivery: false,
      deliveryAddress: ''
    };
    setBills([...bills, newBill]);
    setActiveBillIndex(bills.length);
  };

  const handleRemoveBill = (idxToRemove, e) => {
    e.stopPropagation();
    if (bills[idxToRemove].cart.length > 0) {
      if (!window.confirm(`Are you sure you want to close "${bills[idxToRemove].name}" with active items in cart?`)) {
        return;
      }
    }
    if (bills.length === 1) {
      updateCurrentBill({
        cart: [],
        customerPhone: '',
        customerName: '',
        selectedCustomer: null,
        doctorName: '',
        promoCode: '',
        appliedPromo: null,
        paymentMethod: 'Cash',
        isHomeDelivery: false,
        deliveryAddress: ''
      });
      return;
    }
    const filtered = bills.filter((_, idx) => idx !== idxToRemove);
    setBills(filtered);
    if (activeBillIndex >= filtered.length) {
      setActiveBillIndex(filtered.length - 1);
    }
  };

  const handleAddToCart = (med) => {
    setError('');
    const existing = currentBill.cart.find(item => item.medicineId === med._id);
    if (existing) {
      if (existing.quantity >= med.quantity) {
        setError(`Insufficient stock for ${med.name}. Only ${med.quantity} available.`);
        return;
      }
      updateCurrentBill({
        cart: currentBill.cart.map(item => 
          item.medicineId === med._id ? { ...item, quantity: item.quantity + 1 } : item
        )
      });
    } else {
      updateCurrentBill({
        cart: [...currentBill.cart, {
          medicineId: med._id,
          medicineName: med.name,
          quantity: 1,
          unitPrice: med.sellingPrice,
          available: med.quantity
        }]
      });
    }
  };

  const handleQtyChange = (medId, value) => {
    const qty = Math.max(1, Number(value));
    const item = currentBill.cart.find(c => c.medicineId === medId);
    if (item) {
      if (qty > item.available) {
        setError(`Insufficient stock. Only ${item.available} units available.`);
        return;
      }
      setError('');
      updateCurrentBill({
        cart: currentBill.cart.map(c => c.medicineId === medId ? { ...c, quantity: qty } : c)
      });
    }
  };

  const handleRemoveFromCart = (medId) => {
    updateCurrentBill({
      cart: currentBill.cart.filter(item => item.medicineId !== medId)
    });
  };

  const handleApplyPromo = async () => {
    setError('');
    updateCurrentBill({ appliedPromo: null });
    if (!currentBill.promoCode.trim()) return;

    try {
      const res = await validatePromoMutation.mutateAsync(currentBill.promoCode.trim());
      if (res.success) {
        updateCurrentBill({ appliedPromo: res.offer });
        setMessage(`Promo code "${res.offer.code}" applied! (${res.offer.discountPercentage}% Discount)`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Pricing calculations
  const subtotal = currentBill.cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  
  let regularDiscount = 0;
  if (currentBill.selectedCustomer && currentBill.selectedCustomer.isRegular) {
    regularDiscount = Math.round(subtotal * 0.10);
  }

  let promoDiscount = 0;
  if (currentBill.appliedPromo) {
    promoDiscount = Math.round(subtotal * (currentBill.appliedPromo.discountPercentage / 100));
  }

  const finalDiscount = Math.max(regularDiscount, promoDiscount);
  const grandTotal = Math.max(0, subtotal - finalDiscount);

  // Trigger checkout confirmation modal
  const handleInitiateCheckout = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (currentBill.cart.length === 0) {
      setError('Your shopping cart is empty.');
      return;
    }

    if (currentBill.isHomeDelivery && !currentBill.deliveryAddress.trim()) {
      setError('Please provide a delivery address for home courier dispatch.');
      return;
    }

    setShowConfirmModal(true);
  };

  // Execute checkout after explicit confirmation
  const handleConfirmExecuteCheckout = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    try {
      const res = await createSaleMutation.mutateAsync({
        customerName: currentBill.customerName || 'Walk-in Customer',
        customerPhone: currentBill.customerPhone,
        items: currentBill.cart,
        paymentMethod: currentBill.paymentMethod,
        doctorName: currentBill.doctorName,
        promoCode: currentBill.appliedPromo ? currentBill.appliedPromo.code : '',
        isHomeDelivery: currentBill.isHomeDelivery,
        deliveryAddress: currentBill.deliveryAddress
      });

      if (res.success) {
        setMessage(`POS Billing checkout completed! Invoice: ${res.data.invoiceNo}`);
        
        // Reset active bill
        if (bills.length === 1) {
          updateCurrentBill({
            cart: [],
            customerPhone: '',
            customerName: '',
            selectedCustomer: null,
            doctorName: '',
            promoCode: '',
            appliedPromo: null,
            paymentMethod: 'Cash',
            isHomeDelivery: false,
            deliveryAddress: ''
          });
        } else {
          const filtered = bills.filter((_, idx) => idx !== activeBillIndex);
          setBills(filtered);
          setActiveBillIndex(Math.max(0, activeBillIndex - 1));
        }

        if (res.data) {
          setCompletedSaleData(res.data);
          setShowWhatsappSuccessModal(true);
          if (res.data.whatsappUrl) {
            try {
              window.open(res.data.whatsappUrl, '_blank');
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // View full printable invoice modal
  const handleViewInvoice = async (saleId) => {
    try {
      const res = await api.get(`/api/sales/${saleId}`);
      if (res.success) {
        setSelectedInvoice(res.data);
      }
    } catch (err) {
      alert(`Could not load invoice details: ${err.message}`);
    }
  };

  // Filter sales history
  const filteredSales = salesList.filter(s => {
    const matchesSearch = !salesSearch || 
      (s.invoiceNo && s.invoiceNo.toLowerCase().includes(salesSearch.toLowerCase())) ||
      (s.customerName && s.customerName.toLowerCase().includes(salesSearch.toLowerCase())) ||
      (s.customerPhone && s.customerPhone.includes(salesSearch));
    const matchesPayment = !salesPaymentFilter || s.paymentMethod === salesPaymentFilter;
    return matchesSearch && matchesPayment;
  });

  const handleClearCurrentTicket = () => {
    if (window.confirm(`Are you sure you want to clear all entered billing fields and cart items in "${currentBill.name}"?`)) {
      updateCurrentBill({
        cart: [],
        customerPhone: '',
        customerName: '',
        selectedCustomer: null,
        doctorName: '',
        promoCode: '',
        appliedPromo: null,
        paymentMethod: 'Cash',
        isHomeDelivery: false,
        deliveryAddress: ''
      });
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      
      {/* Top Header & Navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff' }}>POS Billing & Sales Transactions Engine</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Manage real-time POS checkouts and inspect entire invoice records</p>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-surface)', padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveView('pos')}
            style={{
              padding: '8px 16px',
              background: activeView === 'pos' ? 'var(--primary)' : 'transparent',
              color: activeView === 'pos' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem'
            }}
          >
            <i className="fa-solid fa-cash-register" style={{ marginRight: '8px' }}></i> POS Checkout Terminal
          </button>
          <button
            onClick={() => setActiveView('history')}
            style={{
              padding: '8px 16px',
              background: activeView === 'history' ? 'var(--primary)' : 'transparent',
              color: activeView === 'history' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem'
            }}
          >
            <i className="fa-solid fa-receipt" style={{ marginRight: '8px' }}></i> Sales Transactions & Invoices
          </button>
        </div>
      </div>

      {activeView === 'pos' ? (
        <>
          {/* Billing Ticket Tabs Header */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              {bills.map((bill, index) => (
                <div 
                  key={bill.id} 
                  onClick={() => setActiveBillIndex(index)}
                  style={{
                    padding: '8px 14px',
                    background: index === activeBillIndex ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                    color: index === activeBillIndex ? '#fff' : 'var(--text-muted)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: index === activeBillIndex ? 'none' : '1px solid var(--border-color)',
                    transition: 'var(--transition)'
                  }}
                >
                  <span>{bill.name}</span>
                  <button 
                    onClick={(e) => handleRemoveBill(index, e)} 
                    style={{ background: 'none', border: 'none', color: index === activeBillIndex ? '#fff' : 'var(--text-dim)', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button 
                onClick={handleAddNewBill}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '4px',
                  color: '#10b981',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: '600'
                }}
              >
                <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> New Bill
              </button>
            </div>
          </div>

          {/* POS Split Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '5fr 3fr', gap: '32px' }}>
            
            {/* Left Column: Catalog Search */}
            <div>
              <div style={{ marginBottom: '24px' }}>
                <input 
                  type="text" 
                  placeholder="Type name, category, batch or active chemical ingredient to search catalog..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {medicines.length === 0 ? (
                  <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No in-stock medicines matching search query.
                  </div>
                ) : (
                  medicines.map((med) => (
                    <ProductCard key={med._id} medicine={med} onAdd={handleAddToCart} />
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Dynamic Invoice Checkout Drawer */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <i className="fa-solid fa-file-invoice-dollar" style={{ marginRight: '8px', color: 'var(--primary)' }}></i> Checkout - {currentBill.name}
                </span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {(currentBill.cart.length > 0 || currentBill.customerName || currentBill.customerPhone || currentBill.doctorName) && (
                    <button 
                      type="button" 
                      onClick={handleClearCurrentTicket}
                      title="Clear draft billing form"
                      className="badge danger" 
                      style={{ border: 'none', cursor: 'pointer', padding: '3px 8px', fontSize: '0.72rem' }}
                    >
                      <i className="fa-solid fa-rotate-left"></i> Clear
                    </button>
                  )}
                  <span className="badge info" style={{ fontSize: '0.72rem' }}>Tab Active</span>
                </div>
              </h3>


              {error && (
                <div style={{ background: 'var(--rose-light)', border: '1px solid var(--rose)', color: 'var(--rose)', padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}

              {message && (
                <div style={{ background: 'var(--emerald-light)', border: '1px solid var(--emerald)', color: 'var(--emerald)', padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
                  {message}
                </div>
              )}

              {/* Cart items list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
                {currentBill.cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    <i className="fa-solid fa-cart-shopping" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}></i>
                    Invoice cart is currently empty.
                  </div>
                ) : (
                  currentBill.cart.map((item) => (
                    <div key={item.medicineId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <div style={{ flex: 1, minWidth: 0, marginRight: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '500', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.medicineName}</span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>₹{item.unitPrice.toFixed(2)} each</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => handleQtyChange(item.medicineId, e.target.value)}
                          style={{ width: '50px', padding: '4px', background: '#070d19', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff', textAlign: 'center' }} 
                        />
                        <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '600', minWidth: '60px', textAlign: 'right' }}>
                          ₹{(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                        <button onClick={() => handleRemoveFromCart(item.medicineId)} style={{ background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer', fontSize: '1.1rem' }}>
                          &times;
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Billing Inputs Form */}
              <form onSubmit={handleInitiateCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Customer Phone</label>
                    <input 
                      type="text" 
                      value={currentBill.customerPhone}
                      onChange={(e) => updateCurrentBill({ customerPhone: e.target.value })}
                      placeholder="Verify member" 
                      style={{ width: '100%', padding: '8px 10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.82rem' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Customer Name</label>
                    <input 
                      type="text" 
                      value={currentBill.customerName}
                      onChange={(e) => updateCurrentBill({ customerName: e.target.value })}
                      placeholder="Walk-in Client" 
                      style={{ width: '100%', padding: '8px 10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.82rem' }} 
                    />
                  </div>
                </div>

                {currentBill.selectedCustomer && currentBill.selectedCustomer.isRegular && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.72rem', color: 'var(--emerald)' }}>
                    <i className="fa-solid fa-circle-check"></i> Regular Member (10% Discount Auto Applied)
                  </div>
                )}

                <div className="form-group">
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Prescribing Doctor (Optional)</label>
                  <input 
                    type="text" 
                    value={currentBill.doctorName}
                    onChange={(e) => updateCurrentBill({ doctorName: e.target.value })}
                    placeholder="e.g. Dr. Greg House" 
                    style={{ width: '100%', padding: '8px 10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.82rem' }} 
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Coupon Promo Code</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      value={currentBill.promoCode}
                      onChange={(e) => updateCurrentBill({ promoCode: e.target.value })}
                      placeholder="e.g. HEALTH15" 
                      style={{ flex: 1, padding: '8px 10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.82rem', textTransform: 'uppercase' }} 
                    />
                    <button type="button" onClick={handleApplyPromo} className="badge info" style={{ border: 'none', cursor: 'pointer', padding: '0 12px' }}>Apply</button>
                  </div>
                </div>

                {/* Delivery address option */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                  <input 
                    type="checkbox" 
                    id="isHomeDelivery" 
                    checked={currentBill.isHomeDelivery}
                    onChange={(e) => updateCurrentBill({ isHomeDelivery: e.target.checked })}
                    style={{ transform: 'scale(1.1)' }} 
                  />
                  <label htmlFor="isHomeDelivery" style={{ color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}>Require home delivery dispatch</label>
                </div>

                {currentBill.isHomeDelivery && (
                  <div className="form-group">
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Shipping Destination Address</label>
                    <input 
                      type="text" 
                      value={currentBill.deliveryAddress}
                      onChange={(e) => updateCurrentBill({ deliveryAddress: e.target.value })}
                      placeholder="Enter courier shipping address" 
                      required
                      style={{ width: '100%', padding: '8px 10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.82rem' }} 
                    />
                  </div>
                )}

                <div className="form-group">
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Payment Channel</label>
                  <select value={currentBill.paymentMethod} onChange={(e) => updateCurrentBill({ paymentMethod: e.target.value })} style={{ width: '100%', padding: '8px 10px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.82rem' }}>
                    <option value="Cash">Cash Ledger</option>
                    <option value="UPI / QR">UPI / Mobile QR Code Scan</option>
                    <option value="Card">Visa / Mastercard / Card Swipe</option>
                    <option value="Credit">Credit Book Account</option>
                  </select>
                </div>

                {/* Dynamic UPI QR Code Display Container */}
                {currentBill.paymentMethod === 'UPI / QR' && (
                  !userPaymentQr ? (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid #f87171',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      margin: '8px 0',
                      textAlign: 'center',
                      color: '#f87171'
                    }}>
                      <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>⚠️</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '4px' }}>
                        Payment QR not available for this account.
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                        Account: <strong>{user?.username || 'User'}</strong> {userPhone ? `(${userPhone})` : ''}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      margin: '8px 0',
                      textAlign: 'center',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                      color: '#0f172a'
                    }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-qrcode" style={{ color: '#0d9488', fontSize: '1rem' }}></i> Scan & Pay via UPI App
                      </div>

                      {/* QR Code graphic */}
                      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', display: 'inline-block', border: '1px solid #cbd5e1' }}>
                        <img 
                          src={getQrImageSrc(userPaymentQr, grandTotal)}
                          alt="Account Payment QR Code"
                          style={{ width: '150px', height: '150px', display: 'block', borderRadius: '4px', objectFit: 'contain' }}
                        />
                      </div>

                      <div style={{ marginTop: '10px' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0d9488' }}>
                          ₹{grandTotal.toFixed(2)}
                        </div>
                        {userPhone && (
                          <div style={{ fontSize: '0.74rem', color: '#0369a1', marginTop: '3px', fontWeight: '600' }}>
                            📱 Account Mobile: {userPhone}
                          </div>
                        )}
                        <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '6px', fontStyle: 'italic' }}>
                          Accepts GPay, PhonePe, Paytm, BHIM & All UPI Apps
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowQrModal(true)}
                          style={{ marginTop: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '4px', padding: '4px 10px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '600' }}
                        >
                          <i className="fa-solid fa-expand" style={{ marginRight: '4px' }}></i> Enlarge QR Code
                        </button>
                      </div>
                    </div>
                  )
                )}


                {/* Calculations block */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '12px 0', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                    <span style={{ color: '#fff' }}>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {finalDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--rose)' }}>Discount Reduction:</span>
                      <span style={{ color: 'var(--rose)', fontWeight: '600' }}>-₹{finalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: '700', marginTop: '4px' }}>
                    <span style={{ color: '#fff' }}>Grand Total:</span>
                    <span style={{ color: '#10b981' }}>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || currentBill.cart.length === 0} 
                  className="btn-pos-checkout btn-emerald" 
                  style={{ width: '100%', padding: '12px', marginTop: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700' }}
                >
                  {loading ? 'Processing Checkout...' : 'Confirm POS Sale Checkout'}
                </button>
              </form>
            </div>

          </div>
        </>
      ) : (
        /* Sales Transactions & Invoice Records History View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Filters & Search */}
          <div style={{ display: 'flex', gap: '16px', background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <input 
                type="text" 
                placeholder="Search by invoice number (e.g. INV-123456), customer name or phone..." 
                value={salesSearch}
                onChange={(e) => setSalesSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 16px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              />
            </div>

            <select 
              value={salesPaymentFilter}
              onChange={(e) => setSalesPaymentFilter(e.target.value)}
              style={{ padding: '10px 16px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', minWidth: '180px' }}
            >
              <option value="">All Payment Channels</option>
              <option value="Cash">Cash Ledger</option>
              <option value="UPI / QR">UPI / QR Scan</option>
              <option value="Card">Visa / Mastercard</option>
              <option value="Credit">Credit Book</option>
            </select>
          </div>

          {/* Sales History Table */}
          <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
            <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px 10px' }}>Invoice #</th>
                  <th style={{ padding: '12px 10px' }}>Date & Time</th>
                  <th style={{ padding: '12px 10px' }}>Customer Name</th>
                  <th style={{ padding: '12px 10px' }}>Phone</th>
                  <th style={{ padding: '12px 10px' }}>Payment Method</th>
                  <th style={{ padding: '12px 10px' }}>Grand Total</th>
                  <th style={{ padding: '12px 10px' }}>Delivery Status</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {salesLoading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading sales transaction ledger...
                    </td>
                  </tr>
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No sales transaction records found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.88rem' }}>
                      <td style={{ padding: '12px 10px', color: 'var(--primary)', fontWeight: '600' }}>{sale.invoiceNo}</td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                        {new Date(sale.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 10px', color: '#fff', fontWeight: '500' }}>{sale.customerName}</td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{sale.customerPhone || 'N/A'}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span className="badge info" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>{sale.paymentMethod}</span>
                      </td>
                      <td style={{ padding: '12px 10px', color: '#10b981', fontWeight: '700' }}>₹{sale.grandTotal.toFixed(2)}</td>
                      <td style={{ padding: '12px 10px' }}>
                        {sale.isHomeDelivery ? (
                          <span className={`badge ${sale.deliveryStatus === 'Delivered' ? 'success' : 'warning'}`}>
                            Courier: {sale.deliveryStatus}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Over Counter</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleViewInvoice(sale._id)}
                          className="badge info"
                          style={{ border: 'none', cursor: 'pointer', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '600' }}
                        >
                          <i className="fa-solid fa-receipt" style={{ marginRight: '6px' }}></i> View Invoice
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POS Checkout Confirmation Modal (Requirement 4: Don't clear unless confirmed) */}
      {showConfirmModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '32px', borderRadius: 'var(--radius-lg)', width: '520px', maxWidth: '90%' }}>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-circle-question" style={{ color: 'var(--primary)' }}></i> Confirm POS Checkout Order
            </h3>
            
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Please confirm the following sales transaction details before committing stock deduction:
            </p>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '20px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                <span style={{ color: '#fff', fontWeight: '600' }}>{currentBill.customerName || 'Walk-in Customer'}</span>
              </div>
              {currentBill.customerPhone && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
                  <span style={{ color: '#fff' }}>{currentBill.customerPhone}</span>
                </div>
              )}
              {currentBill.doctorName && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Doctor:</span>
                  <span style={{ color: '#fff' }}>{currentBill.doctorName}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Channel:</span>
                <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{currentBill.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cart Line Items:</span>
                <span style={{ color: '#fff' }}>{currentBill.cart.length} items ({currentBill.cart.reduce((a,c) => a + c.quantity, 0)} units)</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '700' }}>
                <span style={{ color: '#fff' }}>Payable Amount:</span>
                <span style={{ color: '#10b981' }}>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowConfirmModal(false)}
                style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '600' }}
              >
                Cancel / Keep Editing
              </button>
              <button 
                onClick={handleConfirmExecuteCheckout}
                className="btn-pos-checkout btn-emerald"
                style={{ padding: '10px 24px', cursor: 'pointer', fontWeight: '700' }}
              >
                <i className="fa-solid fa-check" style={{ marginRight: '6px' }}></i> Confirm & Complete Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Record Modal */}
      {selectedInvoice && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', color: '#1e293b', borderRadius: 'var(--radius-md)', width: '650px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '32px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            
            {/* Action Bar (Screen Only) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '1rem' }}>Invoice Preview - {selectedInvoice.invoiceNo}</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => window.print()} 
                  style={{ padding: '8px 16px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                >
                  <i className="fa-solid fa-print" style={{ marginRight: '6px' }}></i> Print Invoice
                </button>
                <button 
                  onClick={() => setSelectedInvoice(null)} 
                  style={{ padding: '8px 14px', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Invoice Printable Area */}
            <div id="printable-invoice-content">
              {/* Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>MEDICARE PHARMACY & DRUGSTORE</h1>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0' }}>Licence No: DL-8849202 | Tax Reg: GSTIN29AAACM38491Z</p>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>102 Healthcare Avenue, Medical District | Helpline: +91 98765 43210</p>
              </div>

              {/* Invoice Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', fontSize: '0.85rem' }}>
                <div>
                  <p style={{ margin: '2px 0' }}><strong>Invoice No:</strong> {selectedInvoice.invoiceNo}</p>
                  <p style={{ margin: '2px 0' }}><strong>Date:</strong> {new Date(selectedInvoice.createdAt).toLocaleString()}</p>
                  <p style={{ margin: '2px 0' }}><strong>Payment Method:</strong> {selectedInvoice.paymentMethod}</p>
                </div>
                <div>
                  <p style={{ margin: '2px 0' }}><strong>Customer:</strong> {selectedInvoice.customerName}</p>
                  <p style={{ margin: '2px 0' }}><strong>Phone:</strong> {selectedInvoice.customerPhone || 'N/A'}</p>
                  {selectedInvoice.doctorName && (
                    <p style={{ margin: '2px 0' }}><strong>Doctor:</strong> Dr. {selectedInvoice.doctorName}</p>
                  )}
                  {selectedInvoice.isHomeDelivery && (
                    <p style={{ margin: '2px 0' }}><strong>Delivery:</strong> {selectedInvoice.deliveryAddress}</p>
                  )}
                </div>
              </div>

              {/* Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#334155', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>#</th>
                    <th style={{ padding: '8px' }}>Item Description</th>
                    <th style={{ padding: '8px' }}>Batch</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Unit Price</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                    selectedInvoice.items.map((item, idx) => (
                      <tr key={item._id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px' }}>{idx + 1}</td>
                        <td style={{ padding: '8px', fontWeight: '600' }}>{item.medicineName}</td>
                        <td style={{ padding: '8px', color: '#64748b' }}>{item.batchNumber || 'N/A'}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>₹{item.unitPrice.toFixed(2)}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}>₹{item.total.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>Standard POS line items record</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Summary */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                <div style={{ width: '250px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span>₹{(selectedInvoice.subtotal || selectedInvoice.grandTotal).toFixed(2)}</span>
                  </div>
                  {selectedInvoice.totalDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e11d48' }}>
                      <span>Discount Saved:</span>
                      <span>-₹{selectedInvoice.totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ borderTop: '2px solid #0f172a', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: '800' }}>
                    <span>Grand Total:</span>
                    <span style={{ color: '#059669' }}>₹{selectedInvoice.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Notice */}
              <div style={{ textAlign: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '16px', fontSize: '0.78rem', color: '#64748b' }}>
                <p style={{ margin: '2px 0', fontWeight: '600' }}>Thank you for choosing Medicare Drugstore! Wish you good health.</p>
                <p style={{ margin: 0 }}>Computer Generated Retail Invoice. Prescribed drugs require doctor's mandate.</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Full Screen High Definition Scan & Pay QR Code Modal */}
      {showQrModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', color: '#0f172a', borderRadius: '16px', padding: '32px', width: '420px', maxWidth: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                <i className="fa-solid fa-qrcode" style={{ color: '#0d9488', fontSize: '1.2rem' }}></i> Account Payment QR
              </div>
              <button onClick={() => setShowQrModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.4rem', cursor: 'pointer' }}>&times;</button>
            </div>

            {!userPaymentQr ? (
              <div style={{ padding: '24px', background: '#fef2f2', borderRadius: '12px', color: '#991b1b', marginBottom: '20px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>⚠️</div>
                <div style={{ fontWeight: '700', fontSize: '1rem' }}>Payment QR not available for this account.</div>
                <div style={{ fontSize: '0.85rem', color: '#7f1d1d', marginTop: '6px' }}>
                  Mobile: {userPhone || 'Not set'}
                </div>
              </div>
            ) : (
              <>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'inline-block', marginBottom: '16px' }}>
                  <img 
                    src={getQrImageSrc(userPaymentQr, grandTotal)}
                    alt="Enlarged Account Payment QR Code"
                    style={{ width: '230px', height: '230px', display: 'block', borderRadius: '8px', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0d9488' }}>
                    ₹{grandTotal.toFixed(2)}
                  </div>
                  {userPhone && (
                    <div style={{ fontSize: '0.85rem', color: '#0369a1', marginTop: '4px', fontWeight: '600' }}>
                      📱 Account Mobile Number: {userPhone}
                    </div>
                  )}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
              <span style={{ background: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '600' }}>Google Pay</span>
              <span style={{ background: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '600' }}>PhonePe</span>
              <span style={{ background: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '600' }}>Paytm</span>
              <span style={{ background: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '600' }}>BHIM UPI</span>
            </div>

            <button 
              onClick={() => setShowQrModal(false)}
              style={{ width: '100%', padding: '12px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
            >
              Done / Close QR Code
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp Bill Dispatch Modal */}
      {showWhatsappSuccessModal && completedSaleData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 1400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#1e293b', color: '#f8fafc', borderRadius: '16px', padding: '28px', width: '480px', maxWidth: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid #334155' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅📱</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#22c55e', margin: '0 0 6px 0' }}>Bill Generated Successfully!</h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '0 0 16px 0' }}>Invoice #{completedSaleData.invoiceNo}</p>

            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '14px', textAlign: 'left', fontSize: '0.82rem', color: '#cbd5e1', whiteSpace: 'pre-wrap', maxHeight: '180px', overflowY: 'auto', marginBottom: '20px', fontFamily: 'Fira Code, monospace' }}>
              {completedSaleData.whatsappText}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  if (completedSaleData.whatsappUrl) {
                    window.open(completedSaleData.whatsappUrl, '_blank');
                  }
                }}
                style={{ flex: 1, background: '#25d366', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                📱 Send WhatsApp Bill & Feedback Request
              </button>
              <button
                onClick={() => {
                  setShowWhatsappSuccessModal(false);
                  if (completedSaleData && completedSaleData._id) {
                    handleViewInvoice(completedSaleData._id);
                  }
                }}
                style={{ flex: 1, background: '#334155', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                View Full Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Sales;

