import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import UserManagement from './pages/UserManagement'

const PAGES = {
  'dashboard':       <Dashboard />,
  'user-management': <UserManagement />,
  'settings': (
    <div className="main-content animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Settings</h2>
        <p>Settings page coming soon.</p>
      </div>
    </div>
  ),
}

function App() {
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <div className="dashboard-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      {PAGES[activePage] ?? PAGES['dashboard']}
    </div>
  )
}

export default App
