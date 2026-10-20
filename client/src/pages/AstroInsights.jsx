import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import PHILIPPINE_LOCATIONS from '../data/philippineLocations.json';
import '../styles/AstroInsights.css';

const SIGN_DESCRIPTIONS = {
  Aries: 'Bold, direct, and driven to begin new things with courage.',
  Taurus: 'Patient and reliable, you build lasting foundations with steady determination.',
  Gemini: 'Curious and adaptable, you connect ideas through communication and learning.',
  Cancer: 'Sensitive and protective, you create belonging through care and emotional depth.',
  Leo: 'Creative and warm-hearted, you bring confidence, generosity, and radiant presence.',
  Virgo: 'Analytical and precise, you improve what you touch through practical wisdom and care.',
  Libra: 'Diplomatic and graceful, you seek harmony, beauty, and meaningful connection.',
  Scorpio: 'Intense and perceptive, you pursue truth, transformation, and emotional honesty.',
  Sagittarius: 'Adventurous and hopeful, you grow through freedom, discovery, and big-picture vision.',
  Capricorn: 'Focused and responsible, you turn patience and ambition into lasting achievement.',
  Aquarius: 'Independent and original, you imagine better possibilities and challenge old patterns.',
  Pisces: 'Compassionate and imaginative, you move through life with intuition and spiritual sensitivity.'
};

const SIGN_TRAITS = {
  Aries: ['You act with courage and initiative.', 'You prefer direct answers and visible progress.', 'Your growth comes from balancing independence with patience.'],
  Taurus: ['You build lasting foundations through patience and consistency.', 'You value comfort, loyalty, and tangible results.', 'Your growth comes from staying open when life asks you to change.'],
  Gemini: ['You learn quickly and connect people, ideas, and information.', 'Conversation and variety keep your mind engaged.', 'Your growth comes from focusing your curiosity into clear priorities.'],
  Cancer: ['You are protective, intuitive, and deeply responsive to your environment.', 'A sense of belonging gives you the confidence to move forward.', 'Your growth comes from caring for yourself as carefully as you care for others.'],
  Leo: ['You bring warmth, creativity, and natural presence wherever you go.', 'Recognition matters because you give your whole heart to what you create.', 'Your growth comes from leading generously without needing constant approval.'],
  Virgo: ['You notice what needs improving and have the skill to make it better.', 'Practical service, precision, and useful results matter to you.', 'Your growth comes from allowing progress to be good enough before perfection.'],
  Libra: ['You seek fairness, beauty, and cooperation in the way you move through life.', 'You understand different perspectives and can create common ground.', 'Your growth comes from making clear choices instead of waiting for perfect balance.'],
  Scorpio: ['You read beneath the surface and take meaningful commitments seriously.', 'Intensity gives you focus, resilience, and emotional honesty.', 'Your growth comes from trusting others without giving away your power.'],
  Sagittarius: ['You grow through exploration, truth-seeking, and wider perspective.', 'Hope and humor help you recover quickly and keep moving.', 'Your growth comes from pairing freedom with follow-through.'],
  Capricorn: ['You turn patience, structure, and ambition into measurable progress.', 'Responsibility is a strength when it serves a meaningful goal.', 'Your growth comes from making room for rest, play, and emotional openness.'],
  Aquarius: ['You think independently and notice possibilities others may overlook.', 'Community and originality are central to how you contribute.', 'Your growth comes from letting your ideas stay connected to your feelings.'],
  Pisces: ['You move through life with empathy, imagination, and strong intuition.', 'You are sensitive to symbolism, atmosphere, and the needs of others.', 'Your growth comes from giving your compassion healthy boundaries.']
};

const PLANET_THEMES = {
  Sun: 'identity, confidence, and life direction',
  Moon: 'emotional needs, instincts, and sense of safety',
  Mercury: 'thinking style, communication, and decision-making',
  Venus: 'love language, values, and what brings you pleasure',
  Mars: 'motivation, courage, desire, and how you take action',
  Jupiter: 'growth, opportunity, faith, and the way you learn',
  Saturn: 'responsibility, boundaries, discipline, and long-term mastery',
  Uranus: 'independence, innovation, and the changes you are meant to make',
  Neptune: 'imagination, compassion, spirituality, and intuition',
  Pluto: 'deep transformation, power, and personal renewal',
  'North Node': 'growth, direction, and the qualities you are developing',
  Lilith: 'independence, boundaries, and the parts of yourself you reclaim',
  Chiron: 'healing, vulnerability, and wisdom earned through experience'
};

const HOUSE_AREAS = {
  1: 'identity and first impressions',
  2: 'money, personal values, and self-worth',
  3: 'communication, learning, and your close community',
  4: 'home, family, roots, and emotional foundations',
  5: 'creativity, romance, joy, and self-expression',
  6: 'daily routines, health, work, and practical service',
  7: 'partnerships, commitment, and one-to-one relationships',
  8: 'intimacy, shared resources, healing, and transformation',
  9: 'beliefs, higher learning, travel, and wider perspective',
  10: 'career, public reputation, and long-term achievement',
  11: 'friendships, communities, dreams, and future goals',
  12: 'rest, spirituality, the subconscious, and private healing'
};
const HOUSE_PROFILES = {
  1: ['Identity, appearance, and new beginnings', 'How you enter situations and make a first impression'],
  2: ['Values, resources, and security', 'Money, possessions, self-worth, and personal priorities'],
  3: ['Communication, learning, and siblings', 'Your everyday thinking, conversations, and close environment'],
  4: ['Home, family, and emotional foundations', 'Your roots, private life, and sense of belonging'],
  5: ['Creativity, romance, and joy', 'Self-expression, pleasure, dating, and the things you create'],
  6: ['Daily routines, health, and service', 'Work habits, practical responsibilities, and sustainable wellbeing'],
  7: ['Partnerships, marriage, and relationships', 'Committed one-to-one bonds and what you seek in others'],
  8: ['Transformation and shared resources', 'Intimacy, trust, healing, and resources shared with others'],
  9: ['Philosophy, travel, and higher learning', 'Beliefs, meaning, study, and experiences that widen your world'],
  10: ['Career, public image, and life direction', 'Achievement, reputation, leadership, and your visible contribution'],
  11: ['Friendships, community, and hopes', 'Networks, collaboration, future goals, and social belonging'],
  12: ['Spirituality, solitude, and hidden strengths', 'Rest, the subconscious, closure, and private renewal']
};
const SIGN_MEANINGS = {
  Aries: 'Courage, initiative, and pioneering spirit',
  Taurus: 'Stability, patience, and sensual pleasures',
  Gemini: 'Curiosity, adaptability, and communication',
  Cancer: 'Nurturing, emotional depth, and intuition',
  Leo: 'Creativity, warmth, and natural leadership',
  Virgo: 'Analysis, precision, and service',
  Libra: 'Harmony, partnership, and beauty',
  Scorpio: 'Intensity, transformation, and depth',
  Sagittarius: 'Adventure, optimism, and wisdom',
  Capricorn: 'Ambition, discipline, and mastery',
  Aquarius: 'Innovation, humanity, and uniqueness',
  Pisces: 'Compassion, artistry, and spirituality'
};
const SIGN_ELEMENTS = { Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire', Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth', Gemini: 'Air', Libra: 'Air', Aquarius: 'Air', Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water' };
const SIGN_MODALITIES = { Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal', Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed', Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable' };
const INSIGHT_VERSION = 5;

const getTriplicityDescription = (role, sign, fallback) => {
  const traits = SIGN_TRAITS[sign];
  if (!traits) return [`${sign || 'Your sign'} ${role} ${fallback}`];
  return traits;
};

const getPlanetDescription = (planet) => {
  const theme = PLANET_THEMES[planet.name] || 'your personal growth and self-expression';
  const area = HOUSE_AREAS[planet.house] || 'an important area of your life';
  const traits = SIGN_TRAITS[planet.sign] || ['This placement gives your energy a distinct style.', 'Its expression becomes clearer through lived experience.', 'Use it consciously as part of your wider chart.'];
  return `${planet.name} in ${planet.sign} focuses your ${theme}. In House ${planet.house}, that energy is expressed through ${area}. ${traits[0]} ${traits[2]}`;
};

const getHouseDescription = (house) => {
  const area = HOUSE_AREAS[house.number] || 'a meaningful area of your life';
  const traits = SIGN_TRAITS[house.sign] || ['This sign gives the house a distinct style.', 'Its themes develop through your personal experience.', 'Awareness helps you use this area intentionally.'];
  return `House ${house.number} governs ${area}. With ${house.sign} on its cusp, ${traits[0]} ${traits[1]}`;
};

const formatPosition = (placement) => {
  if (!placement?.sign) return '';
  const degrees = placement.degrees ?? 0;
  return `${placement.sign} ${degrees}°${placement.minutes ? ` ${placement.minutes}'` : ''}`;
};

const getBalance = (planets, dictionary) => {
  const counts = Object.values(dictionary).reduce((result, value) => ({ ...result, [value]: 0 }), {});
  (planets || []).forEach((planet) => {
    const group = dictionary[planet.sign];
    if (group) counts[group] += 1;
  });
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0) || 1;
  return Object.entries(counts).map(([name, count]) => `${name}: ${count} (${Math.round((count / total) * 100)}%)`).join(' • ');
};

const getLifePurpose = (chart) => {
  const sun = chart?.sun_sign || 'your Sun sign';
  const moon = chart?.moon_sign || 'your Moon sign';
  const rising = chart?.rising_sign || 'your Ascendant';
  return `Your ${sun} Sun gives you a clear way to develop your talents and direction. Your ${moon} Moon shows the emotional values that keep you grounded, while your ${rising} Ascendant describes how you bring that purpose into the world. Your path is to turn those three energies into choices that are both authentic and useful.`;
};

export default function AstroInsights() {
  const [userData, setUserData] = useState(null);
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthCity, setBirthCity] = useState('');
  const [birthProvince, setBirthProvince] = useState('');
  const cities = (PHILIPPINE_LOCATIONS.find((item) => item.province === birthProvince)?.cities || [])
    .map((city) => city.replace(/^City of\s+/i, '').trim());
  const [showForm, setShowForm] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');

  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [housesLoading, setHousesLoading] = useState(false);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const [year, month, day] = String(isoString).split('T')[0].split('-').map(Number);
    if (!year || !month || !day) return isoString;
    return new Date(year, month - 1, day).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
          newData.enhancement_version = INSIGHT_VERSION;
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
      if (res.data.cached) {
        if (res.data.chart.enhancement_version === INSIGHT_VERSION) {
          setHousesLoading(false);
        } else {
          await enhanceWithGemini(res.data.chart);
        }
        return;
      }
      try {
        await API.put('/astro/chart', { chart: res.data.chart });
      } catch (saveError) {
        console.error('Unable to cache astro chart:', saveError);
      }
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
      const savedPlaceParts = String(currentUser.birth_place || '').split(',');
      setBirthCity(savedPlaceParts.shift()?.trim() || '');
      setBirthProvince(savedPlaceParts.join(',').trim());
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
    const city = birthCity.trim();
    const province = birthProvince.trim();
    if (!city || !province) {
      setError('Enter both your birth city and province for an accurate chart.');
      return;
    }
    const fullBirthPlace = `${city}, ${province}`;
    setIsLoading(true);
    setError('');
    try {
      const { data } = await API.post('/astro/save-birth-details', { birthTime, birthCity: city, birthProvince: province });
      const updatedUser = data.user;
      localStorage.setItem('celesticare_user', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      setBirthPlace(fullBirthPlace);
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
              <label className="ai-label" htmlFor="birth-province">Birth Province</label>
              <select id="birth-province" value={birthProvince} onChange={(e) => { setBirthProvince(e.target.value); setBirthCity(''); setError(''); }} required className="ai-input">
                <option value="">Choose a province</option>
                {PHILIPPINE_LOCATIONS.map(({ province }) => <option key={province} value={province}>{province}</option>)}
              </select>
            </div>
            <div className="ai-input-group">
              <label className="ai-label" htmlFor="birth-city">Birth City or Town</label>
              <select id="birth-city" value={birthCity} onChange={(e) => { setBirthCity(e.target.value); setError(''); }} required className="ai-input" disabled={!birthProvince || cities.length === 0}>
                <option value="">{!birthProvince ? 'Choose a province first' : 'Choose a city or town'}</option>
                {cities.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
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
        <p className="ai-section-description">Your Sun, Moon, and Ascendant reveal your core identity, emotional world, and the energy you bring into the world.</p>
        <div className="ai-grid-3">
          <div className="ai-card ai-triplicity-card">
            <h3 className="ai-card-title">The Sun</h3>
            <ul className="ai-reading-list">{getTriplicityDescription('expresses your core identity and life direction.', chartData?.sun_sign, 'Your Sun reflects your identity, vitality, and the purpose you are growing into.').map((line) => <li key={line}>{line}</li>)}</ul>
            <div className="ai-card-value">{chartData?.sun_sign} {chartData?.sun_degrees}°</div>
          </div>
          <div className="ai-card ai-triplicity-card">
            <h3 className="ai-card-title">The Moon</h3>
            <ul className="ai-reading-list">{getTriplicityDescription('describes your emotional needs and private inner world.', chartData?.moon_sign, 'Your Moon reflects your emotional needs, instincts, and private inner world.').map((line) => <li key={line}>{line}</li>)}</ul>
            <div className="ai-card-value">{chartData?.moon_sign}</div>
          </div>
          <div className="ai-card ai-triplicity-card">
            <h3 className="ai-card-title">The Ascendant</h3>
            <ul className="ai-reading-list">{getTriplicityDescription('shapes your first impression and the way you approach new experiences.', chartData?.rising_sign, 'Your Ascendant shapes your first impression and the way you approach new experiences.').map((line) => <li key={line}>{line}</li>)}</ul>
            <div className="ai-card-value">{chartData?.rising_sign} {chartData?.rising_degrees ?? 0}°</div>
          </div>
        </div>

        {/* Planetary Placements Section */}
        <h2 className="ai-section-title">Planetary Placements</h2>
        <p className="ai-section-description">Each planet represents a different part of your life, while its sign and house show how that energy is expressed.</p>
        <div className="ai-grid-responsive">
          {chartData?.planets?.map((planet, index) => (
            <div key={index} className="ai-card ai-flex-between">
              <div className="ai-card-heading">
                <h3 className="ai-card-title"><span className="ai-planet-symbol">{planet.symbol}</span>{planet.name}</h3>
                <span className="ai-badge">House {planet.house}</span>
              </div>
              <div className="ai-planet-pos">{formatPosition(planet)}</div>
              <div className="ai-insight-box">
                {getPlanetDescription(planet)}
              </div>
            </div>
          ))}
        </div>

        {/* Houses */}
        <h2 className="ai-section-title">The Twelve Celestial Houses</h2>
        <p className="ai-section-description">The twelve houses map the major areas of life, from identity and relationships to purpose, growth, and long-term goals.</p>
        {housesLoading ? (
          <div className="ai-loader-center">
            <div className="ai-spinner-small"></div>
            <h3 className="ai-loader-heading">The Houses Are Aligning</h3>
          </div>
        ) : (
          <div className="ai-grid-responsive ai-house-grid">
            {[...(chartData?.houses || [])].sort((a, b) => Number(a.number) - Number(b.number)).map((house) => (
              <div key={house.number} className="ai-card ai-flex-between">
                <div className="ai-card-heading ai-house-card-heading">
                  <span className="ai-badge">House {house.number}</span>
                  <h3 className="ai-card-title">{house.sign} <span className="ai-house-degree">{house.degrees}°</span></h3>
                </div>
                <div className="ai-house-topic">{HOUSE_PROFILES[house.number]?.[0]}</div>
                {(house.insight || house.sign) && (
                  <div className="ai-insight-box">
                    <strong>{SIGN_MEANINGS[house.sign] || HOUSE_PROFILES[house.number]?.[1]}</strong>
                    {house.insight && <small className="ai-ai-note">AI context: {house.insight}</small>}
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

        {!chartData?.element_balance && !chartData?.modal_balance && (
          <div className="ai-grid-2">
            <div className="ai-card">
              <h3 className="ai-balance-title">Elemental Balance</h3>
              <p className="ai-balance-desc">{getBalance(chartData?.planets, SIGN_ELEMENTS)}</p>
            </div>
            <div className="ai-card">
              <h3 className="ai-balance-title">Modality Balance</h3>
              <p className="ai-balance-desc">{getBalance(chartData?.planets, SIGN_MODALITIES)}</p>
            </div>
          </div>
        )}

        {/* Life Purpose */}
        {chartData && (
          <div className="ai-purpose-box">
            <h2 className="ai-purpose-title">🌙 Your Cosmic Purpose</h2>
            <p className="ai-purpose-text">{chartData.life_purpose || getLifePurpose(chartData)}</p>
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
