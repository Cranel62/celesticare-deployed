import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import '../../styles/Tarot.css';

export default function TarotHome() {
  const [recentReading, setRecentReading] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Generate star background
    const starsContainer = document.getElementById('stars');
    if (starsContainer && starsContainer.children.length === 0) {
      for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 4}s`;
        star.style.animationDuration = `${2 + Math.random() * 3}s`;
        starsContainer.appendChild(star);
      }
    }

    // Check for recent reading
    const token = localStorage.getItem('celesticare_token');
    if (token) {
      API.get('/tarot/recent')
        .then(res => {
          if (res.data.hasRecent) {
            setRecentReading(res.data.recent);
          }
        })
        .catch(err => console.error('Recent reading check failed:', err));
    }
  }, []);

  return (
    <div className="tarot-body">
      <div className="stars" id="stars"></div>

      {recentReading && !dismissed && (
        <div className="recent-reading-banner" style={{ position: 'fixed', top: '90px', zIndex: 1000 }}>
          <div className="recent-reading-content" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 1.5rem', background: 'rgba(138, 106, 154, 0.3)', backdropFilter: 'blur(12px)', borderRadius: '40px', border: '1px solid #b59dab' }}>
            <span style={{ fontSize: '1.8rem' }}>{recentReading.reading_type === 'single' ? '🔮' : '❤️'}</span>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '1rem', color: '#f0d0f0', fontFamily: 'Cinzel' }}>Continue Your Reading</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#d0b0d0' }}>
                You have a {recentReading.reading_type === 'single' ? 'Single Card' : 'Heart, Head & Path'} reading from {new Date(recentReading.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Link
              to={recentReading.reading_type === 'single' ? `/tarot/single-result/${recentReading.id}` : `/tarot/four-result?reading_id=${recentReading.id}`}
              className="return-button"
              style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem' }}
            >
              Continue Reading →
            </Link>
            <button
              onClick={() => setDismissed(true)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="tarot-container">
        <div className="tarot-header" style={{ marginTop: '8vh' }}>
          <h1 style={{ fontSize: '4.5rem', filter: 'drop-shadow(0 0 20px #8a6a4a)' }}>🔮</h1>
          <h1 style={{ fontFamily: 'Cinzel', fontSize: '2.8rem' }}>The Cards of Fate</h1>
          <p>Choose your path to mystic guidance</p>
        </div>

        <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '2rem' }}>
          <Link to="/tarot/single" style={{ textDecoration: 'none' }}>
            <div className="info-panel" style={{ textAlign: 'center', width: '320px', cursor: 'pointer', transition: 'transform 0.3s' }}>
              <h2 style={{ color: '#d0b0d0', fontFamily: 'Cinzel', marginBottom: '1rem' }}>Single Card</h2>
              <p style={{ color: '#b59dab', lineHeight: 1.6 }}>Draw one card for daily guidance, immediate style inspiration, and quick clarity.</p>
            </div>
          </Link>

          <Link to="/tarot/four" style={{ textDecoration: 'none' }}>
            <div className="info-panel" style={{ textAlign: 'center', width: '320px', cursor: 'pointer', transition: 'transform 0.3s' }}>
              <h2 style={{ color: '#d0b0d0', fontFamily: 'Cinzel', marginBottom: '1rem' }}>Heart, Head & Path</h2>
              <p style={{ color: '#b59dab', lineHeight: 1.6 }}>A deep four-card spread revealing inner tensions and guiding your aesthetic journey.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}