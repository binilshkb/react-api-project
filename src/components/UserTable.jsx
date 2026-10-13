import React, { useState } from 'react';
import {
  Eye, Trash2, Pencil, Shield, User, Download, Search,
  ChevronLeft, ChevronRight, Phone, Building2, MapPin, Loader2, UserPlus
} from 'lucide-react';

const UserTable = ({
  users,
  loading,
  page,
  totalPages,
  total,
  onPageChange,
  onSearch,
  searchQuery,
  onLog,
  onAddUser,       // opens UserFormModal in Add mode
  onEditUser,      // opens UserFormModal in Edit mode
  onDeleteUser,    // removes user from local list
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // id of row being confirmed

  /* ── Search ── */
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') onSearch(localSearch);
  };
  const handleSearchBlur = () => {
    if (localSearch !== searchQuery) onSearch(localSearch);
  };

  /* ── Role helpers ── */
  const getRoleIcon = (role) => {
    if (role?.toLowerCase() === 'admin') return <Shield size={13} />;
    return <User size={13} />;
  };
  const getRoleBadgeStyle = (role) => {
    const r = role?.toLowerCase();
    if (r === 'admin') return { backgroundColor: 'rgba(139,92,246,0.15)', color: '#a78bfa' };
    if (r === 'moderator') return { backgroundColor: 'rgba(14,165,233,0.15)', color: '#38bdf8' };
    return { backgroundColor: 'rgba(148,163,184,0.15)', color: '#94a3b8' };
  };

  /* ── Export CSV ── */
  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Department', 'Company', 'City', 'Status'];
    const rows = users.map(u =>
      [u.id, `"${u.name}"`, `"${u.email}"`, `"${u.phone}"`, u.role, `"${u.department}"`, `"${u.company}"`, u.city, u.status].join(',')
    );
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'users_export.csv'; a.click();
    URL.revokeObjectURL(url);
    if (onLog) onLog('Exported user list as CSV');
  };

  /* ── Detail modal ── */
  const openDetail = (user) => {
    setSelectedUser(user);
    if (onLog) onLog(`Viewed profile of ${user.name}`);
  };

  /* ── Delete flow ── */
  const requestDelete = (user) => {
    setConfirmDeleteId(user.id);
  };
  const confirmDelete = (user) => {
    setConfirmDeleteId(null);
    if (onDeleteUser) onDeleteUser(user);
    if (onLog) onLog(`Deleted user ${user.name}`);
  };
  const cancelDelete = () => setConfirmDeleteId(null);

  return (
    <>
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>

        {/* ── Toolbar ── */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }} className="flex-between">
          <h3 style={{ margin: 0 }}>
            Users
            {!loading && (
              <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                ({total} total)
              </span>
            )}
          </h3>
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: 'var(--bg-secondary)', padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'
            }}>
              <Search size={15} color="var(--text-secondary)" />
              <input
                type="text"
                placeholder="Search… (Enter)"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onBlur={handleSearchBlur}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '180px', fontSize: '0.875rem' }}
              />
            </div>

            <button className="btn btn-outline" onClick={exportCSV} disabled={loading}>
              <Download size={15} /> Export
            </button>

            {/* ✨ Add User button */}
            <button
              className="btn btn-primary"
              onClick={onAddUser}
              id="add-user-btn"
              style={{ gap: '0.45rem' }}
            >
              <UserPlus size={16} /> Add User
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ overflowX: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Contact</th>
                <th style={thStyle}>Department</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
                      <span>Loading users from API…</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <User size={32} opacity={0.3} />
                      <span>No users found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(user => {
                  const isDeleting = confirmDeleteId === user.id;
                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.15s',
                        backgroundColor: isDeleting ? 'rgba(239,68,68,0.05)' : undefined,
                      }}
                      className={isDeleting ? '' : 'table-row-hover'}
                    >
                      {/* User */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <img
                              src={user.image}
                              alt={user.name}
                              style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)', display: 'block' }}
                              onError={e => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            {/* Fallback avatar */}
                            <div style={{
                              display: 'none', width: 38, height: 38, borderRadius: '50%',
                              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                              alignItems: 'center', justifyContent: 'center',
                              fontSize: '1rem', fontWeight: 700, color: 'white',
                              border: '2px solid var(--border-color)',
                            }}>
                              {user.name?.charAt(0)}
                            </div>
                            {user.isLocal && (
                              <div title="Locally added" style={{
                                position: 'absolute', bottom: -2, right: -2,
                                width: 12, height: 12, borderRadius: '50%',
                                backgroundColor: 'var(--accent-success)',
                                border: '2px solid var(--bg-primary)',
                              }} />
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>@{user.username}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={tdStyle}>
                        <div style={{ fontSize: '0.8rem' }}>{user.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                          <Phone size={11} />{user.phone || '—'}
                        </div>
                      </td>

                      {/* Department */}
                      <td style={tdStyle}>
                        <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Building2 size={13} color="var(--text-secondary)" />
                          {user.department || '—'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{user.jobTitle || '—'}</div>
                      </td>

                      {/* Location */}
                      <td style={tdStyle}>
                        <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={12} color="var(--text-secondary)" />
                          {user.city ? `${user.city}, ${user.country}` : '—'}
                        </div>
                      </td>

                      {/* Role */}
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem', fontWeight: 600,
                          ...getRoleBadgeStyle(user.role)
                        }}>
                          {getRoleIcon(user.role)} {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={tdStyle}>
                        <span className={`badge ${user.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                          {user.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        {isDeleting ? (
                          /* Inline delete confirmation */
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', whiteSpace: 'nowrap' }}>Delete?</span>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                              onClick={() => confirmDelete(user)}
                            >
                              Yes
                            </button>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                              onClick={cancelDelete}
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                            <button className="btn-icon" onClick={() => openDetail(user)} title="View details" id={`view-user-${user.id}`}>
                              <Eye size={16} />
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => { if (onEditUser) onEditUser(user); }}
                              title="Edit user"
                              id={`edit-user-${user.id}`}
                              style={{ color: 'var(--accent-primary)' }}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => requestDelete(user)}
                              title="Delete user"
                              id={`delete-user-${user.id}`}
                              style={{ color: 'var(--accent-danger)' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.875rem 1.5rem', borderTop: '1px solid var(--border-color)',
            fontSize: '0.85rem', color: 'var(--text-secondary)'
          }}>
            <span>Page {page + 1} of {totalPages}</span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.6rem' }}
                onClick={() => onPageChange(page - 1)}
                disabled={page === 0}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                return (
                  <button
                    key={pageNum}
                    className={`btn ${pageNum === page ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.35rem 0.6rem', minWidth: 34 }}
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.6rem' }}
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── User Detail Modal ── */}
      {selectedUser && (
        <div
          className="modal-overlay open"
          onClick={e => { if (e.target === e.currentTarget) setSelectedUser(null); }}
        >
          <div className="modal-content" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>User Profile</h3>
              <button className="btn-icon" onClick={() => setSelectedUser(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <img
                  src={selectedUser.image}
                  alt={selectedUser.name}
                  style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)' }}
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div style={{
                  display: 'none', width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.75rem', fontWeight: 700, color: 'white',
                  border: '3px solid var(--accent-primary)', flexShrink: 0,
                }}>
                  {selectedUser.name?.charAt(0)}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{selectedUser.name}</h2>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {selectedUser.jobTitle} · {selectedUser.company}
                  </p>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.4rem',
                    padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 600,
                    ...getRoleBadgeStyle(selectedUser.role)
                  }}>
                    {getRoleIcon(selectedUser.role)} {selectedUser.role}
                  </span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                {[
                  { label: 'Email', value: selectedUser.email },
                  { label: 'Phone', value: selectedUser.phone },
                  { label: 'Username', value: `@${selectedUser.username}` },
                  { label: 'Age', value: selectedUser.age },
                  { label: 'Gender', value: selectedUser.gender },
                  { label: 'Blood Group', value: selectedUser.bloodGroup },
                  { label: 'Department', value: selectedUser.department },
                  { label: 'University', value: selectedUser.university },
                  { label: 'City', value: selectedUser.city },
                  { label: 'Country', value: selectedUser.country },
                  { label: 'Birth Date', value: selectedUser.birthDate },
                  { label: 'Status', value: selectedUser.status },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: '0.55rem 0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                    <div style={{ fontSize: '0.83rem', fontWeight: 500 }}>{value || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => { setSelectedUser(null); requestDelete(selectedUser); }} style={{ color: 'var(--accent-danger)', borderColor: 'rgba(239,68,68,0.3)' }}>
                <Trash2 size={15} /> Delete
              </button>
              <button
                className="btn btn-outline"
                onClick={() => { setSelectedUser(null); if (onEditUser) onEditUser(selectedUser); }}
                style={{ color: 'var(--accent-primary)', borderColor: 'rgba(99,102,241,0.3)' }}
              >
                <Pencil size={15} /> Edit
              </button>
              <button className="btn btn-primary" onClick={() => setSelectedUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .table-row-hover:hover { background-color: rgba(255,255,255,0.025); }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

// Named X for the detail modal close button
const X = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const thStyle = { padding: '0.875rem 1.25rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' };
const tdStyle = { padding: '0.875rem 1.25rem' };

export default UserTable;
