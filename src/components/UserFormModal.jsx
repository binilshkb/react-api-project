import React, { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Phone, Briefcase, MapPin, UserCheck, AlertCircle, CheckCircle2, Pencil, UserPlus } from 'lucide-react';

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  username: '',
  age: '',
  gender: 'male',
  role: 'user',
  status: 'Active',
  department: '',
  jobTitle: '',
  company: '',
  city: '',
  country: '',
  university: '',
};

const FIELD_ICONS = {
  firstName: <User size={15} />,
  lastName: <User size={15} />,
  email: <Mail size={15} />,
  phone: <Phone size={15} />,
  username: <UserCheck size={15} />,
  department: <Briefcase size={15} />,
  jobTitle: <Briefcase size={15} />,
  company: <Briefcase size={15} />,
  city: <MapPin size={15} />,
  country: <MapPin size={15} />,
};

/**
 * Shared modal for both Add and Edit.
 * Props:
 *   isOpen   – boolean
 *   onClose  – () => void
 *   onSave   – (updatedUser) => void
 *   editUser – user object to pre-fill (null = Add mode)
 */
const UserFormModal = ({ isOpen, onClose, onSave, editUser = null }) => {
  const isEditMode = Boolean(editUser);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const firstInputRef = useRef(null);

  /* ── Populate form ── */
  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setToast(null);

    if (isEditMode) {
      // Break "Full Name" back to first/last if needed
      const [firstName = '', ...rest] = (editUser.name || '').split(' ');
      const lastName = rest.join(' ');
      setForm({
        firstName: editUser.firstName || firstName,
        lastName: editUser.lastName || lastName,
        email: editUser.email || '',
        phone: editUser.phone || '',
        username: editUser.username || '',
        age: editUser.age || '',
        gender: editUser.gender || 'male',
        role: (editUser.role || 'user').toLowerCase(),
        status: editUser.status || 'Active',
        department: editUser.department || '',
        jobTitle: editUser.jobTitle || '',
        company: editUser.company || '',
        city: editUser.city || '',
        country: editUser.country || '',
        university: editUser.university || '',
      });
    } else {
      setForm(EMPTY_FORM);
      setTimeout(() => firstInputRef.current?.focus(), 150);
    }
  }, [isOpen, editUser]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Toast auto-dismiss ── */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim()) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Enter a valid email address';
    }
    if (!form.username.trim()) e.username = 'Username is required';
    if (form.age && (isNaN(form.age) || Number(form.age) < 1 || Number(form.age) > 120)) {
      e.age = 'Enter a valid age (1–120)';
    }
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      let apiResult;

      if (isEditMode) {
        // PUT /users/:id  — dummyjson merges & returns the updated object
        const numericId = typeof editUser.id === 'number' ? editUser.id : null;
        if (numericId) {
          const res = await fetch(`https://dummyjson.com/users/${numericId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName: form.firstName,
              lastName: form.lastName,
              email: form.email,
              phone: form.phone,
              username: form.username,
              age: Number(form.age) || editUser.age,
              gender: form.gender,
            }),
          });
          if (!res.ok) throw new Error(`API error: ${res.status}`);
          apiResult = await res.json();
        }
      } else {
        // POST /users/add
        const res = await fetch('https://dummyjson.com/users/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            username: form.username,
            age: Number(form.age) || 25,
            gender: form.gender,
            role: form.role,
          }),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        apiResult = await res.json();
      }

      const roleFormatted = form.role.charAt(0).toUpperCase() + form.role.slice(1);
      const fullName = `${form.firstName} ${form.lastName}`.trim();

      const savedUser = {
        // Preserve existing fields if editing, overwrite what changed
        ...(isEditMode ? editUser : {}),
        id: isEditMode ? editUser.id : `local-${Date.now()}`,
        name: fullName,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        username: form.username,
        age: Number(form.age) || (isEditMode ? editUser.age : 25),
        gender: form.gender,
        image: isEditMode
          ? editUser.image
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(form.firstName + '+' + form.lastName)}&background=6366f1&color=fff&size=128`,
        role: roleFormatted,
        status: form.status,
        department: form.department,
        jobTitle: form.jobTitle,
        company: form.company,
        city: form.city,
        country: form.country,
        university: form.university,
        bloodGroup: isEditMode ? editUser.bloodGroup : '—',
        birthDate: isEditMode ? editUser.birthDate : '—',
        isLocal: true,
      };

      const successMsg = isEditMode
        ? `User "${fullName}" updated successfully!`
        : `User "${fullName}" created! (API id: ${apiResult?.id})`;

      setToast({ type: 'success', msg: successMsg });
      setTimeout(() => { onSave(savedUser); onClose(); }, 1000);
    } catch (err) {
      setToast({ type: 'error', msg: `Failed: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !saving) onClose();
  };

  /* ── Field renderers ── */
  const field = (name, label, type = 'text', placeholder = '') => (
    <div className="input-group" style={{ marginBottom: 0 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
        {FIELD_ICONS[name]} {label}
      </label>
      <input
        ref={name === 'firstName' ? firstInputRef : undefined}
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className="input-control"
        style={errors[name] ? { borderColor: 'var(--accent-danger)' } : {}}
        disabled={saving}
      />
      {errors[name] && (
        <span style={{ fontSize: '0.72rem', color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
          <AlertCircle size={11} /> {errors[name]}
        </span>
      )}
    </div>
  );

  const selectField = (name, label, options) => (
    <div className="input-group" style={{ marginBottom: 0 }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>{label}</label>
      <select name={name} value={form[name]} onChange={handleChange} className="input-control" disabled={saving}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  /* ── Avatar preview in header ── */
  const avatarLetter = form.firstName ? form.firstName[0].toUpperCase() : (isEditMode ? editUser?.name?.[0]?.toUpperCase() : '?');
  const avatarSrc = isEditMode && editUser?.image ? editUser.image : null;

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={handleOverlayClick}>
      <div className="modal-content" style={{ maxWidth: 580, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>

        {/* ── Header ── */}
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Avatar preview */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={form.firstName}
                  style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(99,102,241,0.5)' }}
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div style={{
                display: avatarSrc ? 'none' : 'flex',
                width: 48, height: 48, borderRadius: '50%',
                background: isEditMode
                  ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', fontWeight: 700, color: 'white',
                boxShadow: `0 0 0 3px ${isEditMode ? 'rgba(245,158,11,0.25)' : 'rgba(99,102,241,0.25)'}`,
              }}>
                {avatarLetter}
              </div>
              {/* Edit mode badge */}
              {isEditMode && (
                <div style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--bg-primary)',
                }}>
                  <Pencil size={9} color="white" />
                </div>
              )}
            </div>

            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                {isEditMode ? `Edit User` : 'Add New User'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem' }}>
                {isEditMode
                  ? `Editing ${editUser?.name || 'user'} — changes will be saved locally`
                  : 'Fill in the details below to create a new team member'}
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} disabled={saving} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* ── Toast ── */}
        {toast && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            margin: '0.75rem 1.5rem 0',
            padding: '0.7rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.83rem', fontWeight: 500,
            backgroundColor: toast.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: toast.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)',
          }}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {toast.msg}
          </div>
        )}

        {/* ── Body ── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* ─ Personal Info ─ */}
            <div>
              <p style={sectionLabel(isEditMode ? '#f59e0b' : 'var(--accent-primary)')}>Personal Information</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                {field('firstName', 'First Name *', 'text', 'Jane')}
                {field('lastName', 'Last Name *', 'text', 'Doe')}
                {field('email', 'Email Address *', 'email', 'jane.doe@example.com')}
                {field('phone', 'Phone Number', 'tel', '+1 555-0100')}
                {field('username', 'Username *', 'text', 'janedoe')}
                {field('age', 'Age', 'number', '28')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginTop: '0.85rem' }}>
                {selectField('gender', 'Gender', [
                  { value: 'male', label: '♂ Male' },
                  { value: 'female', label: '♀ Female' },
                  { value: 'other', label: '⚧ Other' },
                ])}
                {selectField('status', 'Status', [
                  { value: 'Active', label: '🟢 Active' },
                  { value: 'Inactive', label: '🔴 Inactive' },
                ])}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)' }} />

            {/* ─ Role & Work ─ */}
            <div>
              <p style={sectionLabel(isEditMode ? '#f59e0b' : 'var(--accent-primary)')}>Role &amp; Work</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                {selectField('role', 'Role', [
                  { value: 'user', label: 'User' },
                  { value: 'moderator', label: 'Moderator' },
                  { value: 'admin', label: 'Admin' },
                ])}
                {field('department', 'Department', 'text', 'Engineering')}
                {field('jobTitle', 'Job Title', 'text', 'Software Engineer')}
                {field('company', 'Company', 'text', 'Acme Corp')}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)' }} />

            {/* ─ Location & Education ─ */}
            <div>
              <p style={sectionLabel(isEditMode ? '#f59e0b' : 'var(--accent-primary)')}>Location &amp; Education</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                {field('city', 'City', 'text', 'New York')}
                {field('country', 'Country', 'text', 'United States')}
                <div style={{ gridColumn: '1 / -1' }}>
                  {field('university', 'University', 'text', 'MIT')}
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="modal-footer" style={{ flexShrink: 0 }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{
                minWidth: 140,
                background: isEditMode
                  ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                  : undefined,
              }}
            >
              {saving ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Saving…
                </span>
              ) : isEditMode ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Pencil size={14} /> Save Changes
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <UserPlus size={14} /> Create User
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* Helper style */
const sectionLabel = (color) => ({
  fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', color, marginBottom: '0.75rem',
});

export default UserFormModal;
