import React, { useState } from 'react';
import StatisticsCards from './StatisticsCards';
import UserTable from './UserTable';
import ActivityLog from './ActivityLog';
import UserAnalyticsChart from './UserAnalyticsChart';
import UserFormModal from './UserFormModal';
import useUsers from '../hooks/useUsers';
import { Bell, RefreshCw, AlertCircle } from 'lucide-react';

// Build gender-based growth chart data from the loaded users
const buildChartData = (users) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, i) => ({
    month,
    male: users.filter(u => u.gender === 'male' && (u.id % 12) <= i).length,
    female: users.filter(u => u.gender === 'female' && (u.id % 12) <= i).length,
  }));
};

const Dashboard = () => {
  const {
    users: apiUsers,
    total: apiTotal,
    loading,
    error,
    page,
    totalPages,
    goToPage,
    search,
    searchQuery,
    refetch,
  } = useUsers();

  // Local additions/deletions layered on top of the API data
  const [localAdded, setLocalAdded] = useState([]);     // users created via Add User modal
  const [deletedIds, setDeletedIds] = useState(new Set()); // ids removed from view

  // Merge: locally added users appear at the top; deleted ones are hidden
  const users = [
    ...localAdded,
    ...apiUsers.filter(u => !deletedIds.has(u.id)),
  ];
  const total = apiTotal + localAdded.length - [...deletedIds].filter(id => typeof id === 'number').length;

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null = Add mode, user obj = Edit mode

  const [activities, setActivities] = useState([
    { id: 1, user: 'System', action: 'Connected to dummyjson.com API', time: new Date().toISOString() },
  ]);

  /* ── Activity Log ── */
  const logActivity = (action) => {
    const newActivity = {
      id: Date.now(),
      user: 'Admin',
      action,
      time: new Date().toISOString(),
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 15));
  };

  /* ── Refresh ── */
  const handleRefresh = () => {
    refetch();
    logActivity('Refreshed user list from API');
  };

  /* ── Add User ── */
  const handleSaveUser = (savedUser) => {
    if (editingUser) {
      // Edit: update the user in localAdded or mark as overridden in API list
      const existsInLocal = localAdded.some(u => u.id === savedUser.id);
      if (existsInLocal) {
        setLocalAdded(prev => prev.map(u => u.id === savedUser.id ? savedUser : u));
      } else {
        // API user edited — remove from API view, push into localAdded as updated
        setDeletedIds(prev => new Set([...prev, savedUser.id]));
        setLocalAdded(prev => [savedUser, ...prev]);
      }
      logActivity(`Updated user ${savedUser.name}`);
    } else {
      setLocalAdded(prev => [savedUser, ...prev]);
      logActivity(`Created new user ${savedUser.name}`);
    }
    setEditingUser(null);
    setIsFormModalOpen(false);
  };

  /* ── Edit User ── */
  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsFormModalOpen(true);
  };

  /* ── Delete User ── */
  const handleDeleteUser = (user) => {
    if (user.isLocal) {
      // Remove from localAdded
      setLocalAdded(prev => prev.filter(u => u.id !== user.id));
    } else {
      // Hide from API list
      setDeletedIds(prev => new Set([...prev, user.id]));
    }
    logActivity(`Deleted user ${user.name}`);
  };

  const chartData = buildChartData(users);

  return (
    <div className="main-content animate-fade-in">

      {/* ── Top Header ── */}
      <header className="top-header">
        <div>
          <h1 style={{ margin: 0 }}>User Dashboard</h1>
          <p style={{ margin: 0, marginTop: '0.25rem' }}>
            Live data from{' '}
            <a
              href="https://dummyjson.com/users"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}
            >
              dummyjson.com/users
            </a>
            {!loading && ` — ${apiTotal} users total`}
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn-icon hide-on-mobile"
            onClick={handleRefresh}
            title="Refresh data"
          >
            <RefreshCw size={20} style={{ animation: loading ? 'spin 1s linear infinite' : 'none', color: loading ? 'var(--accent-primary)' : undefined }} />
          </button>
          <button className="btn-icon hide-on-mobile">
            <Bell size={20} />
          </button>
          <div className="user-profile-btn hide-on-mobile">
            <div className="avatar">A</div>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Admin User</span>
          </div>
        </div>
      </header>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: 'var(--accent-danger)',
        }}>
          <AlertCircle size={18} />
          <span>Failed to load users: <strong>{error}</strong></span>
          <button className="btn btn-outline" style={{ marginLeft: 'auto' }} onClick={refetch}>
            Retry
          </button>
        </div>
      )}

      {/* ── Stats ── */}
      <StatisticsCards users={users} total={total} loading={loading} />

      {/* ── Chart ── */}
      <div style={{ marginBottom: '1.5rem', height: '350px' }}>
        <UserAnalyticsChart data={chartData} />
      </div>

      {/* ── Table + Activity ── */}
      <div className="dashboard-grid">
        <div style={{ height: '100%' }}>
          <UserTable
            users={users}
            loading={loading}
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={goToPage}
            onSearch={search}
            searchQuery={searchQuery}
            onLog={logActivity}
            onAddUser={() => { setEditingUser(null); setIsFormModalOpen(true); }}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        </div>
        <div style={{ height: '100%' }}>
          <ActivityLog activities={activities} />
        </div>
      </div>

      {/* ── Add / Edit User Modal ── */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => { setIsFormModalOpen(false); setEditingUser(null); }}
        onSave={handleSaveUser}
        editUser={editingUser}
      />

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Dashboard;
