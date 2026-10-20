import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { assetUrl } from '../utils/assetUrls';
import { determineSeason, getUndertonePalette, undertoneDescriptions } from '../data/undertoneAnalysis';
import '../styles/Undertone.css';

const readStorageObject = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
};

export default function UndertoneResult() {
  const navigate = useNavigate();
  const token = localStorage.getItem('celesticare_token');
  const [profile, setProfile] = useState(() => token
    ? readStorageObject('celesticare_user')
    : readStorageObject('celesticare_onboarding'));
  const [profileReady, setProfileReady] = useState(!token);

  useEffect(() => {
    if (!token) return;

    let active = true;
    API.get('/auth/me').then(({ data }) => {
      if (!active) return;
      setProfile(data.user || {});
      localStorage.setItem('celesticare_user', JSON.stringify(data.user || {}));
      setProfileReady(true);
    }).catch(() => {
      if (active) setProfileReady(true);
    });

    return () => { active = false; };
  }, [token]);

  const undertone = String(profile.undertone || '').toLowerCase();
  const zodiacSign = profile.zodiac_sign || '';

  useEffect(() => {
    if (profileReady && (!undertone || !zodiacSign)) {
      navigate('/undertone-test', { replace: true });
    }
  }, [undertone, zodiacSign, navigate, profileReady]);

  if (!profileReady || !undertone || !zodiacSign) return null;

  const palette = getUndertonePalette(zodiacSign, undertone);
  const wheelImage = assetUrl(`/src/pages/undertone/assets/${undertone}_wheel.png`);
  const season = determineSeason(zodiacSign, undertone);

  return (
    <div className="undertoneresult-body">
      <div className="undertoneresult-quiz-box">
        <h1>CELESTICARE</h1>

        <div className="undertoneresult-result-section">
          <div className="undertoneresult-image-box">
            <img src={wheelImage} alt={`${undertone} Wheel`} className="undertoneresult-wheel" draggable="false" />
            <div className="undertoneresult-info-box">
              {zodiacSign}'s undertone gives insight into the best colors for your style and wardrobe.
            </div>
          </div>

          <div className="undertoneresult-text-box">
            <h2>{zodiacSign} with a {undertone} undertone</h2>

            <div className="undertoneresult-info-box undertoneresult-season-box">
              <strong>Your Season: {season}</strong>
            </div>

            <div className="undertoneresult-palette" aria-label={`${zodiacSign} ${undertone} color palette`}>
              {palette.map((color) => (
                <div key={color} className="undertoneresult-color-box" style={{ backgroundColor: color }}></div>
              ))}
            </div>

            <p style={{ marginTop: '10px', fontSize: '1rem', color: '#d0cce6' }}>
              {undertoneDescriptions[undertone] || 'Discover your unique color palette!'}
            </p>
            <div className="undertoneresult-info-box">
              These colors complement your undertone perfectly and can enhance your natural glow.
            </div>
          </div>
        </div>

        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <button className="undertoneresult-btn-edit" onClick={() => navigate('/undertone-test')}>
            Edit Choice
          </button>
          <button className="undertoneresult-btn-action" onClick={() => navigate(token ? '/dashboard' : '/register')}>
            {token ? 'Continue to Dashboard' : 'Create Account to Save Results'}
          </button>
        </div>
      </div>
    </div>
  );
}
