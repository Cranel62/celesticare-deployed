import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import '../styles/ProfileSettings.css';

// --- DATA DICTIONARIES ---
const zodiacDetails = {
  Aries: { element: "Fire", planet: "Mars" },
  Taurus: { element: "Earth", planet: "Venus" },
  Gemini: { element: "Air", planet: "Mercury" },
  Cancer: { element: "Water", planet: "Moon" },
  Leo: { element: "Fire", planet: "Sun" },
  Virgo: { element: "Earth", planet: "Mercury" },
  Libra: { element: "Air", planet: "Venus" },
  Scorpio: { element: "Water", planet: "Pluto (and Mars)" },
  Sagittarius: { element: "Fire", planet: "Jupiter" },
  Capricorn: { element: "Earth", planet: "Saturn" },
  Aquarius: { element: "Air", planet: "Uranus" },
  Pisces: { element: "Water", planet: "Neptune" }
};

const calculateZodiac = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const m = parseInt(parts[1], 10), day = parseInt(parts[2], 10);
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return 'Aries';
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return 'Taurus';
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return 'Gemini';
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return 'Cancer';
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return 'Leo';
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return 'Virgo';
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return 'Libra';
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return 'Scorpio';
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return 'Sagittarius';
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return 'Capricorn';
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
};

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('celesticare_user') || '{}'));
  const [formData, setFormData] = useState({
    name: user.name || '',
    username: user.username || '',
    gender: user.gender || '',
    birthdate: user.birthdate ? user.birthdate.split('T')[0] : '',
    zodiac_sign: user.zodiac_sign || ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    API.get('/auth/me').then(({ data }) => {
      const currentUser = data.user;
      localStorage.setItem('celesticare_user', JSON.stringify(currentUser));
      setUser(currentUser);
      setFormData({
        name: currentUser.name || '',
        username: currentUser.username || '',
        gender: currentUser.gender || '',
        birthdate: currentUser.birthdate ? currentUser.birthdate.split('T')[0] : '',
        zodiac_sign: currentUser.zodiac_sign || ''
      });
    }).catch((err) => {
      setErrorMessage(err.response?.data?.message || 'Unable to retrieve user data.');
    });
  }, []);

  const handleBirthdateChange = (e) => {
    const newDate = e.target.value;
    const computedZodiac = calculateZodiac(newDate);
    setFormData({
      ...formData,
      birthdate: newDate,
      zodiac_sign: computedZodiac
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const { data } = await API.put('/auth/profile', formData);
      const updatedUser = data.user;
      localStorage.setItem('celesticare_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSuccessMessage('Profile settings updated successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profilesettings-body">
      <div className="profilesettings-container">
        <div className="profilesettings-card shadow-sm">
          
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1 profilesettings-title">Profile Settings</h2>
              <p className="mb-0 text-muted profilesettings-subtitle">Update your personal stellar data and astrological sign.</p>
            </div>
            <div>
              <Link to="/dashboard" className="profilesettings-back-btn">
                <i className="fas fa-arrow-left me-2"></i> Back to Dashboard
              </Link>
            </div>
          </div>

          {successMessage && <div className="alert alert-success profilesettings-alert" role="alert">{successMessage}</div>}
          {errorMessage && <div className="alert alert-danger profilesettings-alert" role="alert">{errorMessage}</div>}

          <form onSubmit={handleSubmit} className="profilesettings-form">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="profilesettings-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-control profilesettings-input" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="profilesettings-label">Username</label>
                <input 
                  type="text" 
                  className="form-control profilesettings-input" 
                  value={formData.username} 
                  onChange={(e) => setFormData({...formData, username: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="profilesettings-label">Gender</label>
                <select 
                  className="form-control profilesettings-input" 
                  value={formData.gender} 
                  onChange={(e) => setFormData({...formData, gender: e.target.value})} 
                  required
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Masculine">Masculine</option>
                  <option value="Feminine">Feminine</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="profilesettings-label">Date of Birth (Auto-updates Zodiac)</label>
                <input 
                  type="date" 
                  className="form-control profilesettings-input" 
                  value={formData.birthdate} 
                  onChange={handleBirthdateChange} 
                  required 
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="profilesettings-label">Calculated Zodiac Sign</label>
                <input 
                  type="text" 
                  className="form-control profilesettings-input" 
                  value={formData.zodiac_sign} 
                  readOnly 
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', cursor: 'not-allowed' }} 
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="profilesettings-label">Zodiac Element</label>
                <input 
                  type="text" 
                  className="form-control profilesettings-input" 
                  value={zodiacDetails[formData.zodiac_sign]?.element || 'Unknown'} 
                  readOnly 
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', cursor: 'not-allowed' }} 
                />
              </div>
            </div>

            <div className="mt-4 text-center">
              <button type="submit" disabled={isSaving} className="profilesettings-save-btn">
                <i className="fas fa-save me-2"></i> {isSaving ? 'Saving Changes...' : 'Save Profile Settings'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}