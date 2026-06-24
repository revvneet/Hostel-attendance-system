import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import AvatarModal from '../components/AvatarModal';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [showResetMenu, setShowResetMenu] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  // null means "fall back to user.profilePicture", '' means explicitly deleted
  const [profilePic, setProfilePic] = useState(null);

  const currentPic = profilePic !== null ? profilePic : user?.profilePicture;

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    if (user?.name) {
      const parts = user.name.split(' ');
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return parts[0][0].toUpperCase();
    }
    return 'W';
  };

  const handleFileSelect = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await api.post('/auth/upload-profile-picture', formData);
      setProfilePic(res.data.profilePicture);
      updateUser({ profilePicture: res.data.profilePicture });
      setShowAvatarModal(false);
    } catch (err) {
      console.error('Failed to upload picture:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePicture = async () => {
    setLoading(true);
    try {
      await api.delete('/auth/profile-picture');
      setProfilePic('');
      updateUser({ profilePicture: '' });
      setShowAvatarModal(false);
    } catch (err) {
      console.error('Failed to delete picture:', err);
    } finally {
      setLoading(false);
    }
  };

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
      setTimeout(() => {
        setShowResetMenu(false);
        setMsg({ text: '', type: '' });
      }, 1500);
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
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 'auto' }}>
          <img
            src="/favicon.png"
            alt="Amity Logo"
            style={{ height: '39px', width: 'auto', objectFit: 'contain' }}
          />
          <div style={{ width: '1.5px', height: '26px', background: 'rgba(255, 255, 255, 0.4)', margin: '0 0.8rem' }} />
          <span style={{ color: '#fff', fontFamily: 'Montserrat, sans-serif', fontWeight: 500, fontSize: '1.05rem', whiteSpace: 'nowrap' }}>
            Hostel Attendance
          </span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <button className="btn-icon" style={{ color: 'rgba(255,255,255,0.75)' }}>← Dashboard</button>
          </Link>
        </div>
      </nav>

      <div className="profile-page">
        {!showResetMenu ? (
        <div className="profile-card" style={{ animation: 'fadeIn 0.3s ease', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
            <div 
              className="profile-avatar-wrap"
              style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
              onClick={() => setShowAvatarModal(true)}
              onMouseEnter={(e) => e.currentTarget.querySelector('.avatar-overlay').style.opacity = 1}
              onMouseLeave={(e) => e.currentTarget.querySelector('.avatar-overlay').style.opacity = 0}
            >
              {currentPic ? (
                <img 
                  src={currentPic} 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <span>{getInitials()}</span>
              )}
              <div 
                className="avatar-overlay"
                style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.2s'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </div>
            </div>
            <div className="profile-name" id="profile-name" style={{ textAlign: 'center' }}>
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.name || 'Warden')}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '0.2rem', textAlign: 'center' }}>
              @{user?.username}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '1rem', color: 'var(--heading)' }}>
              Role: {user?.role || 'Warden'}
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--heading)' }}>
              Type: {user?.hostelType ? `${user.hostelType.charAt(0).toUpperCase() + user.hostelType.slice(1)} Hostel` : 'Boys Hostel'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            <button
              id="btn-profile-logout"
              className="btn btn-danger"
              style={{ border: '1.5px solid var(--border)' }}
              onClick={handleLogout}
            >
              Logout
            </button>
            <button
              className="btn btn-amber"
              style={{ border: '1.5px solid var(--border)' }}
              onClick={() => {
                setShowResetMenu(true);
                setMsg({ text: '', type: '' });
              }}
            >
              Reset Password
            </button>
          </div>
        </div>
        ) : (
          <div className="reset-password-card" style={{ animation: 'fadeIn 0.3s ease', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '150px' }}>
              <div 
                className="profile-avatar-wrap"
                style={{ position: 'relative', overflow: 'hidden', cursor: 'default', width: '90px', height: '90px' }}
              >
                {currentPic ? (
                  <img src={currentPic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span>{getInitials()}</span>
                )}
              </div>
              <div className="profile-name" style={{ textAlign: 'center', fontSize: '1.1rem' }}>
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.name || 'Warden')}
              </div>
            </div>

            <div style={{ flex: 2, minWidth: '250px' }}>
              <form onSubmit={handleChangePassword} id="change-pw-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="current-pw" style={{ marginBottom: '0.3rem' }}>Current password</label>
                  <input id="current-pw" type="password" className="form-input" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="new-pw" style={{ marginBottom: '0.3rem' }}>New password</label>
                  <input id="new-pw" type="password" className="form-input" value={newPw} onChange={e => setNewPw(e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="confirm-pw" style={{ marginBottom: '0.3rem' }}>Confirm password</label>
                  <input id="confirm-pw" type="password" className="form-input" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
                </div>
                {msg.text && (
                  <p style={{ fontSize: '0.82rem', fontWeight: 500, color: msg.type === 'error' ? 'var(--red)' : 'var(--green)', margin: '0' }}>{msg.text}</p>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button 
                    type="button" 
                    className="btn" 
                    style={{ border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text)', transition: 'background 0.2s' }} 
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setShowResetMenu(false)} 
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button id="btn-save-pw" type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? <span className="spinner" /> : 'Save password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {showAvatarModal && (
        <AvatarModal 
          onClose={() => setShowAvatarModal(false)} 
          onFileSelect={handleFileSelect}
          onDelete={handleDeletePicture}
          currentPic={currentPic}
          initials={getInitials()}
          loading={loading}
        />
      )}
    </div>
  );
}
