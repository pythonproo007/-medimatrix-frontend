import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Reports = () => {
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const resSales = await api.get('/api/sales');
      const resPurchases = await api.get('/api/purchases');

      if (resSales.success) setSales(resSales.data);
      if (resPurchases.success) setPurchases(resPurchases.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filterByDate = (items) => {
    if (timeFilter === 'all') return items;
    const now = new Date();
    return items.filter(item => {
      const itemDate = new Date(item.createdAt);
      if (timeFilter === 'today') {
        return itemDate.toDateString() === now.toDateString();
      }
      if (timeFilter === 'week') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= sevenDaysAgo;
      }
      if (timeFilter === 'month') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return itemDate >= thirtyDaysAgo;
      }
      return true;
    });
  };

  const dateFilteredSales = filterByDate(sales);
  const dateFilteredPurchases = filterByDate(purchases);

  const searchFilteredSales = dateFilteredSales.filter(s => 
    !search || 
    (s.invoiceNo && s.invoiceNo.toLowerCase().includes(search.toLowerCase())) ||
    (s.customerName && s.customerName.toLowerCase().includes(search.toLowerCase()))
  );

  const searchFilteredPurchases = dateFilteredPurchases.filter(p => 
    !search || 
    (p.purchaseNo && p.purchaseNo.toLowerCase().includes(search.toLowerCase())) ||
    (p.supplierName && p.supplierName.toLowerCase().includes(search.toLowerCase()))
  );

  // Financial Metrics Calculations
  const grossSalesVal = dateFilteredSales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const totalDiscountsVal = dateFilteredSales.reduce((acc, s) => acc + (s.totalDiscount || 0), 0);
  const grossSubtotalVal = dateFilteredSales.reduce((acc, s) => acc + (s.subtotal || s.grandTotal), 0);
  
  const totalPurchVal = dateFilteredPurchases.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  
  const netProfitLoss = grossSalesVal - totalPurchVal;
  const isProfit = netProfitLoss >= 0;

  const marginPercentage = grossSalesVal > 0 
    ? ((netProfitLoss / grossSalesVal) * 100).toFixed(1) 
    : totalPurchVal > 0 ? '-100.0' : '0.0';

  // Payment Breakdown
  const cashSales = dateFilteredSales.filter(s => s.paymentMethod === 'Cash').reduce((acc, s) => acc + s.grandTotal, 0);
  const digitalSales = dateFilteredSales.filter(s => s.paymentMethod === 'UPI / QR' || s.paymentMethod === 'Card').reduce((acc, s) => acc + s.grandTotal, 0);
  const creditSales = dateFilteredSales.filter(s => s.paymentMethod === 'Credit').reduce((acc, s) => acc + s.grandTotal, 0);

  return (
    <div style={{ padding: '32px' }}>
      
      {/* Top Title & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff' }}>System Reports & Profit/Loss Audit</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Financial statement audit, net profit/loss analysis, revenue sheets, and supplier expenditure</p>
        </div>

        {/* Time Period Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-surface)', padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'Last 7 Days' },
            { id: 'month', label: 'Last 30 Days' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTimeFilter(tab.id)}
              style={{
                padding: '8px 14px',
                background: timeFilter === tab.id ? 'var(--primary)' : 'transparent',
                color: timeFilter === tab.id ? '#fff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: '600'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px', fontSize: '1.5rem' }}></i> Compiling financial reports...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Key Financial Indicators Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            
            {/* Gross Revenue */}
            <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '600' }}>Gross Sales Revenue</span>
                <span className="badge success" style={{ fontSize: '0.7rem' }}>Income</span>
              </div>
              <h3 style={{ fontSize: '1.7rem', color: '#10b981', fontWeight: '700' }}>₹{grossSalesVal.toFixed(2)}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                From {dateFilteredSales.length} total POS sales transactions
              </p>
            </div>

            {/* Wholesale Purchases */}
            <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '600' }}>Supplier Restock Cost</span>
                <span className="badge danger" style={{ fontSize: '0.7rem' }}>Expense</span>
              </div>
              <h3 style={{ fontSize: '1.7rem', color: 'var(--rose)', fontWeight: '700' }}>-₹{totalPurchVal.toFixed(2)}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                From {dateFilteredPurchases.length} wholesale restock orders
              </p>
            </div>

            {/* Total Discounts Granted */}
            <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '600' }}>Discounts Granted</span>
                <span className="badge warning" style={{ fontSize: '0.7rem' }}>Reduction</span>
              </div>
              <h3 style={{ fontSize: '1.7rem', color: '#f59e0b', fontWeight: '700' }}>₹{totalDiscountsVal.toFixed(2)}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Member & Promo discount savings
              </p>
            </div>

            {/* NET PROFIT / LOSS HIGHLIGHT CARD */}
            <div style={{ 
              background: 'var(--bg-card)', 
              padding: '20px', 
              borderRadius: 'var(--radius-md)', 
              border: isProfit ? '2px solid #10b981' : '2px solid var(--rose)',
              boxShadow: isProfit ? '0 0 15px rgba(16, 185, 129, 0.15)' : '0 0 15px rgba(244, 63, 94, 0.15)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#fff', textTransform: 'uppercase', fontWeight: '700' }}>Net Profit / Loss Audit</span>
                <span className={`badge ${isProfit ? 'success' : 'danger'}`} style={{ fontWeight: '700' }}>
                  {isProfit ? 'NET PROFIT (SURPLUS)' : 'NET LOSS (DEFICIT)'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.8rem', color: isProfit ? '#10b981' : 'var(--rose)', fontWeight: '800' }}>
                {isProfit ? `+₹${netProfitLoss.toFixed(2)}` : `-₹${Math.abs(netProfitLoss).toFixed(2)}`}
              </h3>
              <p style={{ fontSize: '0.78rem', color: isProfit ? 'var(--emerald)' : 'var(--rose)', fontWeight: '600', marginTop: '4px' }}>
                {isProfit 
                  ? `+${marginPercentage}% Net Profit Margin on sales revenue` 
                  : `${marginPercentage}% Deficit (restock intake exceeds sales)`}
              </p>
            </div>

          </div>

          {/* Cash Flow Channel Breakdown */}
          <div style={{ background: 'var(--bg-surface)', padding: '20px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>CASH SALES LEDGER</span>
              <span style={{ color: '#fff', fontWeight: '700', fontSize: '1.1rem' }}>₹{cashSales.toFixed(2)}</span>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-color)', height: '30px' }}></div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>DIGITAL / UPI / CARD SALES</span>
              <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.1rem' }}>₹{digitalSales.toFixed(2)}</span>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-color)', height: '30px' }}></div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>CREDIT BOOK ACCOUNT</span>
              <span style={{ color: '#f59e0b', fontWeight: '700', fontSize: '1.1rem' }}>₹{creditSales.toFixed(2)}</span>
            </div>
          </div>

          {/* Search Toolbar for Ledgers */}
          <div style={{ display: 'flex', gap: '16px', background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <input 
                type="text" 
                placeholder="Search audit ledgers by invoice number, customer name, PO number or supplier..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 16px', background: 'rgba(21, 35, 62, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              />
            </div>
          </div>

          {/* Dual Ledgers Table Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            
            {/* Sales Ledger */}
            <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><i className="fa-solid fa-receipt text-emerald" style={{ marginRight: '8px' }}></i> Sales Revenue Audit</span>
                <span className="badge success">{searchFilteredSales.length} Entries</span>
              </h3>
              <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px' }}>Invoice</th>
                    <th style={{ padding: '8px' }}>Date</th>
                    <th style={{ padding: '8px' }}>Customer</th>
                    <th style={{ padding: '8px' }}>Payment</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {searchFilteredSales.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No sales records found for period.</td>
                    </tr>
                  ) : (
                    searchFilteredSales.slice(0, 20).map(s => (
                      <tr key={s._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '8px', color: 'var(--primary)', fontWeight: '600' }}>{s.invoiceNo}</td>
                        <td style={{ padding: '8px', color: 'var(--text-dim)', fontSize: '0.78rem' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '8px', color: '#fff' }}>{s.customerName}</td>
                        <td style={{ padding: '8px', color: 'var(--text-dim)' }}>{s.paymentMethod}</td>
                        <td style={{ padding: '8px', color: '#10b981', fontWeight: '700', textAlign: 'right' }}>₹{s.grandTotal.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Restock Purchase Ledger */}
            <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><i className="fa-solid fa-truck-ramp-box text-rose" style={{ marginRight: '8px' }}></i> Wholesale Purchases Audit</span>
                <span className="badge danger">{searchFilteredPurchases.length} Orders</span>
              </h3>
              <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px' }}>PO Number</th>
                    <th style={{ padding: '8px' }}>Date</th>
                    <th style={{ padding: '8px' }}>Supplier</th>
                    <th style={{ padding: '8px' }}>Status</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {searchFilteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No wholesale purchase records found.</td>
                    </tr>
                  ) : (
                    searchFilteredPurchases.slice(0, 20).map(p => (
                      <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '8px', color: 'var(--primary)', fontWeight: '600' }}>{p.purchaseNo}</td>
                        <td style={{ padding: '8px', color: 'var(--text-dim)', fontSize: '0.78rem' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '8px', color: '#fff' }}>{p.supplierName}</td>
                        <td style={{ padding: '8px' }}>
                          <span className="badge success" style={{ padding: '1px 6px', fontSize: '0.7rem' }}>{p.paymentStatus}</span>
                        </td>
                        <td style={{ padding: '8px', color: 'var(--rose)', fontWeight: '700', textAlign: 'right' }}>₹{p.totalAmount.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Reports;

