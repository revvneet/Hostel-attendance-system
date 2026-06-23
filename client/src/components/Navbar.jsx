import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Icons as inline SVG
const CalendarIcon = ({ size = 20 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const BackArrowIcon = ({ size = 20 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);
const SearchIcon = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const UserIcon = ({ size = 18 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const FilterIcon = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const HelpIcon = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const SunIcon = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
const MoonIcon = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function Navbar({
  searchQuery, onSearchChange,
  historyMode, onHistoryToggle,
}) {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

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
        <span style={{ color: '#fff', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1.05rem', whiteSpace: 'nowrap' }}>
          HOSTEL ATTENDANCE
        </span>
      </div>

      {/* Search */}
      <div className="search-wrap">
        <SearchIcon />
        <input
          id="search-input"
          type="text"
          placeholder="Search student or room…"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      {/* Calendar toggle */}
      <button
        className="btn-icon"
        onClick={onHistoryToggle}
        title={historyMode ? 'Back to Dashboard' : 'View History'}
        id="btn-history-toggle"
      >
        {historyMode ? <BackArrowIcon /> : <CalendarIcon />}
      </button>


      {/* Theme Toggle */}
      <button className="btn-icon" onClick={toggleTheme} title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'} id="btn-theme-toggle">
        {isDarkMode ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* Help */}
      <Link to="/help" id="nav-help" style={{ textDecoration: 'none' }}>
        <button className="btn-icon" title="Help">
          <HelpIcon />
        </button>
      </Link>

      {/* Profile */}
      <Link to="/profile" id="nav-profile" style={{ textDecoration: 'none' }}>
        <button className="btn-icon" title={user?.name || 'Profile'}>
          <UserIcon />
        </button>
      </Link>
    </nav>
  );
}
