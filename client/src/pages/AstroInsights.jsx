import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import '../styles/AstroInsights.css';

export default function AstroInsights() {
  const [userData, setUserData] = useState(null);
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');
  
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [housesLoading, setHousesLoading] = useState(false);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const enhanceWithGemini = useCallback(async (basicChart) => {
    setIsGeminiLoading(true);
    try {
      const res = await API.post('/astro/enhance-chart', { chartData: basicChart });
      if (res.data.success && res.data.enhancedData) {
        const enhanced = res.data.enhancedData;
        setChartData(prev => {
          if (!prev) return prev;
          const newData = { ...prev };
          if (enhanced.houses) {
            newData.houses = newData.houses.map(house => ({
              ...house,
              ...enhanced.houses.find(item => item.number === house.number),
            }));
          }
          if (enhanced.planets) {
            newData.planets = newData.planets.map(planet => ({
              ...planet,
              ...enhanced.planets.find(item => item.name === planet.name),
            }));
          }
          if (enhanced.life_purpose) newData.life_purpose = enhanced.life_purpose;
          if (enhanced.element_balance) newData.element_balance = enhanced.element_balance;
          if (enhanced.modal_balance) newData.modal_balance = enhanced.modal_balance;
          return newData;
        });
      }
    } catch (err) {
      console.error('Gemini error:', err);
    } finally {
      setHousesLoading(false);
      setIsGeminiLoading(false);
    }
  }, []);

  const generateAIChat = useCallback(async () => {
    setIsLoading(true);
    setHousesLoading(true);
    setError('');

    try {
      const res = await API.post('/astro/generate-chart', {});

      if (!res.data.success || !res.data.chart) throw new Error('The chart service returned no chart data.');
      setChartData(res.data.chart);
      setIsLoading(false);
      await enhanceWithGemini(res.data.chart);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to generate your chart. Please try again.');
      setIsLoading(false);
      setHousesLoading(false);
    }
  }, [enhanceWithGemini]);

  useEffect(() => {
    API.get('/auth/me').then(({ data }) => {
      const currentUser = data.user;
      localStorage.setItem('celesticare_user', JSON.stringify(currentUser));
      setUserData(currentUser);
      setBirthTime(currentUser.birth_time || '');
      setBirthPlace(currentUser.birth_place || '');

      if (currentUser.birthdate && currentUser.birth_time && currentUser.birth_place) {
        setShowForm(false);
        generateAIChat();
      } else {
        setShowForm(true);
        setIsLoading(false);
        if (!currentUser.birthdate) {
          setError('Add your birth date in Profile Settings before generating your chart.');
        }
      }
    }).catch((err) => {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Unable to load your saved birth details.');
    });
  }, [generateAIChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { data } = await API.post('/astro/save-birth-details', { birthTime, birthPlace });
      const updatedUser = data.user;
      localStorage.setItem('celesticare_user', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      setShowForm(false);
      await generateAIChat();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save your birth details.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="ai-body">
        <div className="ai-loading-container">
            <div className="ai-spinner"></div>
            <h2 className="ai-loading-title">CONSULTING THE COSMOS</h2>
            <p className="ai-loading-subtitle">The stars are aligning for you</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="ai-body">
        <div className="ai-glass-box">
          <h1 className="ai-form-title">Your Birth Details</h1>
          <p className="ai-form-desc">Enter the time and place you entered the world</p>
          <p className="ai-back-link-wrapper">
            <Link to="/dashboard" className="ai-back-link">← Back to Dashboard</Link>
          </p>
          {error && <div role="alert" className="ai-error-alert">{error}</div>}
          {!userData?.birthdate && <p className="ai-profile-link-wrapper"><Link to="/profile" className="ai-link">Add your birth date in Profile Settings</Link></p>}
          
          <form onSubmit={handleSubmit} className="ai-form">
            <div className="ai-input-group">
              <label className="ai-label">Birth Time (e.g. 14:30)</label>
              <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} required className="ai-input" />
            </div>
            <div className="ai-input-group">
              <label className="ai-label">Birth Place</label>
              <input type="text" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} placeholder="City, Province" required className="ai-input" />
            </div>
            <button type="submit" disabled={isLoading || !userData?.birthdate} className="ai-btn-primary">
              Reveal My Insights
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-body">
      <div className="ai-container">
        
        {/* Header */}
        <div className="ai-header">
          <h1 className="ai-header-title">{userData?.name || 'Your'}'s Astro Insights</h1>
          <p className="ai-header-meta">{formatDate(userData?.birthdate)} • {birthTime} • {birthPlace}</p>
          <div className="ai-header-actions">
            <button onClick={() => setShowForm(true)} className="ai-btn-secondary">Edit Details</button>
            <Link to="/dashboard" className="ai-btn-outline">Back to Dashboard</Link>
          </div>
        </div>

        {error && <div role="alert" className="ai-error-banner">
          <p className="ai-error-text">{error}</p>
          <button onClick={generateAIChat} className="ai-btn-primary">Retry chart</button>
        </div>}

        {/* The Sacred Triplicity */}
        <h2 className="ai-section-title">The Sacred Triplicity</h2>
        <div className="ai-grid-3">
          <div className="ai-card">
            <div className="ai-card-subtitle">The Sun</div>
            <div className="ai-card-value">{chartData?.sun_sign} {chartData?.sun_degrees}°</div>
          </div>
          <div className="ai-card">
            <div className="ai-card-subtitle">The Moon</div>
            <div className="ai-card-value">{chartData?.moon_sign}</div>
          </div>
          <div className="ai-card">
            <div className="ai-card-subtitle">The Ascendant</div>
            <div className="ai-card-value">{chartData?.rising_sign}</div>
          </div>
        </div>

        {/* Planetary Placements Section */}
        <h2 className="ai-section-title">Planetary Placements</h2>
        <div className="ai-grid-responsive">
          {chartData?.planets?.map((planet, index) => (
            <div key={index} className="ai-card ai-flex-between">
              <div className="ai-row-between">
                <span className="ai-planet-name">{planet.symbol} {planet.name}</span>
                <span className="ai-badge">House {planet.house}</span>
              </div>
              <div className="ai-planet-pos">{planet.sign} {planet.degrees}°</div>
              {planet.influence && (
                <div className="ai-insight-box">
                  {planet.influence}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Houses */}
        <h2 className="ai-section-title">The Twelve Celestial Houses</h2>
        {housesLoading ? (
          <div className="ai-loader-center">
            <div className="ai-spinner-small"></div>
            <h3 className="ai-loader-heading">The Houses Are Aligning</h3>
          </div>
        ) : (
          <div className="ai-grid-responsive">
            {chartData?.houses?.map((house) => (
              <div key={house.number} className="ai-card ai-flex-between">
                <div className="ai-row-between">
                  <span className="ai-badge">House {house.number}</span>
                  <span className="ai-house-pos">{house.sign} {house.degrees}°</span>
                </div>
                {house.insight && (
                  <div className="ai-insight-box">
                    <span className="ai-insight-tag">✧ AI INSIGHT</span>
                    {house.insight}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Element & Modal Balance Section */}
        {(chartData?.element_balance || chartData?.modal_balance) && (
          <div className="ai-grid-2">
            {chartData?.element_balance && (
              <div className="ai-card">
                <h3 className="ai-balance-title">🔥 Elemental Balance</h3>
                <p className="ai-balance-desc">{chartData.element_balance}</p>
              </div>
            )}
            {chartData?.modal_balance && (
              <div className="ai-card">
                <h3 className="ai-balance-title">⚖️ Modality Balance</h3>
                <p className="ai-balance-desc">{chartData.modal_balance}</p>
              </div>
            )}
          </div>
        )}

        {/* Life Purpose */}
        {chartData?.life_purpose && (
          <div className="ai-purpose-box">
            <h2 className="ai-purpose-title">🌙 Your Cosmic Purpose</h2>
            <p className="ai-purpose-text">{chartData.life_purpose}</p>
          </div>
        )}

        {/* Gemini Loading Indicator */}
        {isGeminiLoading && (
          <div className="ai-floating-badge">
            ✨ Consulting the cosmos...
          </div>
        )}

      </div>
    </div>
  );
}