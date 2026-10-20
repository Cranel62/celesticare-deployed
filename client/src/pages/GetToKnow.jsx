import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GetToKnow.css';

export default function GetToKnow() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', birthdate: '', gender: '' });
  const birthdateInputRef = useRef(null);

  useEffect(() => {
    // Check if user is already logged in
    const userToken = localStorage.getItem('celesticare_token');
    const userData = localStorage.getItem('celesticare_user');

    if (userToken || userData) {
      navigate('/zodiac-result');
      return;
    }

    // Minimal update: Automatically clear/reset onboarding input session storage/state 
    // when a guest user visits or refreshes the get-to-know page so inputs don't persist unexpectedly.
    localStorage.removeItem('celesticare_onboarding');
    setFormData({ name: '', birthdate: '', gender: '' });
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
          <input 
            ref={birthdateInputRef}
            type="text"
            className="form-control gettoknow-input" 
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
              setFormData({ ...formData, birthdate: formatBirthdateInput(e.target.value) });
            }}
          />
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
