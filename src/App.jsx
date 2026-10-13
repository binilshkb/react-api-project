import React from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'

function App() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <Dashboard />
    </div>
  )
}

export default App
