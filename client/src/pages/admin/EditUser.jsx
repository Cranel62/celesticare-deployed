import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../services/api'; // Changed from ../../../
import '../../styles/Admin.css';       // Changed from ../../../

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    API.get(`/admin/users/${id}`)
      .then(res => setUser(res.data.data))
      .catch(() => {
        alert('User not found or is an admin.');
        navigate('/admin/dashboard');
      });
  }, [id, navigate]);

  if (!user) return <div className="admin-body">Loading...</div>;

  return (
    <div className="admin-body">
      <div className="admin-bg-accent one"></div>
      <div className="admin-bg-accent two"></div>
      
      <div className="admin-page-container" style={{ maxWidth: '1200px' }}>
        <div className="admin-header">
          <div><h1 style={{ margin: 0, fontWeight: 700 }}>USER PROFILE</h1><p style={{ margin: 0, opacity: 0.75 }}>Viewing: {user.username}</p></div>
          <Link to="/admin/dashboard" className="admin-btn" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', textDecoration: 'none' }}>← Back to Users</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          <div className="admin-view-container">
            <h3 style={{ color: '#e7d9ff', borderBottom: '2px solid #c19bfa', paddingBottom: '15px', marginBottom: '25px' }}>User Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ fontWeight: 500, color: '#c19bfa', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Username</div>
                <div className="admin-view-field">{user.username}</div>
              </div>
              <div>
                <div style={{ fontWeight: 500, color: '#c19bfa', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Email Address</div>
                <div className="admin-view-field">{user.email}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="admin-view-container" style={{ marginBottom: '20px' }}>
              <h5 style={{ color: '#e7d9ff', fontWeight: 600, marginBottom: '15px' }}>Account Info</h5>
              <p><strong>Registration:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span className={`admin-badge ${user.deletedAt ? 'bg-danger' : 'bg-success'}`}>{user.deletedAt ? 'Archived' : 'Active'}</span></p>
            </div>
            <div className="admin-view-container">
              <h5 style={{ color: '#e7d9ff', fontWeight: 600, marginBottom: '15px' }}>Quiz Results</h5>
              <p><strong>Aesthetic:</strong> {user.aesthetic_result || <span style={{ color: '#6c757d' }}>Not completed</span>}</p>
              <p><strong>Style:</strong> {user.style_result || <span style={{ color: '#6c757d' }}>Not completed</span>}</p>
              <p><strong>Zodiac:</strong> {user.zodiac_sign || 'Not set'}</p>
            </div>
          </div>

          <div className="admin-view-container admin-feedback-container" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ color: '#e7d9ff', borderBottom: '2px solid #c19bfa', paddingBottom: '15px', marginBottom: '25px' }}>User Feedback</h3>
            {user.feedback?.length ? user.feedback.map((entry) => (
              <article className="admin-feedback-entry" key={entry._id}>
                <div className="admin-feedback-meta">Submitted {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '—'}</div>
                <div className="admin-feedback-grid">
                  <div><strong>Experience</strong><span>{entry.experience || '—'}</span></div>
                  <div><strong>Fashion match</strong><span>{entry.fashion_match || '—'}</span></div>
                  <div><strong>Favorite feature</strong><span>{entry.favorite_feature || '—'}</span></div>
                  <div><strong>Vibe</strong><span>{entry.vibe || '—'}</span></div>
                  <div className="admin-feedback-suggestions"><strong>Suggestions</strong><span>{entry.suggestions || '—'}</span></div>
                </div>
              </article>
            )) : <p className="admin-feedback-empty">No feedback submitted by this user yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
