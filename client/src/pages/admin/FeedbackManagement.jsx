import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import '../../styles/Admin.css';

export default function FeedbackManagement() {
  const [feedback, setFeedback] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    API.get('/feedback/admin')
      .then((res) => {
        if (active) setFeedback(res.data.data || []);
      })
      .catch(() => {
        if (active) setError('Unable to load feedback right now.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const filteredFeedback = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return feedback;

    return feedback.filter((entry) => {
      const username = entry.user?.username || '';
      const email = entry.user?.email || '';
      return `${username} ${email}`.toLowerCase().includes(query);
    });
  }, [feedback, search]);

  return (
    <div className="admin-body">
      <div className="admin-bg-accent one"></div>
      <div className="admin-bg-accent two"></div>

      <div className="container admin-page-container">
        <div className="admin-header">
          <div>
            <h1 style={{ margin: 0, fontWeight: 700, letterSpacing: '2px' }}>USER FEEDBACK</h1>
            <p style={{ margin: 0, opacity: 0.75 }}>Review all feedback submitted by users</p>
          </div>
          <Link to="/admin/dashboard" className="admin-btn admin-header-link">← Back to Users</Link>
        </div>

        <section className="admin-table-container feedback-page-card">
          <div className="feedback-page-toolbar">
            <div>
              <h2 style={{ margin: 0 }}>All Feedback</h2>
              <p className="feedback-page-count">
                Showing {filteredFeedback.length} of {feedback.length} submission{feedback.length === 1 ? '' : 's'}
              </p>
            </div>
            <input
              className="admin-feedback-search"
              type="search"
              aria-label="Search feedback by username or email"
              placeholder="Search username or email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {error && <p className="admin-feedback-error">{error}</p>}
          {loading && <p className="admin-feedback-empty">Loading feedback…</p>}
          {!loading && !error && !filteredFeedback.length && (
            <p className="admin-feedback-empty">
              {feedback.length ? 'No feedback matches your search.' : 'No feedback submitted yet.'}
            </p>
          )}

          {!loading && !error && filteredFeedback.length > 0 && (
            <div className="admin-feedback-list">
              {filteredFeedback.map((entry) => (
                <article className="admin-feedback-entry" key={entry._id}>
                  <div className="admin-feedback-user">
                    <div>
                      <strong>{entry.user?.username || 'Username unavailable'}</strong>
                      <span>{entry.user?.email || 'Email unavailable'}</span>
                    </div>
                    <time dateTime={entry.createdAt}>
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : 'Date unavailable'}
                    </time>
                  </div>
                  <div className="admin-feedback-grid">
                    <div><strong>Experience</strong><span>{entry.experience || '—'}</span></div>
                    <div><strong>Fashion match</strong><span>{entry.fashion_match || '—'}</span></div>
                    <div><strong>Favorite feature</strong><span>{entry.favorite_feature || '—'}</span></div>
                    <div><strong>Vibe</strong><span>{entry.vibe || '—'}</span></div>
                    <div className="admin-feedback-suggestions"><strong>Suggestions</strong><span>{entry.suggestions || '—'}</span></div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
