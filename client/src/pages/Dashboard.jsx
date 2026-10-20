import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import '../styles/Dashboard.css';
import { determineSeason, getUndertonePalette, undertoneDescriptions } from '../data/undertoneAnalysis';

// Importing local quiz asset images for aesthetics
import acadImg from './quizzes/assets/acad1.jpg';
import bohoImg from './quizzes/assets/boho1.jpg';
import coquetteImg from './quizzes/assets/coquette2.jpg';
import glamImg from './quizzes/assets/glam2.jpg';
import grungeImg from './quizzes/assets/grunge2.jpg';
import punkImg from './quizzes/assets/punk1.jpg';
import y2kImg from './quizzes/assets/y2k1.jpg';
import { assetUrl } from '../utils/assetUrls';

// --- DATA DICTIONARIES ---
const zodiacDetails = {
  Aries: { personality: "Energetic, bold, confident, and adventurous.", element: "Fire", planet: "Mars", lucky_numbers: "1, 9, 14", strengths: "Courageous, passionate, determined", weaknesses: "Impulsive, impatient, short-tempered", traits: "Aries is about action and leadership.", compatibility: "Best matches with Leo, Sagittarius, and fellow Aries for high energy." },
  Taurus: { personality: "Patient, reliable, practical, and loving.", element: "Earth", planet: "Venus", lucky_numbers: "2, 6, 9", strengths: "Loyal, persistent, trustworthy", weaknesses: "Stubborn, possessive, resistant to change", traits: "Taurus values comfort and stability.", compatibility: "Best matches with Virgo, Capricorn, and Cancer." },
  Gemini: { personality: "Curious, adaptable, witty, and sociable.", element: "Air", planet: "Mercury", lucky_numbers: "3, 5, 7", strengths: "Intelligent, expressive, versatile", weaknesses: "Inconsistent, indecisive, restless", traits: "Gemini thrives on communication and learning.", compatibility: "Best matches with Libra, Aquarius, and Aries." },
  Cancer: { personality: "Emotional, caring, protective, and intuitive.", element: "Water", planet: "Moon", lucky_numbers: "2, 7, 11", strengths: "Loyal, empathetic, nurturing", weaknesses: "Moody, sensitive, clingy", traits: "Cancer values home, family, and emotional security.", compatibility: "Best matches with Scorpio, Pisces, and Taurus." },
  Leo: { personality: "Confident, charismatic, generous, and creative.", element: "Fire", planet: "Sun", lucky_numbers: "1, 3, 10", strengths: "Ambitious, warm-hearted, loyal", weaknesses: "Arrogant, stubborn, attention-seeking", traits: "Leo loves to shine and lead.", compatibility: "Best matches with Aries, Sagittarius, and Gemini." },
  Virgo: { personality: "Practical, analytical, reliable, and modest.", element: "Earth", planet: "Mercury", lucky_numbers: "5, 14, 23", strengths: "Detail-oriented, hardworking, intelligent", weaknesses: "Overcritical, perfectionist, anxious", traits: "Virgo is focused on improvement and organization.", compatibility: "Best matches with Taurus, Capricorn, and Scorpio." },
  Libra: { personality: "Charming, fair-minded, diplomatic, and sociable.", element: "Air", planet: "Venus", lucky_numbers: "6, 15, 24", strengths: "Cooperative, graceful, balanced", weaknesses: "Indecisive, people-pleasing, superficial", traits: "Libra values harmony and beauty.", compatibility: "Best matches with Gemini, Aquarius, and Leo." },
  Scorpio: { personality: "Passionate, mysterious, determined, and resourceful.", element: "Water", planet: "Pluto (and Mars)", lucky_numbers: "8, 11, 18", strengths: "Loyal, brave, intuitive", weaknesses: "Jealous, secretive, controlling", traits: "Scorpio is about transformation, depth, and emotional power.", compatibility: "Best matches with Cancer, Pisces, and Virgo." },
  Sagittarius: { personality: "Adventurous, optimistic, honest, and free-spirited.", element: "Fire", planet: "Jupiter", lucky_numbers: "3, 9, 12", strengths: "Enthusiastic, open-minded, idealistic", weaknesses: "Impulsive, blunt, inconsistent", traits: "Sagittarius seeks knowledge and adventure.", compatibility: "Best matches with Aries, Leo, and Aquarius." },
  Capricorn: { personality: "Ambitious, disciplined, responsible, and patient.", element: "Earth", planet: "Saturn", lucky_numbers: "4, 8, 22", strengths: "Practical, hardworking, dependable", weaknesses: "Pessimistic, rigid, workaholic", traits: "Capricorn strives for success and stability.", compatibility: "Best matches with Taurus, Virgo, and Scorpio." },
  Aquarius: { personality: "Innovative, original, independent, humanitarian.", element: "Air", planet: "Uranus", lucky_numbers: "2, 7, 11", strengths: "Innovative, idealistic, independent", weaknesses: "Unpredictable, aloof, stubborn", traits: "Aquarius is about innovation, individuality, and humanitarian causes.", compatibility: "Best matches with Gemini, Libra, and Sagittarius." },
  Pisces: { personality: "Compassionate, artistic, gentle, and empathetic.", element: "Water", planet: "Neptune", lucky_numbers: "3, 9, 12", strengths: "Imaginative, kind, intuitive", weaknesses: "Escapist, overly trusting, emotional", traits: "Pisces is deeply connected to dreams and emotions.", compatibility: "Best matches with Cancer, Scorpio, and Taurus." }
};

const aesthetics = {
  academia: { title: "The Scholar", side1: acadImg, color: "#bbaac6" },
  boho: { title: "The Bohemian Dreamer", side1: bohoImg, color: "#e38153" },
  coquette: { title: "The Coquette Muse", side1: coquetteImg, color: "#f5c4d4" },
  grunge: { title: "The Rebel Soul", side1: grungeImg, color: "#b4b0c6" },
  punk: { title: "The Anarchic Icon", side1: punkImg, color: "#ff00bf" },
  y2k: { title: "The Futuristic Popstar", side1: y2kImg, color: "#d46be3" },
  luxurious: { title: "The Luxe Visionary", side1: glamImg, color: "#faca72" }
};

const styleInfo = {
  minimalist: { name: 'Minimalist Elegance', color: '#c19bfa', text_color: '#ffffff' },
  businesswear: { name: 'Professional Businesswear', color: '#1e3a8a', text_color: '#ffffff' },
  elegant: { name: 'Classic Elegance', color: '#7e22ce', text_color: '#ffffff' },
  creative: { name: 'Creative Expression', color: '#ea580c', text_color: '#ffffff' },
  soft: { name: 'Soft Elegance', color: '#f472b6', text_color: '#ffffff' },
  rough: { name: 'Rough Edge', color: '#4b5563', text_color: '#ffffff' },
  streetwear: { name: 'Urban Streetwear', color: '#000000', text_color: '#ffffff' }
};

const formatBirthdate = (birthdate) => {
  if (!birthdate) return 'Not set';

  const [year, month, day] = birthdate.split('T')[0].split('-');
  return year && month && day ? `${day} / ${month} / ${year}` : 'Not set';
};

export default function Dashboard() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('celesticare_user') || '{}'));
  const initialUser = useRef(user);
  const [latestOutfitItems, setLatestOutfitItems] = useState([]);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    let active = true;
    const onboardingData = JSON.parse(localStorage.getItem('celesticare_onboarding') || '{}');
    const token = localStorage.getItem('celesticare_token');

    const loadProfile = async () => {
      if (token && onboardingData.zodiac_sign) {
        try {
          const { data } = await API.put('/auth/profile', {
            name: onboardingData.name || initialUser.current.name,
            gender: onboardingData.gender || initialUser.current.gender,
            birthdate: onboardingData.birthdate || initialUser.current.birthdate,
            zodiac_sign: onboardingData.zodiac_sign,
            undertone: onboardingData.undertone || initialUser.current.undertone
          });
          const updatedUser = data.user;
          localStorage.setItem('celesticare_user', JSON.stringify(updatedUser));
          if (active) setUser(updatedUser);
          localStorage.removeItem('celesticare_onboarding');
        } catch (error) {
          if (active) setSaveError(error.response?.data?.message || 'Unable to save your onboarding profile details.');
        }
      }

      try {
        const { data } = await API.get('/auth/me');
        const currentUser = data.user;
        localStorage.setItem('celesticare_user', JSON.stringify(currentUser));
        if (active) setUser(currentUser);
      } catch (error) {
        if (active) setSaveError(error.response?.data?.message || 'Unable to load your profile from the database.');
      }
    };

    loadProfile();

    API.get('/outfits/latest').then(({ data }) => {
      if (active && data.success && data.outfit && data.outfit.outfit_data) {
        setLatestOutfitItems(data.outfit.outfit_data);
      }
    }).catch((error) => {
      if (active && error.response?.status !== 404) {
        setSaveError(error.response?.data?.message || 'Unable to load your latest outfit.');
      }
    });

    return () => { active = false; };
  }, []);

  const zData = zodiacDetails[user.zodiac_sign] || {
    personality: "Complete your zodiac profile to unlock your astro details!",
    element: "Not set", planet: "Not set", lucky_numbers: "Not set", strengths: "Not set", weaknesses: "Not set", traits: "Complete your zodiac profile to unlock your astro details!", compatibility: "Not set"
  };

  const hasMoodboard = user.aesthetic_result && user.style_result;
  const hasMissingProfileDetails = !user.name || !user.gender || !user.birthdate || !user.zodiac_sign;

  // Robust check: Inspect both user database record and temporary onboarding local storage for an undertone choice
  const savedUndertone = user.undertone && user.undertone !== 'Not set' ? String(user.undertone).toLowerCase() : '';
  const savedZodiac = user.zodiac_sign || '';
  const hasUserUndertone = Boolean(savedUndertone);
  const savedPalette = getUndertonePalette(savedZodiac, savedUndertone);
  const savedSeason = determineSeason(savedZodiac, savedUndertone);
  const undertoneLinkTarget = hasUserUndertone ? '/undertone-result' : '/undertone-test';

  return (
    <div className="dashboard-body">
      <div className="dashboard-container">
        <div className="dashboard-card shadow-sm">
          
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h2 className="mb-1 dashboard-welcome-title">The Universe Welcomes your presence, { user.name || 'Cosmic Traveler'}!</h2>
              <p className="mb-0 text-muted dashboard-welcome-subtitle">This is your profile dashboard where your zodiac style journey begins.</p>
            </div>
            {!user.security_setup_complete && (
              <div className="d-flex flex-column align-items-end gap-2">
                <Link to="/security" className="btn btn-warning dashboard-secure-btn" style={{ borderRadius: '30px', padding: '10px 25px', color: '#2e2e2e', fontWeight: '600' }}>
                  <i className="fas fa-shield-alt me-2"></i>Secure Account
                </Link>
              </div>
            )}
          </div>

          {saveError && <div className="alert alert-danger dashboard-alert" role="alert">{saveError}</div>}

          {hasMissingProfileDetails && (
            <div className="dashboard-profile-notice mb-3" role="status">
              Complete your profile details to personalize your astro insights.
              <Link to="/profile" className="dashboard-btn-style">Set profile details</Link>
            </div>
          )}

          <div className="dashboard-grid-container">
            {/* PROFILE SECTION */}
            <div className="dashboard-profile-section">
              <div className="dashboard-section-title">Profile</div>
              <div className="dashboard-profile-info">
                <div className="dashboard-profile-item"><span className="dashboard-profile-label">Name:</span><span className="dashboard-profile-value">{user.name || 'Not set'}</span></div>
                <div className="dashboard-profile-item"><span className="dashboard-profile-label">Username:</span><span className="dashboard-profile-value">{user.username || 'Not set'}</span></div>
                <div className="dashboard-profile-item"><span className="dashboard-profile-label">Email:</span><span className="dashboard-profile-value">{user.email || 'Not set'}</span></div>
                <div className="dashboard-profile-item"><span className="dashboard-profile-label">Gender:</span><span className="dashboard-profile-value">{user.gender || 'Not set'}</span></div>
                <div className="dashboard-profile-item"><span className="dashboard-profile-label">Birthdate:</span><span className="dashboard-profile-value">{formatBirthdate(user.birthdate)}</span></div>
                <div className="dashboard-profile-item"><span className="dashboard-profile-label">Zodiac:</span><span className="dashboard-profile-value">{user.zodiac_sign || 'Not set'}</span></div>
                <Link to="/profile" className="dashboard-btn-style mt-3">Profile Settings</Link>
              </div>
            </div>

            {/* ASTRO SECTION WITH ALIGNED COMPATIBILITY */}
            <div className="dashboard-astro-section">
              <div className="dashboard-section-title">Astro Insights</div>
              <div className="dashboard-zodiac-header">
                <div className="dashboard-zodiac-name">Your Zodiac Sign: {user.zodiac_sign || 'Unknown'}</div>
              </div>
              <div className="dashboard-zodiac-details">
                <div className="dashboard-zodiac-detail-item"><span className="dashboard-zodiac-label">Personality:</span><span className="dashboard-zodiac-value">{zData.personality}</span></div>
                <div className="dashboard-zodiac-detail-item"><span className="dashboard-zodiac-label">Element:</span><span className="dashboard-zodiac-value">{zData.element}</span></div>
                <div className="dashboard-zodiac-detail-item"><span className="dashboard-zodiac-label">Planet:</span><span className="dashboard-zodiac-value">{zData.planet}</span></div>
                <div className="dashboard-zodiac-detail-item"><span className="dashboard-zodiac-label">Lucky Nums:</span><span className="dashboard-zodiac-value">{zData.lucky_numbers}</span></div>
                <div className="dashboard-zodiac-detail-item"><span className="dashboard-zodiac-label">Strengths:</span><span className="dashboard-zodiac-value">{zData.strengths}</span></div>
                <div className="dashboard-zodiac-detail-item"><span className="dashboard-zodiac-label">Weaknesses:</span><span className="dashboard-zodiac-value">{zData.weaknesses}</span></div>
                <div className="dashboard-zodiac-detail-item"><span className="dashboard-zodiac-label">Compatibility:</span><span className="dashboard-zodiac-value" style={{ fontWeight: '600' }}>{zData.compatibility}</span></div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                {user.birthdate && user.zodiac_sign ? (
                  <Link to="/astro-insights" className="dashboard-astro-glow-btn">VIEW FULL CHART</Link>
                ) : (
                  <>
                    <Link to="/profile" className="dashboard-astro-glow-btn">SET PROFILE DETAILS</Link>
                    <p className="text-muted mt-2" style={{ fontSize: '0.85rem' }}><i className="fas fa-info-circle"></i> Add your birthdate and zodiac sign to unlock your chart.</p>
                  </>
                )}
              </div>
            </div>

            {/* COLOR ANALYSIS SECTION */}
            <div className="dashboard-color-section text-center">
              <div className="dashboard-section-title mb-3">Color Analysis</div>
              {hasUserUndertone ? (
                <div className="dashboard-color-content">
                  <div className="mb-3">
                    <p className="mb-1"><strong>Zodiac:</strong> {savedZodiac || 'Not set'}</p>
                    <p className="mb-1"><strong>Undertone:</strong> <span style={{ textTransform: 'capitalize' }}>{savedUndertone}</span></p>
                    <p className="mb-1"><strong>Your Season:</strong> {savedSeason}</p>
                  </div>
                  <div className="dashboard-color-visual mb-3">
                    <img src={assetUrl(`/src/pages/undertone/assets/${savedUndertone}_wheel.png`)} alt={`${savedUndertone} undertone color wheel`} className="undertoneresult-wheel" />
                  </div>
                  <div className="dashboard-color-palette mb-3">
                    {savedPalette.map((color, i) => (
                      <div key={i} className="dashboard-color-swatch d-inline-block" style={{ background: color }}></div>
                    ))}
                  </div>
                  <p className="dashboard-undertone-description">
                    {undertoneDescriptions[savedUndertone] || 'Discover your unique color palette!'}
                  </p>
                  <p className="dashboard-undertone-description">
                    These colors complement your undertone perfectly and can enhance your natural glow.
                  </p>
                  <Link to={undertoneLinkTarget} className="dashboard-btn-style">View Full Analysis</Link>
                </div>
              ) : (
                <div className="py-4" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p className="text-muted mb-3">Complete color analysis to see your personal color palette</p>
                  <Link to={undertoneLinkTarget} className="dashboard-btn-style">View Full Analysis</Link>
                </div>
              )}
            </div>

            {/* AESTHETIC SECTION */}
            <div className="dashboard-aesthetic-section text-center">
              <div className="dashboard-section-title mb-2">Aesthetics</div>
              {user.aesthetic_result ? (
                <>
                  <div className="dashboard-enhanced-badge" style={{ background: aesthetics[user.aesthetic_result]?.color || '#8B5FBF', color: '#fff' }}>
                    Your Aesthetic: {aesthetics[user.aesthetic_result]?.title || user.aesthetic_result}
                  </div>
                  <img src={aesthetics[user.aesthetic_result]?.side1} alt={user.aesthetic_result} className="dashboard-enhanced-aesthetic-image" />
                  <Link to={`/aesthetic-result/${user.aesthetic_result}`} className="dashboard-btn-style">View Result</Link>
                </>
              ) : (
                <>
                  <p style={{ marginTop: '20px' }}>Want to know your Aesthetic?</p>
                  <Link to="/aesthetic-welcome" className="dashboard-btn-style">Lets Go!</Link>
                </>
              )}
            </div>

            {/* STYLE SECTION */}
            <div className="dashboard-outfit-section text-center">
              <div className="dashboard-section-title mb-2">Your Style</div>
              {user.style_result ? (
                <>
                  <div className="dashboard-enhanced-badge" style={{ background: styleInfo[user.style_result]?.color || '#8B5FBF', color: '#fff' }}>
                    {styleInfo[user.style_result]?.name || user.style_result}
                  </div>
                  {latestOutfitItems.length > 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', margin: '12px 0', maxHeight: '160px', overflowY: 'auto' }}>
                      {latestOutfitItems.slice(0, 3).map((item, idx) => (
                        <img 
                          key={idx} 
                          src={item.src} 
                          alt="Outfit Piece" 
                          style={{ width: '70px', height: '70px', objectFit: 'contain', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '4px', border: '1px solid rgba(255,255,255,0.2)' }} 
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted my-3" style={{ fontSize: '0.9rem' }}>Style profile generated successfully.</p>
                  )}
                  <Link to="/style-result" className="dashboard-btn-style mt-2">View Full Analysis</Link>
                </>
              ) : (
                <>
                  <p style={{ marginTop: '20px' }}>Want to know your Style?</p>
                  <Link to="/style-welcome" className="dashboard-btn-style">Lets Go!</Link>
                </>
              )}
            </div>

            {/* MOODBOARD SECTION */}
            <div className="dashboard-moodboard-section">
              {hasMoodboard ? (
                <div className="dashboard-moodboard-complete">
                  <div className="dashboard-moodboard-icon">🎨</div>
                  <div className="dashboard-moodboard-title">Your Moodboard is Ready!</div>
                  <div className="dashboard-moodboard-subtitle">Explore your personalized style visualization</div>
                  <Link to="/moodboard" className="dashboard-btn-style" style={{ background: '#fff', color: '#8B5FBF' }}>View Moodboard</Link>
                </div>
              ) : (
                <div className="dashboard-moodboard-incomplete">
                  <div className="dashboard-moodboard-incomplete-icon">🎨</div>
                  <div className="dashboard-moodboard-incomplete-title">Moodboard</div>
                  <div className="dashboard-moodboard-incomplete-subtitle">Complete your style journey to unlock</div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
