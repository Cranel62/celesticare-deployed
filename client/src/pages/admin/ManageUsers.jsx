import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import '../../styles/Admin.css';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('active');
  const adminEmail = JSON.parse(localStorage.getItem('celesticare_user') || '{}').email;

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAction = async (action, userId, username) => {
    const messages = {
      archive: `Archive ${username}? They can be restored later.`,
      restore: `Restore ${username}? They will be able to log in again.`,
      delete: `Permanently delete ${username}? This CANNOT be undone!`
    };
    if (!window.confirm(messages[action])) return;

    try {
      if (action === 'delete') {
        await API.delete(`/admin/users/${userId}`);
      } else {
        await API.patch(`/admin/users/${userId}/${action}`);
      }
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} user`);
    }
  };

  const activeCount = users.filter(u => !u.deletedAt).length;
  const archivedCount = users.filter(u => u.deletedAt).length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  const displayedUsers = users.filter(u => {
    if (filter === 'active') return !u.deletedAt;
    if (filter === 'archived') return u.deletedAt;
    return true;
  });

  return (
    <div className="admin-body">
      <div className="admin-bg-accent one"></div>
      <div className="admin-bg-accent two"></div>
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 2, padding: '0 20px' }}>
        
        <div className="admin-header">
          <div><h1 style={{ margin: 0, fontWeight: 700, letterSpacing: '2px' }}>CELESTICARE</h1><p style={{ margin: 0, opacity: 0.75 }}>Admin Panel - User Management</p></div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '15px' }}>
            Welcome, <strong>{adminEmail}</strong>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="admin-stat-card bg-primary-grad"><h3>{users.length}</h3><p>Total Users</p></div>
          <div className="admin-stat-card bg-success-grad"><h3>{activeCount}</h3><p>Active Users</p></div>
          <div className="admin-stat-card bg-warning-grad"><h3>{archivedCount}</h3><p>Archived Users</p></div>
          <div className="admin-stat-card bg-secondary-grad"><h3>{adminCount}</h3><p>Admin Users</p></div>
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '25px' }}>
          <button className={`admin-filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Active Users</button>
          <button className={`admin-filter-btn ${filter === 'archived' ? 'active' : ''}`} onClick={() => setFilter('archived')}>Archived Users</button>
          <button className={`admin-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Users</button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr><th>Username</th><th>Email</th><th>Status</th><th>Type</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {displayedUsers.map(user => (
                <tr key={user._id} className={user.deletedAt ? 'archived-row' : ''}>
                  <td><strong>{user.username}</strong></td>
                  <td>{user.email}</td>
                  <td><span className={`admin-badge ${user.deletedAt ? 'bg-danger' : 'bg-success'}`}>{user.deletedAt ? 'Archived' : 'Active'}</span></td>
                  <td><span className={`admin-badge ${user.role === 'admin' ? 'bg-info' : 'bg-secondary'}`}>{user.role === 'admin' ? 'Administrator' : 'User'}</span></td>
                  <td style={{ display: 'flex', gap: '10px' }}>
                    {user.deletedAt ? (
                      <>
                        <button className="admin-btn admin-btn-success" onClick={() => handleAction('restore', user._id, user.username)}>Restore</button>
                        {user.role !== 'admin' && <button className="admin-btn admin-btn-danger" onClick={() => handleAction('delete', user._id, user.username)}>Delete</button>}
                      </>
                    ) : (
                      <>
                        {user.role !== 'admin' && <Link to={`/admin/user/${user._id}`} className="admin-btn admin-btn-warning" style={{ textDecoration: 'none' }}>View</Link>}
                        {user.role !== 'admin' && <button className="admin-btn admin-btn-danger" onClick={() => handleAction('archive', user._id, user.username)}>Archive</button>}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}