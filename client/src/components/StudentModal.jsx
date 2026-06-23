import { useEffect, useRef, useState } from 'react';

const PHOTO_BASE = '/uploads/photos/';

function getPhotoUrl(photoPath) {
  if (!photoPath) return null;
  return `${PHOTO_BASE}${photoPath.split('/').pop()}`;
}

function AvatarFallback({ name, size = 100 }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--navy) 0%, #2d4a8a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32 + 'px', fontWeight: 800, color: '#fff',
      border: '3px solid var(--navy)', boxShadow: '0 4px 16px rgba(26,39,68,0.25)',
    }}>
      {initials}
    </div>
  );
}

function Badge({ status }) {
  return <span className={`badge badge-${status}`} style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
    {status === 'leave' ? 'On Leave' : status.charAt(0).toUpperCase() + status.slice(1)}
  </span>;
}

export default function StudentModal({ student, onClose, onMarkPresent, onLeave, loading }) {
  const backdropRef = useRef(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!student) return null;

  const photoUrl = getPhotoUrl(student.photoPath);
  const status = student.status || 'absent';

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onClick={e => e.target === backdropRef.current && onClose()}
      id="student-modal-backdrop"
    >
      <div className="modal-box" id="student-modal">
        <div className="modal-header">
          <span>Student Details</span>
          <button className="btn-icon" onClick={onClose} style={{ color: 'rgba(255,255,255,0.7)' }} id="student-modal-close">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* Photo */}
          <div className="modal-photo-wrap">
            {!imgError && photoUrl ? (
              <img
                src={photoUrl}
                alt={student.name}
                className="modal-photo"
                onError={() => setImgError(true)}
              />
            ) : (
              <AvatarFallback name={student.name} size={100} />
            )}
            <div style={{ marginTop: '0.75rem' }}>
              <Badge status={status} />
            </div>
          </div>

          {/* Info grid */}
          <div className="modal-info-grid">
            <div className="info-row">
              <span className="info-label">Full Name</span>
              <span className="info-value">{student.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Enrollment No.</span>
              <span className="info-value">{student.enrollmentNo}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone</span>
              <span className="info-value">{student.phoneNo || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Parent's Phone</span>
              <span className="info-value">{student.parentPhone || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Room / Bed</span>
              <span className="info-value">Room {student.roomNo}, Bed {student.bed}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Floor</span>
              <span className="info-value">Floor {student.floor}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="modal-actions">
            <button
              id="btn-mark-present"
              className="btn btn-success"
              onClick={() => onMarkPresent(student._id)}
              disabled={loading || status === 'present'}
            >
              {loading ? <span className="spinner" /> : null}
              {status === 'present' ? '✓ Present' : 'Mark Present'}
            </button>
            <button
              id="btn-register-leave"
              className="btn btn-amber"
              onClick={() => onLeave(student)}
              disabled={loading}
            >
              Leave
            </button>
            <button
              id="btn-mark-absent"
              className="btn btn-ghost"
              onClick={() => onMarkPresent(student._id, 'absent')}
              disabled={loading || status === 'absent'}
              style={{ marginLeft: 'auto' }}
            >
              Mark Absent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
