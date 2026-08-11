import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboardStats } from '../hooks/useDashboard';

const Sidebar = ({ stats: propStats }) => {
  const { user, logout, shopName } = useAuth();
  const navigate = useNavigate();

  const { data: queryStats } = useDashboardStats();
  const stats = queryStats || propStats;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const alertBadgeCount = stats ? (stats.lowStockCount || 0) + (stats.expiringSoonCount || 0) : 0;
  const rxBadgeCount = stats ? stats.pendingPrescriptions || 0 : 0;
  const deliveryBadgeCount = stats ? stats.pendingDeliveriesCount || 0 : 0;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">
          <i className="fa-solid fa-prescription"></i>
        </div>
        <div className="logo-text">
          <h2 style={{ fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shopName}</h2>
          <p>Pharmacy Pro OS</p>
        </div>
      </div>

      <nav className="nav-menu">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
          <i className="fa-solid fa-chart-line"></i>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/sales" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-cash-register"></i>
          <span>POS / Billing</span>
        </NavLink>

        <NavLink to="/medicines" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-pills"></i>
          <span>Inventory / Meds</span>
        </NavLink>

        <NavLink to="/prescriptions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-file-prescription"></i>
          <span>Prescriptions</span>
          {rxBadgeCount > 0 && <span className="badge danger" style={{ marginLeft: 'auto', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{rxBadgeCount}</span>}
        </NavLink>

        <NavLink to="/home-delivery" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-truck"></i>
          <span>Home Delivery</span>
          {deliveryBadgeCount > 0 && <span className="badge warning" style={{ marginLeft: 'auto', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{deliveryBadgeCount}</span>}
        </NavLink>

        <NavLink to="/customers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-users"></i>
          <span>Customers</span>
        </NavLink>

        <NavLink to="/stock-details" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-boxes-stacked"></i>
          <span>Stock movement</span>
        </NavLink>

        <NavLink to="/stock-in-out" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-circle-arrow-down"></i>
          <span>Adjust Stock</span>
        </NavLink>

        <NavLink to="/purchase-details" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-cart-flatbed"></i>
          <span>Purchases</span>
        </NavLink>

        <NavLink to="/alternative-drugs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-shuffle"></i>
          <span>Alternates</span>
        </NavLink>

        <NavLink to="/discount-offers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-tags"></i>
          <span>Discount Offers</span>
        </NavLink>

        <NavLink to="/medicine-types" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-tablets"></i>
          <span>Medicine Types</span>
        </NavLink>

        <NavLink to="/low-stock" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>Low Stock Logs</span>
          {stats?.lowStockCount > 0 && <span className="badge danger" style={{ marginLeft: 'auto', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{stats.lowStockCount}</span>}
        </NavLink>

        <NavLink to="/expiry-medicines" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-calendar-xmark"></i>
          <span>Expiry Alerts</span>
          {stats?.expiringSoonCount > 0 && <span className="badge warning" style={{ marginLeft: 'auto', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{stats.expiringSoonCount}</span>}
        </NavLink>

        <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-chart-pie"></i>
          <span>Reports / Audit</span>
        </NavLink>

        <NavLink to="/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-bell"></i>
          <span>Notifications</span>
          {alertBadgeCount > 0 && <span className="badge info" style={{ marginLeft: 'auto', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{alertBadgeCount}</span>}
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="status-indicator online"></div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Logged in as <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{user?.role}</strong>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-pos-checkout btn-danger" style={{ width: '100%', padding: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
            <i className="fa-solid fa-right-from-bracket"></i> Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
