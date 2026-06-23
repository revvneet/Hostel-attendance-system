import { useEffect, useRef, useState } from 'react';

const PHOTO_BASE = '/uploads/photos/';
function getPhotoUrl(p) { return p ? `${PHOTO_BASE}${p.split('/').pop()}` : null; }

function AvatarFallback({ name, size = 70 }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--navy) 0%, #2d4a8a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3 + 'px', fontWeight: 800, color: '#fff',
      border: '3px solid var(--navy)', flexShrink: 0,
    }}>{initials}</div>
  );
}

export default function LeaveModal({ student, onClose, onSubmit, loading }) {
  const backdropRef = useRef(null);
  const today = new Date().toISOString().split('T')[0];

  const [leaveStart, setLeaveStart] = useState(today);
  const [leaveEnd, setLeaveEnd] = useState(today);
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!student) return null;

  const handleSubmit = () => {
    if (!leaveStart || !leaveEnd) { setError('Both dates are required.'); return; }
    if (new Date(leaveEnd) < new Date(leaveStart)) { setError('End date must be on or after start date.'); return; }
    setError('');
    onSubmit(student._id, leaveStart, leaveEnd);
  };

  const photoUrl = getPhotoUrl(student.photoPath);

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onClick={e => e.target === backdropRef.current && onClose()}
      id="leave-modal-backdrop"
    >
      <div className="modal-box wide" id="leave-modal">
        <div className="modal-header">
          <span>Register Leave</span>
          <button className="btn-icon" onClick={onClose} style={{ color: 'rgba(255,255,255,0.7)' }} id="leave-modal-close">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          {/* Student info panel */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', minWidth: 90 }}>
            {!imgError && photoUrl ? (
              <img src={photoUrl} alt={student.name} style={{ width: 70, height: 70, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--navy)' }} onError={() => setImgError(true)} />
            ) : <AvatarFallback name={student.name} size={70} />}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--navy)' }}>{student.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Room {student.roomNo} · Bed {student.bed}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{student.enrollmentNo}</div>
              {student.phoneNo && <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{student.phoneNo}</div>}
              {student.parentPhone && <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Parent: {student.parentPhone}</div>}
            </div>
          </div>

          {/* Leave form */}
          <div style={{ flex: 1 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="leave-start">Start Date</label>
              <input
                id="leave-start"
                type="date"
                className="form-input"
                value={leaveStart}
                onChange={e => setLeaveStart(e.target.value)}
                min={today}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="leave-end">End Date</label>
              <input
                id="leave-end"
                type="date"
                className="form-input"
                value={leaveEnd}
                onChange={e => setLeaveEnd(e.target.value)}
                min={leaveStart || today}
              />
            </div>
            {error && <p className="form-error" style={{ marginBottom: '0.75rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                id="btn-leave-submit"
                className="btn btn-amber"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : null}
                Confirm Leave
              </button>
              <button
                id="btn-leave-cancel"
                className="btn btn-ghost"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
