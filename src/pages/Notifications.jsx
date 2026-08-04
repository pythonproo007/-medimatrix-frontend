import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/notifications');
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await api.put('/api/notifications/mark-read');
      if (res.success) {
        loadNotifications();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff' }}>Notification & Alert Center</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Monitor system alerts, low stock alarms, expiry triggers and discount broadcasts</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="badge info" style={{ padding: '10px 20px', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
            <i className="fa-solid fa-check-double"></i> Mark All as Read
          </button>
        )}
      </div>

      <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            No system notifications generated.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {notifications.map((notif) => {
              let typeClass = 'info';
              let icon = 'fa-circle-info';

              if (notif.type === 'low_stock') {
                typeClass = 'danger';
                icon = 'fa-triangle-exclamation';
              } else if (notif.type === 'expiry_alert') {
                typeClass = 'danger';
                icon = 'fa-calendar-xmark';
              } else if (notif.type === 'discount_offer') {
                typeClass = 'success';
                icon = 'fa-bullhorn';
              } else if (notif.type === 'prescription_dispensed') {
                typeClass = 'info';
                icon = 'fa-file-prescription';
              }

              return (
                <div 
                  key={notif._id} 
                  style={{ 
                    background: notif.isRead ? 'rgba(255,255,255,0.01)' : 'rgba(6, 182, 212, 0.04)', 
                    border: notif.isRead ? '1px solid var(--border-color)' : '1px solid rgba(6, 182, 212, 0.25)', 
                    padding: '16px 20px', 
                    borderRadius: 'var(--radius-sm)', 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '16px',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    background: `var(--${typeClass}-light)`, 
                    color: `var(--${typeClass})`,
                    fontSize: '1.1rem'
                  }}>
                    <i className={`fa-solid ${icon}`}></i>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ color: '#fff', fontSize: '0.92rem', fontWeight: '600' }}>
                        {notif.title}
                        {!notif.isRead && (
                          <span className="badge danger" style={{ marginLeft: '8px', padding: '1px 6px', fontSize: '0.68rem' }}>NEW</span>
                        )}
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px', lineHeight: '1.4' }}>
                      {notif.message}
                    </p>
                    {notif.recipientPhone && (
                      <div style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        <i className="fa-solid fa-share-nodes"></i> Broadcast sent to: {notif.recipientName} ({notif.recipientPhone})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Notifications;
