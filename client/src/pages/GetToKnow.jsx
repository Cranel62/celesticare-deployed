import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GetToKnow.css';

export default function GetToKnow() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', birthdate: '', gender: '' });
  const birthdateInputRef = useRef(null);
  const calendarInputRef = useRef(null);

  useEffect(() => {
    // Check if user is already logged in
    const userToken = localStorage.getItem('celesticare_token');
    const userData = localStorage.getItem('celesticare_user');

    if (userToken || userData) {
      navigate('/zodiac-result');
      return;
    }

    // A fresh page mount starts with blank form state; clear stale onboarding data.
    localStorage.removeItem('celesticare_onboarding');
  }, [navigate]);

  const formatBirthdateInput = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const parseBirthdate = (value) => {
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

    return {
      month,
      day,
      isoDate: `${match[3]}-${match[1]}-${match[2]}`
    };
  };

  const calculateZodiac = (month, day) => {
    const m = month;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedBirthdate = parseBirthdate(formData.birthdate);
    if (!parsedBirthdate) {
      birthdateInputRef.current?.setCustomValidity('Enter a valid date in MM/DD/YYYY format.');
      birthdateInputRef.current?.reportValidity();
      return;
    }

    const sign = calculateZodiac(parsedBirthdate.month, parsedBirthdate.day);
    localStorage.setItem('celesticare_onboarding', JSON.stringify({ ...formData, birthdate: parsedBirthdate.isoDate, zodiac_sign: sign }));
    navigate('/zodiac-result');
  };

  const today = new Date();
  const maxBirthdate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const parsedBirthdate = parseBirthdate(formData.birthdate);

  const handleCalendarChange = (event) => {
    if (!event.target.value) return;
    const [year, month, day] = event.target.value.split('-');
    birthdateInputRef.current?.setCustomValidity('');
    setFormData(current => ({ ...current, birthdate: `${month}/${day}/${year}` }));
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

  return (
    <div className="gettoknow-body">
      <div className="gettoknow-setup-box">
        <div className="gettoknow-brand-title">CELESTICARE</div>
        <h2>Time to get to know you</h2>
        <p>Provide the following details below</p>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            className="form-control gettoknow-input" 
            placeholder="Name" 
            value={formData.name}
            required 
            onChange={e => setFormData({...formData, name: e.target.value})} 
          />
          <div className="gettoknow-birthdate-control">
            <input
              ref={birthdateInputRef}
              type="text"
              className="form-control gettoknow-input gettoknow-birthdate-input"
              placeholder="MM/DD/YYYY"
              aria-label="Birth date (MM/DD/YYYY)"
              autoComplete="bday"
              inputMode="numeric"
              maxLength={10}
              pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"
              title="Enter your birth date as MM/DD/YYYY"
              value={formData.birthdate}
              required
              onChange={e => {
                birthdateInputRef.current?.setCustomValidity('');
                setFormData(current => ({ ...current, birthdate: formatBirthdateInput(e.target.value) }));
              }}
            />
            <button
              type="button"
              className="gettoknow-date-picker-button"
              aria-label="Choose birth date from calendar"
              onClick={openCalendarPicker}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18M8 14h2M14 14h2M8 17h2" />
              </svg>
            </button>
            <input
              ref={calendarInputRef}
              className="gettoknow-native-date-picker"
              type="date"
              lang="en-US"
              aria-hidden="true"
              tabIndex={-1}
              value={parsedBirthdate?.isoDate || ''}
              max={maxBirthdate}
              onChange={handleCalendarChange}
            />
          </div>
          <select 
            className="form-control gettoknow-input" 
            required 
            value={formData.gender}
            onChange={e => setFormData({...formData, gender: e.target.value})}
          >
            <option value="" disabled>Masculine, Feminine</option>
            <option value="Masculine">Masculine</option>
            <option value="Feminine">Feminine</option>
          </select>
          <button type="submit" className="btn-continue gettoknow-btn">Continue</button>
        </form>
      </div>
    </div>
  );
}
