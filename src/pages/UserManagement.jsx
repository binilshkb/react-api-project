import React, { useState, useMemo } from 'react';
import {
  Users, UserCheck, UserX, Shield, Search, Filter, RefreshCw,
  Pencil, Trash2, Eye, UserPlus, ChevronLeft, ChevronRight,
  Download, MoreHorizontal, CheckSquare, Square, X, AlertCircle,
  SortAsc, SortDesc, Mail, Phone, Building2, MapPin,
} from 'lucide-react';
import useUsers from '../hooks/useUsers';
import UserFormModal from '../components/UserFormModal';

/* ─── constants ─────────────────────────────────────── */
const PAGE_SIZE = 8;
const ROLE_COLORS = {
  Admin:     { bg: 'rgba(99,102,241,0.18)',  color: '#818cf8' },
  Moderator: { bg: 'rgba(14,165,233,0.18)',  color: '#38bdf8' },
  User:      { bg: 'rgba(16,185,129,0.18)',  color: '#34d399' },
};
const STATUS_COLORS = {
  Active:   { bg: 'rgba(16,185,129,0.15)',  color: '#10b981' },
  Inactive: { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
};

/* ─── helpers ───────────────────────────────────────── */
const Badge = ({ label, colors }) => (
  <span style={{
    padding: '0.2rem 0.65rem', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 600,
    background: colors.bg, color: colors.color, whiteSpace: 'nowrap',
  }}>{label}</span>
);

const Avatar = ({ user, size = 36 }) => (
  <div style={{ position: 'relative', flexShrink: 0 }}>
    <img
      src={user.image}
      alt={user.name}
      onError={e => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
    />
    <div style={{
      display: 'none', width: size, height: size, borderRadius: '50%',
      background: user.gender === 'female'
        ? 'linear-gradient(135deg,#f472b6,#a855f7)'
        : 'linear-gradient(135deg,#6366f1,#3b82f6)',
      alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: 'white',
    }}>
      {user.name?.[0]?.toUpperCase()}
    </div>
    {user.isLocal && (
      <span style={{
        position: 'absolute', bottom: 0, right: 0,
        width: 10, height: 10, borderRadius: '50%',
        background: '#10b981', border: '2px solid var(--bg-primary)',
      }} title="Locally added" />
    )}
  </div>
);

/* ─── Main Component ────────────────────────────────── */
const UserManagement = () => {
  /* API data */
  const {
    users: apiUsers, total: apiTotal, loading, error,
    page: apiPage, totalPages: apiTotalPages, goToPage: apiGoToPage,
    search: apiSearch, searchQuery, refetch,
  } = useUsers();

  /* Local state */
  const [localAdded, setLocalAdded] = useState([]);
  const [deletedIds, setDeletedIds] = useState(new Set());

  /* Merge */
  const allUsers = useMemo(() => [
    ...localAdded,
    ...apiUsers.filter(u => !deletedIds.has(u.id)),
  ], [localAdded, apiUsers, deletedIds]);

  /* Filters */
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  /* Pagination (client-side for local filters) */
  const [localPage, setLocalPage] = useState(0);

  /* Selection */
  const [selected, setSelected] = useState(new Set());

  /* Modals */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // user to delete

  /* ── Filter / sort locally added; API data is already filtered server-side ── */
  const filtered = useMemo(() => {
    let list = [...allUsers];
    if (roleFilter !== 'All') list = list.filter(u => u.role === roleFilter);
    if (statusFilter !== 'All') list = list.filter(u => u.status === statusFilter);
    // sort
    list.sort((a, b) => {
      let av = (a[sortBy] || '').toString().toLowerCase();
      let bv = (b[sortBy] || '').toString().toLowerCase();
      if (sortBy === 'age') { av = Number(a.age); bv = Number(b.age); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [allUsers, roleFilter, statusFilter, sortBy, sortDir]);

  const totalFiltered = filtered.length;
  const pageCount = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const safePage = Math.min(localPage, pageCount - 1);
  const pageUsers = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  /* ── Stats ── */
  const activeCount   = allUsers.filter(u => u.status === 'Active').length;
  const inactiveCount = allUsers.filter(u => u.status === 'Inactive').length;
  const adminCount    = allUsers.filter(u => u.role === 'Admin').length;
  const totalCount    = apiTotal + localAdded.length
    - [...deletedIds].filter(id => typeof id === 'number').length;

  /* ── Handlers ── */
  const handleSearch = (q) => {
    setLocalSearch(q);
    apiSearch(q);
    setLocalPage(0);
  };

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <SortAsc size={13} style={{ opacity: 0.3 }} />;
    return sortDir === 'asc' ? <SortAsc size={13} style={{ color: 'var(--accent-primary)' }} /> : <SortDesc size={13} style={{ color: 'var(--accent-primary)' }} />;
  };

  const openAdd  = () => { setEditingUser(null); setIsFormOpen(true); };
  const openEdit = (u) => { setDetailUser(null); setEditingUser(u); setIsFormOpen(true); };

  const handleSave = (savedUser) => {
    if (editingUser) {
      const inLocal = localAdded.some(u => u.id === savedUser.id);
      if (inLocal) {
        setLocalAdded(prev => prev.map(u => u.id === savedUser.id ? savedUser : u));
      } else {
        setDeletedIds(prev => new Set([...prev, savedUser.id]));
        setLocalAdded(prev => [savedUser, ...prev]);
      }
    } else {
      setLocalAdded(prev => [savedUser, ...prev]);
    }
    setEditingUser(null);
    setIsFormOpen(false);
  };

  const confirmAndDelete = (user) => setConfirmDelete(user);
  const doDelete = () => {
    const user = confirmDelete;
    if (user.isLocal) {
      setLocalAdded(prev => prev.filter(u => u.id !== user.id));
    } else {
      setDeletedIds(prev => new Set([...prev, user.id]));
    }
    setSelected(prev => { const s = new Set(prev); s.delete(user.id); return s; });
    setConfirmDelete(null);
  };

  const bulkDelete = () => {
    selected.forEach(id => {
      const user = allUsers.find(u => String(u.id) === String(id));
      if (!user) return;
      if (user.isLocal) setLocalAdded(prev => prev.filter(u => String(u.id) !== String(id)));
      else setDeletedIds(prev => new Set([...prev, user.id]));
    });
    setSelected(new Set());
  };

  /* Selection helpers */
  const isAllSelected = pageUsers.length > 0 && pageUsers.every(u => selected.has(String(u.id)));
  const toggleAll = () => {
    if (isAllSelected) setSelected(prev => { const s = new Set(prev); pageUsers.forEach(u => s.delete(String(u.id))); return s; });
    else setSelected(prev => { const s = new Set(prev); pageUsers.forEach(u => s.add(String(u.id))); return s; });
  };
  const toggleOne = (id) => setSelected(prev => {
    const s = new Set(prev);
    s.has(String(id)) ? s.delete(String(id)) : s.add(String(id));
    return s;
  });

  /* Export CSV */
  const exportCSV = () => {
    const rows = [
      ['Name', 'Email', 'Phone', 'Role', 'Status', 'Department', 'City', 'Country'],
      ...filtered.map(u => [u.name, u.email, u.phone, u.role, u.status, u.department, u.city, u.country]),
    ];
    const csv = rows.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'users.csv';
    a.click();
  };

  /* ── Render ── */
  return (
    <div className="main-content animate-fade-in">

      {/* ── Page Header ── */}
      <header className="top-header">
        <div>
          <h1 style={{ margin: 0 }}>User Management</h1>
          <p style={{ margin: 0, marginTop: '0.25rem' }}>
            Manage your team members — add, edit, delete and filter
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-icon hide-on-mobile" onClick={() => refetch()} title="Refresh">
            <RefreshCw size={20} style={{ animation: loading ? 'spin 1s linear infinite' : 'none', color: loading ? 'var(--accent-primary)' : undefined }} />
          </button>
          <button className="btn btn-outline hide-on-mobile" onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={16} /> Add User
          </button>
        </div>
      </header>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--accent-danger)', marginBottom: '1rem' }}>
          <AlertCircle size={18} />
          <span>Failed to load users: <strong>{error}</strong></span>
          <button className="btn btn-outline" style={{ marginLeft: 'auto' }} onClick={refetch}>Retry</button>
        </div>
      )}

      {/* ── Stats Bar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { icon: <Users size={20} />, label: 'Total Users', value: totalCount, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
          { icon: <UserCheck size={20} />, label: 'Active', value: activeCount, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
          { icon: <UserX size={20} />, label: 'Inactive', value: inactiveCount, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
          { icon: <Shield size={20} />, label: 'Admins', value: adminCount, color: '#a78bfa', bg: 'rgba(139,92,246,0.12)' },
        ].map(s => (
          <div key={s.label} className="glass-panel" style={{ padding: '1.1rem 1.4rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                {loading ? '—' : s.value}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table Card ── */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
            <input
              className="input-control"
              style={{ paddingLeft: 32, margin: 0 }}
              placeholder="Search by name, email, username…"
              value={localSearch}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>

          {/* Role filter */}
          <select
            className="input-control"
            style={{ width: 'auto', minWidth: 130, margin: 0 }}
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setLocalPage(0); }}
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Moderator">Moderator</option>
            <option value="User">User</option>
          </select>

          {/* Status filter */}
          <select
            className="input-control"
            style={{ width: 'auto', minWidth: 130, margin: 0 }}
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setLocalPage(0); }}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Clear filters */}
          {(roleFilter !== 'All' || statusFilter !== 'All' || localSearch) && (
            <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
              onClick={() => { setRoleFilter('All'); setStatusFilter('All'); handleSearch(''); }}>
              <X size={14} /> Clear
            </button>
          )}

          {/* Bulk delete */}
          {selected.size > 0 && (
            <button
              className="btn btn-outline"
              onClick={bulkDelete}
              style={{ color: 'var(--accent-danger)', borderColor: 'rgba(239,68,68,0.35)', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
            >
              <Trash2 size={14} /> Delete {selected.size} selected
            </button>
          )}

          <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            {loading ? 'Loading…' : `${totalFiltered} of ${totalCount} users`}
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={th()}>
                  <button onClick={toggleAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                    {isAllSelected ? <CheckSquare size={16} style={{ color: 'var(--accent-primary)' }} /> : <Square size={16} />}
                  </button>
                </th>
                {[
                  { label: 'User', col: 'name' },
                  { label: 'Contact', col: 'email' },
                  { label: 'Department', col: 'department' },
                  { label: 'Role', col: 'role' },
                  { label: 'Status', col: 'status' },
                  { label: 'Age', col: 'age' },
                ].map(({ label, col }) => (
                  <th key={col} style={th()} onClick={() => handleSort(col)}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', userSelect: 'none' }}>
                      {label} <SortIcon col={col} />
                    </span>
                  </th>
                ))}
                <th style={{ ...th(), textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && pageUsers.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 32, height: 32, border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Loading users…
                  </div>
                </td></tr>
              ) : pageUsers.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  No users match the current filters.
                </td></tr>
              ) : pageUsers.map(user => {
                const isSelected = selected.has(String(user.id));
                return (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(99,102,241,0.06)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => !isSelected && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Checkbox */}
                    <td style={td()}>
                      <button onClick={() => toggleOne(user.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                        {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </td>

                    {/* User */}
                    <td style={td()}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Avatar user={user} size={36} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{user.name}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>@{user.username}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td style={td()}>
                      <div style={{ fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-primary)' }}>
                          <Mail size={12} style={{ opacity: 0.5 }} /> {user.email}
                        </div>
                        {user.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                            <Phone size={12} style={{ opacity: 0.5 }} /> {user.phone}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Department */}
                    <td style={td()}>
                      <div style={{ fontSize: '0.82rem' }}>
                        {user.department
                          ? <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-primary)' }}><Building2 size={12} style={{ opacity: 0.5 }} /> {user.department}</div>
                          : <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>—</span>}
                        {user.city && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', marginTop: '0.15rem', fontSize: '0.75rem' }}>
                            <MapPin size={11} style={{ opacity: 0.5 }} /> {user.city}, {user.country}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Role */}
                    <td style={td()}>
                      <Badge label={user.role} colors={ROLE_COLORS[user.role] || ROLE_COLORS['User']} />
                    </td>

                    {/* Status */}
                    <td style={td()}>
                      <Badge label={user.status} colors={STATUS_COLORS[user.status] || STATUS_COLORS['Active']} />
                    </td>

                    {/* Age */}
                    <td style={{ ...td(), color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{user.age}</td>

                    {/* Actions */}
                    <td style={{ ...td(), textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.2rem' }}>
                        <button className="btn-icon" title="View" onClick={() => setDetailUser(user)}>
                          <Eye size={15} />
                        </button>
                        <button className="btn-icon" title="Edit" onClick={() => openEdit(user)} style={{ color: 'var(--accent-primary)' }}>
                          <Pencil size={15} />
                        </button>
                        <button className="btn-icon" title="Delete" onClick={() => confirmAndDelete(user)} style={{ color: 'var(--accent-danger)' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Page {safePage + 1} of {pageCount} &nbsp;·&nbsp; {totalFiltered} results
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button className="btn-icon" disabled={safePage === 0} onClick={() => setLocalPage(p => Math.max(0, p - 1))}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
              const start = Math.max(0, Math.min(safePage - 2, pageCount - 5));
              const p = start + i;
              return (
                <button
                  key={p}
                  onClick={() => setLocalPage(p)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
                    background: p === safePage ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                    color: p === safePage ? 'white' : 'var(--text-secondary)',
                    transition: 'all 0.15s',
                  }}
                >{p + 1}</button>
              );
            })}
            <button className="btn-icon" disabled={safePage >= pageCount - 1} onClick={() => setLocalPage(p => Math.min(pageCount - 1, p + 1))}>
              <ChevronRight size={16} />
            </button>
          </div>
          {/* API pagination note */}
          {apiTotalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              API page:
              <button className="btn-icon" disabled={apiPage === 0} onClick={() => apiGoToPage(apiPage - 1)} style={{ width: 24, height: 24 }}>
                <ChevronLeft size={13} />
              </button>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{apiPage + 1}/{apiTotalPages}</span>
              <button className="btn-icon" disabled={apiPage >= apiTotalPages - 1} onClick={() => apiGoToPage(apiPage + 1)} style={{ width: 24, height: 24 }}>
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {detailUser && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setDetailUser(null)}>
          <div className="modal-content" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Avatar user={detailUser} size={52} />
                <div>
                  <h3 style={{ margin: 0 }}>{detailUser.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem' }}>@{detailUser.username} · {detailUser.email}</p>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setDetailUser(null)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              {[
                ['Role', detailUser.role], ['Status', detailUser.status],
                ['Gender', detailUser.gender], ['Age', detailUser.age],
                ['Phone', detailUser.phone], ['Blood Group', detailUser.bloodGroup],
                ['Department', detailUser.department], ['Job Title', detailUser.jobTitle],
                ['Company', detailUser.company], ['University', detailUser.university],
                ['City', detailUser.city], ['Country', detailUser.country],
              ].map(([k, v]) => v ? (
                <div key={k}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>{k}</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500 }}>{v}</div>
                </div>
              ) : null)}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => { setDetailUser(null); confirmAndDelete(detailUser); }} style={{ color: 'var(--accent-danger)', borderColor: 'rgba(239,68,68,0.3)' }}>
                <Trash2 size={14} /> Delete
              </button>
              <button className="btn btn-outline" onClick={() => { openEdit(detailUser); }} style={{ color: 'var(--accent-primary)', borderColor: 'rgba(99,102,241,0.3)' }}>
                <Pencil size={14} /> Edit
              </button>
              <button className="btn btn-primary" onClick={() => setDetailUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {confirmDelete && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal-content" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-danger)' }}>
                  <Trash2 size={18} />
                </div>
                <h3 style={{ margin: 0 }}>Delete User</h3>
              </div>
              <button className="btn-icon" onClick={() => setConfirmDelete(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem' }}>
                Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{confirmDelete.name}</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={doDelete} style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingUser(null); }}
        onSave={handleSave}
        editUser={editingUser}
      />

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
};

/* ─── style helpers ─────────────────────────────────── */
const th = () => ({
  padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem',
  fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
  color: 'var(--text-secondary)', whiteSpace: 'nowrap',
});
const td = () => ({
  padding: '0.75rem 1rem', verticalAlign: 'middle',
});

export default UserManagement;
