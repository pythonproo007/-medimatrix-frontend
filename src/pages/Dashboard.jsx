import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../hooks/useDashboard';
import { usePrescriptions } from '../hooks/usePrescriptions';
import { useMedicines } from '../hooks/useMedicines';

const Dashboard = ({ setStatsData }) => {
  const navigate = useNavigate();

  const { data: statsData, isError: statsError } = useDashboardStats();
  const { data: prescriptionsData } = usePrescriptions();
  const { data: lowStockMedsData } = useMedicines({ filterAlert: 'low_stock' });

  const stats = statsData || {
    totalMedicines: 0,
    lowStockCount: 0,
    expiringSoonCount: 0,
    expiredCount: 0,
    totalCustomers: 0,
    regularCustomers: 0,
    pendingPrescriptions: 0,
    todaySalesCount: 0,
    todaySalesRevenue: 0,
    totalPurchasesCount: 0,
    pendingDeliveriesCount: 0,
    totalStockLogsCount: 0
  };

  const dbConnected = !statsError;
  const prescriptions = (prescriptionsData || []).filter(r => r.status === 'Pending').slice(0, 5);
  const lowStockMeds = (lowStockMedsData || []).slice(0, 5);

  useEffect(() => {
    if (statsData && setStatsData) {
      setStatsData(statsData);
    }
  }, [statsData, setStatsData]);


  const alertTotal = (stats.lowStockCount || 0) + (stats.expiringSoonCount || 0);

  const cardStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    background: 'var(--bg-card)',
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out'
  };

  return (
    <div className="view-content" style={{ padding: '32px' }}>
      
      {/* Urgent Alert Banner */}
      {alertTotal > 0 && (
        <div id="urgent-alert-banner" className="alert-banner" style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid var(--rose)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '30px' }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '1.5rem', color: 'var(--rose)' }}></i>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: '700', color: '#fff' }}>Stock Alerts Triggered:</span>
            <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>
              {stats.lowStockCount} medicines low in stock, {stats.expiringSoonCount} expiring soon ({stats.expiredCount} already expired).
            </span>
          </div>
          <button onClick={() => navigate('/low-stock')} className="badge danger" style={{ border: 'none', cursor: 'pointer', padding: '8px 16px', fontSize: '0.8rem', fontWeight: '600' }}>
            View Low Stock Panel &rarr;
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        <div 
          className="stat-card" 
          onClick={() => navigate('/medicines')}
          title="Click to shift to Medicine Stock Inventory"
          style={cardStyle}
        >
          <div className="stat-icon" style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '1.4rem' }}>
            <i className="fa-solid fa-pills"></i>
          </div>
          <div>
            <h3 id="kpi-total-meds" style={{ fontSize: '1.8rem', fontWeight: '700', color: '#fff' }}>{stats.totalMedicines}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Medicines Registered &rarr;</p>
          </div>
        </div>

        <div 
          className="stat-card" 
          onClick={() => navigate('/low-stock')}
          title="Click to shift to Low Stock Alarms Panel"
          style={{ ...cardStyle, borderColor: stats.lowStockCount > 0 ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-color)' }}
        >
          <div className="stat-icon" style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--rose-light)', color: 'var(--rose)', fontSize: '1.4rem' }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <h3 id="kpi-low-stock" style={{ fontSize: '1.8rem', fontWeight: '700', color: '#fff' }}>{stats.lowStockCount}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Low Stock Products &rarr;</p>
          </div>
        </div>

        <div 
          className="stat-card" 
          onClick={() => navigate('/expiry-medicines')}
          title="Click to shift to Expiry Warnings"
          style={cardStyle}
        >
          <div className="stat-icon" style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--amber-light)', color: 'var(--amber)', fontSize: '1.4rem' }}>
            <i className="fa-solid fa-hourglass-half"></i>
          </div>
          <div>
            <h3 id="kpi-expiring-soon" style={{ fontSize: '1.8rem', fontWeight: '700', color: '#fff' }}>{stats.expiringSoonCount}</h3>
            <p id="kpi-expired-sub" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{stats.expiredCount} Expired &rarr;</p>
          </div>
        </div>

        <div 
          className="stat-card" 
          onClick={() => navigate('/sales')}
          title="Click to shift to POS Sales Terminal"
          style={cardStyle}
        >
          <div className="stat-icon" style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--emerald-light)', color: 'var(--emerald)', fontSize: '1.4rem' }}>
            <i className="fa-solid fa-circle-dollar-to-slot"></i>
          </div>
          <div>
            <h3 id="kpi-today-sales" style={{ fontSize: '1.8rem', fontWeight: '700', color: '#fff' }}>₹{(stats.todaySalesRevenue || 0).toFixed(2)}</h3>
            <p id="kpi-today-count" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{stats.todaySalesCount} Sales Today &rarr;</p>
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        
        {/* Low Stock Table Column */}
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff' }}>Low Stock Warning Panel</h3>
            <button onClick={() => navigate('/low-stock')} className="badge danger" style={{ border: 'none', cursor: 'pointer', padding: '4px 10px' }}>
              {stats.lowStockCount} Items &rarr;
            </button>
          </div>
          
          <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px 8px' }}>Medicine Name</th>
                <th style={{ padding: '12px 8px' }}>Category</th>
                <th style={{ padding: '12px 8px' }}>Quantity</th>
                <th style={{ padding: '12px 8px' }}>Location</th>
                <th style={{ padding: '12px 8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStockMeds.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '24px 8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <i className="fa-solid fa-circle-check text-emerald" style={{ marginRight: '8px' }}></i> All stocks healthy. No low stock alert.
                  </td>
                </tr>
              ) : (
                lowStockMeds.map((med) => (
                  <tr key={med._id} onClick={() => navigate('/low-stock')} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.88rem', cursor: 'pointer' }}>
                    <td style={{ padding: '12px 8px', color: '#fff', fontWeight: '500' }}>{med.name}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{med.category}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--rose)', fontWeight: '600' }}>{med.quantity}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-dim)' }}>{med.rackLocation}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span className="badge danger">Replenish</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pending Prescriptions Column */}
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff' }}>Pending Rx Logs</h3>
            <button onClick={() => navigate('/prescriptions')} className="badge warning" style={{ border: 'none', cursor: 'pointer', padding: '4px 10px' }}>
              {stats.pendingPrescriptions} Pending &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {prescriptions.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '24px', color: 'var(--text-muted)' }}>
                <i className="fa-regular fa-clipboard" style={{ fontSize: '2.5rem', marginBottom: '10px' }}></i>
                <span style={{ fontSize: '0.85rem' }}>No pending prescriptions</span>
              </div>
            ) : (
              prescriptions.map((rx) => (
                <div key={rx._id} onClick={() => navigate('/prescriptions')} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <h5 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>{rx.patientName}</h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No: {rx.prescriptionNo} | Dr. {rx.doctorName}</p>
                  </div>
                  <span className="badge info">Dispense</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', padding: '15px 24px', background: 'rgba(11,21,40,0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: dbConnected ? 'var(--emerald)' : 'var(--rose)', boxShadow: dbConnected ? '0 0 10px var(--emerald)' : '0 0 10px var(--rose)' }}></div>
          <span style={{ fontSize: '0.85rem', color: '#fff' }}>
            {dbConnected ? 'MongoDB Server Connection Online' : 'Database disconnected. Please check Mongo service.'}
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>API stats auto-refreshed every 20s</span>
      </div>

    </div>
  );
};

export default Dashboard;
