import React, { useState } from 'react';
import { LayoutDashboard, Users, Settings, LogOut, Hexagon, Menu, X, Bell } from 'lucide-react';

const Sidebar = ({ activePage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard',       label: 'Dashboard',        icon: <LayoutDashboard size={20} /> },
    { id: 'user-management', label: 'User Management',  icon: <Users size={20} /> },
    { id: 'settings',        label: 'Settings',         icon: <Settings size={20} /> },
  ];

  const handleNav = (id) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Hexagon className="sidebar-logo-icon" size={32} />
          <h2 style={{ margin: 0, fontSize: '1.25rem', letterSpacing: '0.5px' }}>UserHub</h2>
        </div>
        <div className="mobile-header-actions">
          <button className="btn-icon mobile-only-icon" style={{ padding: 0 }}>
            <Bell size={20} />
          </button>
          <div className="avatar mobile-only-icon" style={{ width: '28px', height: '28px', fontSize: '0.75rem', cursor: 'pointer' }}>A</div>
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <nav className={`sidebar-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => handleNav(item.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={`sidebar-footer ${isMobileMenuOpen ? 'open' : ''}`}>
        <button className="nav-item" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-danger)', width: '100%', textAlign: 'left' }}>
          <LogOut size={20} />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
