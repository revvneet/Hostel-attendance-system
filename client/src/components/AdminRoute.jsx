import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)' }}>
        <span className="spinner" style={{ width: '40px', height: '40px', borderColor: 'var(--text) transparent transparent transparent' }} />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/adminlogin" replace />;
  }

  return children;
}
