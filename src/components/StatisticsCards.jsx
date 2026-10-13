import React from 'react';
import { Users, UserCheck, UserX, Activity } from 'lucide-react';

const StatisticsCards = ({ users, total, loading }) => {
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const inactiveUsers = users.length - activeUsers;
  const maleUsers = users.filter(u => u.gender === 'male').length;
  const femaleUsers = users.filter(u => u.gender === 'female').length;
  const engagementPct = users.length ? Math.round((activeUsers / users.length) * 100) : 0;

  const stats = [
    {
      title: 'Total Users',
      value: loading ? '…' : total,
      sub: 'From API',
      icon: <Users size={22} />,
      color: 'var(--accent-primary)',
    },
    {
      title: 'Active Users',
      value: loading ? '…' : activeUsers,
      sub: `${engagementPct}% of this page`,
      icon: <UserCheck size={22} />,
      color: 'var(--accent-success)',
    },
    {
      title: 'Inactive Users',
      value: loading ? '…' : inactiveUsers,
      sub: 'On this page',
      icon: <UserX size={22} />,
      color: 'var(--accent-danger)',
    },
    {
      title: 'Gender Split',
      value: loading ? '…' : `${maleUsers}M / ${femaleUsers}F`,
      sub: 'Male / Female (this page)',
      icon: <Activity size={22} />,
      color: 'var(--accent-info)',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="glass-panel"
          style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}
        >
          <div style={{
            backgroundColor: `${stat.color}22`,
            color: stat.color,
            padding: '0.875rem',
            borderRadius: 'var(--radius-full)',
            flexShrink: 0,
          }}>
            {stat.icon}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.8rem', marginBottom: '0.2rem', color: 'var(--text-secondary)' }}>{stat.title}</p>
            <h2 style={{ margin: 0, fontSize: '1.6rem', lineHeight: 1 }}>{stat.value}</h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{stat.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;
