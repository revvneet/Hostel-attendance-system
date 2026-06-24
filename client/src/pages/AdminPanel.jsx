import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [wardens, setWardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [wardenToDelete, setWardenToDelete] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    username: '', firstName: '', lastName: '', password: '', email: '', hostelType: 'boys'
  });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [wardenBeingEdited, setWardenBeingEdited] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: '', firstName: '', lastName: '', password: '', email: '', hostelType: 'boys'
  });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchWardens();
  }, []);

  const fetchWardens = async () => {
    try {
      const res = await api.get('/admin/wardens');
      setWardens(res.data);
    } catch (err) {
      console.error('Error fetching wardens:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!wardenToDelete) return;
    try {
      await api.delete(`/admin/wardens/${wardenToDelete._id}`);
      setWardens(wardens.filter(w => w._id !== wardenToDelete._id));
      setShowDeleteModal(false);
      setWardenToDelete(null);
    } catch (err) {
      console.error('Error deleting warden:', err);
      alert('Failed to delete warden');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    try {
      const res = await api.post('/admin/wardens', addFormData);
      setWardens([res.data, ...wardens]);
      setShowAddModal(false);
      setAddFormData({ username: '', firstName: '', lastName: '', password: '', email: '', hostelType: 'boys' });
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add warden');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);
    try {
      // Create a copy of form data and remove empty password so it isn't updated
      const submitData = { ...editFormData };
      if (!submitData.password) {
        delete submitData.password;
      }

      const res = await api.put(`/admin/wardens/${wardenBeingEdited._id}`, submitData);
      setWardens(wardens.map(w => w._id === res.data._id ? res.data : w));
      setShowEditModal(false);
      setWardenBeingEdited(null);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update warden');
    } finally {
      setEditLoading(false);
    }
  };

  const getTimeSince = (dateString) => {
    if (!dateString) return 'Never logged in';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // in seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar hideSearch={true} hideHistory={true} />

      <main style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '800px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          {/* Header */}
          <div style={{
            padding: '1.5rem 2rem',
            borderBottom: '1.5px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--heading)', textTransform: 'uppercase' }}>
              Warden List
            </h2>
            <button
              className="btn btn-primary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '1.2rem', lineHeight: 1 }}
              onClick={() => setShowAddModal(true)}
              title="Add Warden"
            >
              +
            </button>
          </div>

          {/* List */}
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '0 2rem'
          }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>Loading wardens...</div>
            ) : wardens.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>No wardens found.</div>
            ) : (
              wardens.map((warden, index) => (
                <div key={warden._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 0',
                  borderBottom: index < wardens.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--heading)', width: '24px' }}>{index + 1}.</span>
                    <span>{warden.firstName} {warden.lastName}</span>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>- {getTimeSince(warden.updatedAt)}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-icon"
                      style={{ padding: '0.4rem', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
                      title="Delete Warden"
                      onClick={() => {
                        setWardenToDelete(warden);
                        setShowDeleteModal(true);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                    <button
                      className="btn-icon"
                      style={{ padding: '0.4rem', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}
                      title="Edit Warden"
                      onClick={() => {
                        setWardenBeingEdited(warden);
                        setEditFormData({
                          username: warden.username,
                          firstName: warden.firstName,
                          lastName: warden.lastName,
                          email: warden.email || '',
                          hostelType: warden.hostelType || 'boys',
                          password: ''
                        });
                        setShowEditModal(true);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ marginTop: '2rem', width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn"
            style={{
              border: '1.5px solid var(--border)',
              background: 'var(--card-bg)',
              color: 'var(--text)',
              padding: '0.6rem 1.2rem',
              fontWeight: 500
            }}
            onClick={() => navigate('/dashboard')}
          >
            attendance &rarr;
          </button>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && wardenToDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            background: 'var(--card-bg)', borderRadius: '16px', padding: '2rem',
            width: '90%', maxWidth: '500px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ color: 'var(--text)', marginBottom: '2rem', lineHeight: 1.5 }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--heading)' }}>
                Are you sure you want to delete this warden?
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)' }}>
                This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                className="btn"
                style={{ border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text)' }}
                onClick={() => {
                  setShowDeleteModal(false);
                  setWardenToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Warden Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          animation: 'fadeIn 0.2s ease', padding: '1rem'
        }}>
          <div style={{
            background: 'var(--card-bg)', borderRadius: '16px', padding: '2rem',
            width: '100%', maxWidth: '500px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--heading)' }}>Add New Warden</h3>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Username</label>
                <input required type="text" className="form-input" value={addFormData.username} onChange={e => setAddFormData({ ...addFormData, username: e.target.value })} placeholder="e.g. john_doe" />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0, minWidth: 0 }}>
                  <label className="form-label">First Name</label>
                  <input required type="text" className="form-input" value={addFormData.firstName} onChange={e => setAddFormData({ ...addFormData, firstName: e.target.value })} placeholder="John" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0, minWidth: 0 }}>
                  <label className="form-label">Last Name</label>
                  <input required type="text" className="form-input" value={addFormData.lastName} onChange={e => setAddFormData({ ...addFormData, lastName: e.target.value })} placeholder="Doe" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email (Optional)</label>
                <input type="email" className="form-input" value={addFormData.email} onChange={e => setAddFormData({ ...addFormData, email: e.target.value })} placeholder="john@example.com" />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Password</label>
                <input required type="password" className="form-input" value={addFormData.password} onChange={e => setAddFormData({ ...addFormData, password: e.target.value })} placeholder="Initial password" />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Hostel Type</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0.75rem', border: `1.5px solid ${addFormData.hostelType === 'boys' ? '#fff' : 'var(--border)'}`,
                    borderRadius: '8px', cursor: 'pointer',
                    background: addFormData.hostelType === 'boys' ? 'rgba(255, 255, 255, 0.1)' : 'var(--input-bg)',
                    color: addFormData.hostelType === 'boys' ? '#fff' : 'var(--text)',
                    transition: 'all 0.2s ease', fontWeight: 500, fontSize: '0.95rem'
                  }}>
                    <input type="radio" name="hostelType" value="boys" checked={addFormData.hostelType === 'boys'} onChange={e => setAddFormData({ ...addFormData, hostelType: e.target.value })} style={{ display: 'none' }} />
                    Boys Hostel
                  </label>
                  <label style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0.75rem', border: `1.5px solid ${addFormData.hostelType === 'girls' ? '#fff' : 'var(--border)'}`,
                    borderRadius: '8px', cursor: 'pointer',
                    background: addFormData.hostelType === 'girls' ? 'rgba(255, 255, 255, 0.1)' : 'var(--input-bg)',
                    color: addFormData.hostelType === 'girls' ? '#fff' : 'var(--text)',
                    transition: 'all 0.2s ease', fontWeight: 500, fontSize: '0.95rem'
                  }}>
                    <input type="radio" name="hostelType" value="girls" checked={addFormData.hostelType === 'girls'} onChange={e => setAddFormData({ ...addFormData, hostelType: e.target.value })} style={{ display: 'none' }} />
                    Girls Hostel
                  </label>
                </div>
              </div>

              {addError && <p style={{ color: 'var(--red)', fontSize: '0.85rem', margin: 0 }}>{addError}</p>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text)' }}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={addLoading}
                >
                  {addLoading ? 'Adding...' : 'Add Warden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Warden Modal */}
      {showEditModal && wardenBeingEdited && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          animation: 'fadeIn 0.2s ease', padding: '1rem'
        }}>
          <div style={{
            background: 'var(--card-bg)', borderRadius: '16px', padding: '2rem',
            width: '100%', maxWidth: '500px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--heading)' }}>Edit Warden</h3>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Username</label>
                <input required type="text" className="form-input" value={editFormData.username} onChange={e => setEditFormData({ ...editFormData, username: e.target.value })} placeholder="e.g. john_doe" />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0, minWidth: 0 }}>
                  <label className="form-label">First Name</label>
                  <input required type="text" className="form-input" value={editFormData.firstName} onChange={e => setEditFormData({ ...editFormData, firstName: e.target.value })} placeholder="John" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0, minWidth: 0 }}>
                  <label className="form-label">Last Name</label>
                  <input required type="text" className="form-input" value={editFormData.lastName} onChange={e => setEditFormData({ ...editFormData, lastName: e.target.value })} placeholder="Doe" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email (Optional)</label>
                <input type="email" className="form-input" value={editFormData.email} onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} placeholder="john@example.com" />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" value={editFormData.password} onChange={e => setEditFormData({ ...editFormData, password: e.target.value })} placeholder="Leave blank to keep current" />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Hostel Type</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0.75rem', border: `1.5px solid ${editFormData.hostelType === 'boys' ? '#fff' : 'var(--border)'}`,
                    borderRadius: '8px', cursor: 'pointer',
                    background: editFormData.hostelType === 'boys' ? 'rgba(255, 255, 255, 0.1)' : 'var(--input-bg)',
                    color: editFormData.hostelType === 'boys' ? '#fff' : 'var(--text)',
                    transition: 'all 0.2s ease', fontWeight: 500, fontSize: '0.95rem'
                  }}>
                    <input type="radio" name="hostelType" value="boys" checked={editFormData.hostelType === 'boys'} onChange={e => setEditFormData({ ...editFormData, hostelType: e.target.value })} style={{ display: 'none' }} />
                    Boys Hostel
                  </label>
                  <label style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0.75rem', border: `1.5px solid ${editFormData.hostelType === 'girls' ? '#fff' : 'var(--border)'}`,
                    borderRadius: '8px', cursor: 'pointer',
                    background: editFormData.hostelType === 'girls' ? 'rgba(255, 255, 255, 0.1)' : 'var(--input-bg)',
                    color: editFormData.hostelType === 'girls' ? '#fff' : 'var(--text)',
                    transition: 'all 0.2s ease', fontWeight: 500, fontSize: '0.95rem'
                  }}>
                    <input type="radio" name="hostelType" value="girls" checked={editFormData.hostelType === 'girls'} onChange={e => setEditFormData({ ...editFormData, hostelType: e.target.value })} style={{ display: 'none' }} />
                    Girls Hostel
                  </label>
                </div>
              </div>

              {editError && <p style={{ color: 'var(--red)', fontSize: '0.85rem', margin: 0 }}>{editError}</p>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text)' }}
                  onClick={() => {
                    setShowEditModal(false);
                    setWardenBeingEdited(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
