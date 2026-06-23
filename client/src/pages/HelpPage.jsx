import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const contacts = [
  {
    id: 'dev',
    icon: '💻',
    title: 'Developers',
    email: 'dev@hostelapp.com',
    phone: '+91 98765 43210',
    altPhone: '+91 98765 43211',
  },
  {
    id: 'admin',
    icon: '🏫',
    title: 'College Admin',
    email: 'admin@college.edu.in',
    phone: '+91 11 2345 6789',
    altPhone: '+91 98001 12345',
  },
];

export default function HelpPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)' }}>
      <TopBar />
      <div className="help-page">
        <h1 className="help-title">Help & Contact</h1>
        <p className="help-sub">Reach out to the team below for any issues or queries.</p>
        <div className="help-cards">
          {contacts.map(c => (
            <div key={c.id} className="help-card" id={`help-card-${c.id}`}>
              <div className="help-card-icon">{c.icon}</div>
              <div className="help-card-title">{c.title}</div>
              <div className="help-card-detail">
                <div>📧 <a href={`mailto:${c.email}`}>{c.email}</a></div>
                <div style={{ marginTop: '0.4rem' }}>📞 <a href={`tel:${c.phone.replace(/\s/g,'')}`}>{c.phone}</a></div>
                {c.altPhone && <div style={{ marginTop: '0.25rem' }}>📞 <a href={`tel:${c.altPhone.replace(/\s/g,'')}`}>{c.altPhone}</a></div>}
                <div style={{ marginTop: '0.75rem' }}>
                  <a href={`tel:${c.phone.replace(/\s/g,'')}`}>
                    <button className="btn btn-primary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.875rem' }} id={`btn-call-${c.id}`}>
                      📞 Call
                    </button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem' }}>
          <Link to="/dashboard">
            <button className="btn btn-ghost" id="btn-back-dashboard">
              ← Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🏠</div>
      <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Hostel Attendance</span>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <button className="btn-icon" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', gap: '0.35rem' }}>← Dashboard</button>
        </Link>
        <button className="btn-icon" onClick={() => { logout(); navigate('/login'); }} title="Logout">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}
