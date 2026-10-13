import React, { useState } from 'react';
import { LayoutDashboard, Users, Settings, LogOut, Hexagon, Menu, X, Bell } from 'lucide-react';

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Hexagon className="sidebar-logo-icon" size={32} />
          <h2 style={{ margin: 0, fontSize: '1.25rem', letterSpacing: '0.5px' }}>User management</h2>
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
        <a href="#" className="nav-item active">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </a>
        <a href="#" className="nav-item">
          <Users size={20} />
          <span>User Management</span>
        </a>
        <a href="#" className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </a>
      </nav>
      
      <div className={`sidebar-footer ${isMobileMenuOpen ? 'open' : ''}`}>
        <a href="#" className="nav-item" style={{ color: 'var(--accent-danger)' }}>
          <LogOut size={20} />
          <span>Log out</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
