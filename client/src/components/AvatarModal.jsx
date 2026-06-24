import { useEffect, useRef } from 'react';

export default function AvatarModal({ onClose, onFileSelect, onDelete, currentPic, initials, loading }) {
  const backdropRef = useRef(null);
  const hasPicture = !!currentPic;
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
      e.target.value = ''; // Reset so the same file can be selected again
    }
  };

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onClick={e => e.target === backdropRef.current && onClose()}
      id="avatar-modal-backdrop"
    >
      <div className="modal-box" id="avatar-modal" style={{ maxWidth: 350 }}>
        <div className="modal-header">
          <span>Edit Profile Picture</span>
          <button className="btn-icon" onClick={onClose} style={{ color: 'rgba(255,255,255,0.7)' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden',
            backgroundColor: 'var(--surface-light)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '2.5rem', fontWeight: 600, color: 'var(--text)',
            marginBottom: '0.5rem', border: '2px solid var(--border)'
          }}>
            {currentPic ? (
              <img src={currentPic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <button 
            className="btn" 
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              backgroundColor: 'rgba(255, 255, 255, 0.08)', 
              color: 'var(--text)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Upload New Picture'}
          </button>
          
          <button 
            className="btn btn-danger" 
            style={{ width: '100%', justifyContent: 'center', opacity: !hasPicture ? 0.5 : 1 }}
            onClick={onDelete}
            disabled={!hasPicture || loading}
          >
            Remove Picture
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/jpeg, image/png"
            onChange={handleFileChange} 
          />
        </div>
      </div>
    </div>
  );
}
