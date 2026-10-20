import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { assetUrl } from '../utils/assetUrls';
import '../styles/Undertone.css';

export default function UndertoneTest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSelection = async (tone) => {
    const onboardingData = JSON.parse(localStorage.getItem('celesticare_onboarding') || '{}');
    const currentUser = JSON.parse(localStorage.getItem('celesticare_user') || '{}');
    const zodiacSign = onboardingData.zodiac_sign || currentUser.zodiac_sign;

    // The original flow requires a zodiac sign before saving color analysis.
    if (!zodiacSign) {
      navigate('/zodiac-result');
      return;
    }

    if (!['cool', 'neutral', 'warm'].includes(tone)) return;
    setLoading(true);
    onboardingData.zodiac_sign = zodiacSign;
    onboardingData.undertone = tone;
    localStorage.setItem('celesticare_onboarding', JSON.stringify(onboardingData));

    // Also update current user object in localStorage if present so data is complete instantly
    if (currentUser && Object.keys(currentUser).length > 0) {
      currentUser.undertone = tone;
      currentUser.zodiac_sign = zodiacSign;
      localStorage.setItem('celesticare_user', JSON.stringify(currentUser));
    }

    try {
      if (localStorage.getItem('celesticare_token')) {
        const { data: response } = await API.put('/auth/update-undertone', {
          undertone: tone,
          zodiac_sign: zodiacSign
        });
        localStorage.setItem('celesticare_user', JSON.stringify(response.user));
      }
      
      // Ensure it smoothly transitions directly to the undertone result page with complete input
      setTimeout(() => {
        setLoading(false);
        navigate('/undertone-result');
      }, 500);

    } catch (error) {
      setLoading(false);
      alert(error.response?.data?.message || 'Unable to save your color analysis. Please try again.');
    }
  };

  return (
    <div className="undertonetest-body">
      <div className="undertonetest-quiz-box">
        <h1>Let's know your undertone</h1>
        <p>Check the color of your veins on your wrist and tap the image that matches your skin tone.</p>

        <div className="undertonetest-images">
          <div className="undertonetest-image-wrapper" onClick={() => handleSelection('cool')}>
            <div className="undertonetest-image-option" style={{ backgroundImage: `url(${assetUrl('/src/pages/undertone/assets/cool_skin.png')})` }}></div>
            <div className="undertonetest-label">Cool</div>
          </div>
          <div className="undertonetest-image-wrapper" onClick={() => handleSelection('neutral')}>
            <div className="undertonetest-image-option" style={{ backgroundImage: `url(${assetUrl('/src/pages/undertone/assets/neutral_skin.png')})` }}></div>
            <div className="undertonetest-label">Neutral</div>
          </div>
          <div className="undertonetest-image-wrapper" onClick={() => handleSelection('warm')}>
            <div className="undertonetest-image-option" style={{ backgroundImage: `url(${assetUrl('/src/pages/undertone/assets/warm_skin.png')})` }}></div>
            <div className="undertonetest-label">Warm</div>
          </div>
        </div>

        <div className="undertonetest-notes">
          <div className="undertonetest-note">• Use daylight for best accuracy to see your vein color clearly.</div>
          <div className="undertonetest-note">• Gold jewelry suits warm undertones, silver suits cool. Both look good? You may be neutral.</div>
        </div>
      </div>

      {loading && (
        <div className="undertonetest-loader-overlay">
          <div className="undertonetest-spinner-box">
            <div className="undertonetest-spinner"></div>
            <p>Analyzing your undertone and finalizing your results...</p>
          </div>
        </div>
      )}
    </div>
  );
}
