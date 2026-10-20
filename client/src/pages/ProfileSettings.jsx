import { useState, useEffect, useRef } from 'react';
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

const toDisplayBirthdate = (isoDate) => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('T')[0].split('-');
  return year && month && day ? `${month}/${day}/${year}` : '';
};

const formatBirthdateEntry = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const parseBirthdateEntry = (value) => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const today = new Date();

  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) return null;
  if (year > today.getFullYear() || (year === today.getFullYear() && (month > today.getMonth() + 1 || (month === today.getMonth() + 1 && day > today.getDate())))) return null;

  return `${match[3]}-${match[1]}-${match[2]}`;
};

export default function ProfileSettings() {
  const navigate = useNavigate();
  const calendarInputRef = useRef(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('celesticare_user') || '{}'));
  const [birthdateText, setBirthdateText] = useState(() => toDisplayBirthdate(user.birthdate || ''));
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
      setBirthdateText(toDisplayBirthdate(currentUser.birthdate || ''));
    }).catch((err) => {
      setErrorMessage(err.response?.data?.message || 'Unable to retrieve user data.');
    });
  }, []);

  const handleBirthdateChange = (e) => {
    const newDate = e.target.value;
    const computedZodiac = calculateZodiac(newDate);
    setBirthdateText(toDisplayBirthdate(newDate));
    setFormData({
      ...formData,
      birthdate: newDate,
      zodiac_sign: computedZodiac
    });
  };

  const handleBirthdateTextChange = (e) => {
    const nextText = formatBirthdateEntry(e.target.value);
    const isoDate = parseBirthdateEntry(nextText);
    setBirthdateText(nextText);
    if (isoDate) {
      setFormData(current => ({
        ...current,
        birthdate: isoDate,
        zodiac_sign: calculateZodiac(isoDate)
      }));
    }
  };

  const openCalendarPicker = () => {
    const dateInput = calendarInputRef.current;
    if (!dateInput) return;
    try {
      if (typeof dateInput.showPicker === 'function') dateInput.showPicker();
      else {
        dateInput.focus();
        dateInput.click();
      }
    } catch {
      dateInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedBirthdate = parseBirthdateEntry(birthdateText);
    if (!parsedBirthdate) {
      setErrorMessage('Enter a valid date of birth in MM/DD/YYYY format.');
      return;
    }

    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const profileData = {
        ...formData,
        birthdate: parsedBirthdate,
        zodiac_sign: calculateZodiac(parsedBirthdate)
      };
      const { data } = await API.put('/auth/profile', profileData);
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

  const today = new Date();
  const maxBirthdate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

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
                <label className="profilesettings-label" htmlFor="profile-birthdate-text">Date of Birth (MM/DD/YYYY; auto-updates Zodiac)</label>
                <div className="profilesettings-birthdate-control">
                  <input
                    id="profile-birthdate-text"
                    type="text"
                    className="form-control profilesettings-input profilesettings-birthdate-text"
                    placeholder="MM/DD/YYYY"
                    aria-label="Date of birth (MM/DD/YYYY)"
                    autoComplete="bday"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"
                    title="Enter your date of birth as MM/DD/YYYY"
                    value={birthdateText}
                    onChange={handleBirthdateTextChange}
                    required
                  />
                  <button
                    type="button"
                    className="profilesettings-date-picker-button"
                    aria-label="Choose date of birth from calendar"
                    onClick={openCalendarPicker}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M16 3v4M8 3v4M3 10h18M8 14h2M14 14h2M8 17h2" />
                    </svg>
                  </button>
                  <input
                    ref={calendarInputRef}
                    className="profilesettings-native-date-picker"
                    type="date"
                    lang="en-US"
                    aria-hidden="true"
                    tabIndex={-1}
                    value={formData.birthdate}
                    max={maxBirthdate}
                    onChange={handleBirthdateChange}
                  />
                </div>
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
