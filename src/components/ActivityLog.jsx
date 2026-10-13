import React from 'react';
import { Clock } from 'lucide-react';

const ActivityLog = ({ activities }) => {
  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} /> Recent Activity
        </h3>
      </div>
      <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activities.map((activity, idx) => (
            <div key={activity.id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
              {/* Timeline line */}
              {idx !== activities.length - 1 && (
                <div style={{ 
                  position: 'absolute', 
                  left: '0.5rem', 
                  top: '1.5rem', 
                  bottom: '-1.5rem', 
                  width: '1px', 
                  backgroundColor: 'var(--border-color)',
                  zIndex: 0
                }} />
              )}
              
              <div style={{ 
                width: '1rem', 
                height: '1rem', 
                borderRadius: '50%', 
                backgroundColor: 'var(--accent-primary)',
                border: '2px solid var(--bg-primary)',
                marginTop: '0.25rem',
                zIndex: 1
              }} />
              
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activity.user}</span> {activity.action}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {new Date(activity.time).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
