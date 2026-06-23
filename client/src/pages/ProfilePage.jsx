import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPw !== confirmPw) { setMsg({ text: 'New passwords do not match.', type: 'error' }); return; }
    if (newPw.length < 6) { setMsg({ text: 'Password must be at least 6 characters.', type: 'error' }); return; }
    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      await api.post('/auth/change-password', { currentPassword: currentPw, newPassword: newPw });
      setMsg({ text: 'Password changed successfully.', type: 'success' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Failed to change password.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)' }}>
      {/* Top bar */}
      <nav className="navbar">
        <span style={{ color: '#fff', fontFamily: 'Montserrat, sans-serif', fontWeight: 500, fontSize: '1rem', whiteSpace: 'nowrap' }}>Hostel Attendance</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <button className="btn-icon" style={{ color: 'rgba(255,255,255,0.75)' }}>← Dashboard</button>
          </Link>
        </div>
      </nav>

      <div className="profile-page">
        {/* Profile card */}
        <div className="profile-card">
          <div className="profile-avatar-wrap">👤</div>
          <div className="profile-name" id="profile-name">{user?.name || 'Warden'}</div>
          <div className="profile-role">{user?.role || 'Warden'} · {user?.username}</div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              id="btn-profile-logout"
              className="btn btn-danger"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Change password card */}
        <div className="profile-card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1.25rem' }}>Change Password</h2>
          <form onSubmit={handleChangePassword} id="change-pw-form">
            <div className="form-group">
              <label className="form-label" htmlFor="current-pw">Current Password</label>
              <input id="current-pw" type="password" className="form-input" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="new-pw">New Password</label>
              <input id="new-pw" type="password" className="form-input" value={newPw} onChange={e => setNewPw(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirm-pw">Confirm New Password</label>
              <input id="confirm-pw" type="password" className="form-input" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
            </div>
            {msg.text && (
              <p style={{ fontSize: '0.82rem', fontWeight: 500, color: msg.type === 'error' ? 'var(--red)' : 'var(--green)', marginBottom: '0.75rem' }}>{msg.text}</p>
            )}
            <button id="btn-save-pw" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Save Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
