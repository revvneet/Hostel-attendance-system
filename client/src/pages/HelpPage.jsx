import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

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
  return (
    <nav className="navbar">
      {/* Brand (Logo + Text) */}
      <div style={{ display: 'flex', alignItems: 'center', marginRight: 'auto' }}>
        <img
          src="/amity-logo.png"
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
          <button className="btn-icon" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', gap: '0.35rem' }}>← Dashboard</button>
        </Link>
      </div>
    </nav>
  );
}
