import React, { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Phone, Briefcase, MapPin, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

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

const AddUserModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }
  const firstInputRef = useRef(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM);
      setErrors({});
      setToast(null);
      setTimeout(() => firstInputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Close toast after 3 s
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

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
    if (form.age && (isNaN(form.age) || form.age < 1 || form.age > 120)) {
      e.age = 'Enter a valid age (1–120)';
    }
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      // POST to dummyjson — it returns a fake created user with id 209
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
      const created = await res.json();

      // Build normalised user to match our internal shape
      const newUser = {
        id: `local-${Date.now()}`,  // unique local id so it doesn't clash
        name: `${form.firstName} ${form.lastName}`,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        username: form.username,
        age: Number(form.age) || 25,
        gender: form.gender,
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(form.firstName + '+' + form.lastName)}&background=6366f1&color=fff&size=128`,
        bloodGroup: '—',
        role: form.role.charAt(0).toUpperCase() + form.role.slice(1),
        department: form.department,
        company: form.company,
        jobTitle: form.jobTitle,
        city: form.city,
        country: form.country,
        university: form.university,
        birthDate: '—',
        status: form.status,
        isLocal: true,    // flag so we can distinguish locally-added users
      };

      setToast({ type: 'success', msg: `User "${newUser.name}" created! (API id: ${created.id})` });
      setTimeout(() => { onSave(newUser); onClose(); }, 1200);
    } catch (err) {
      setToast({ type: 'error', msg: `Failed to save: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !saving) onClose();
  };

  // ── Helpers ──
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

  const avatarLetter = form.firstName ? form.firstName[0].toUpperCase() : '?';

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={handleOverlayClick}>
      <div className="modal-content" style={{ maxWidth: 580, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>

        {/* ── Header ── */}
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Live avatar preview */}
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', fontWeight: 700, color: 'white',
              boxShadow: '0 0 0 3px rgba(99,102,241,0.25)',
              transition: 'box-shadow 0.2s',
              flexShrink: 0,
            }}>
              {avatarLetter}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Add New User</h3>
              <p style={{ margin: 0, fontSize: '0.78rem' }}>Fill in the details below to create a new team member</p>
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

            {/* Section: Personal Info */}
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent-primary)', marginBottom: '0.75rem' }}>
                Personal Information
              </p>
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

            {/* Divider */}
            <div style={{ borderTop: '1px solid var(--border-color)' }} />

            {/* Section: Role & Work */}
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent-primary)', marginBottom: '0.75rem' }}>
                Role & Work
              </p>
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

            {/* Divider */}
            <div style={{ borderTop: '1px solid var(--border-color)' }} />

            {/* Section: Location */}
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent-primary)', marginBottom: '0.75rem' }}>
                Location & Education
              </p>
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
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: 130 }}>
              {saving ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Saving…
                </span>
              ) : '+ Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
