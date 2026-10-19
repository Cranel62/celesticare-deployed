import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetUrl } from '../utils/assetUrls';
import '../styles/Undertone.css';

const palettes = {
  "Aries": {
      "cool": ["#131111","#6b0e3d","#80012b","#ad0f53","#8b3979","#f4338a"],
      "warm": ["#40180b","#88171c","#d72113","#f0500c","#ff762d","#ff9a51"],
      "neutral": ["#7f1619","#9b2627","#bd5858","#926454","#b8717e","#efaeb4"]
  },
  "Taurus": {
      "cool": ["#22a068","#ff5ee1","#ff9afb","#9bee99","#ffc8fb","#a7efcb"],
      "warm": ["#2e3f16","#3a5d09","#7bab44","#b25526","#ff762d","#ffc451"],
      "neutral": ["#253e18","#9d6f45","#689257","#c68139","#eccb67","#a4c49c"]
  },
  "Gemini": {
      "cool": ["#052542","#175374","#9e37a0","#b478cd","#e669ef","#82d3d7"],
      "warm": ["#567b18","#55844f","#ffa408","#fab738","#afd84b","#ffcf40"],
      "neutral": ["#19344d","#435c89","#807145","#5e666b","#cea63f","#96accd"]
  },
  "Cancer": {
      "cool": ["#0c205b","#212d9b","#009cff","#81b0ff","#a3e6ff","#85e9e9"],
      "warm": ["#0c3b3b","#097b77","#17cba0","#5df6bf","#a5ffe7","#b3ffc8"],
      "neutral": ["#013b60","#2b2f59","#435c89","#5e5f73","#a5b2c2","#cddfeb"]
  },
  "Leo": {
      "cool": ["#5b204e","#862d58","#7c465d","#cf1e5a","#ff0068","#be2736"],
      "warm": ["#774526","#c43b3b","#ac4b2a","#fa4d00","#ff6a04","#f28115"],
      "neutral": ["#52351a","#724923","#a96236","#c78d2f","#d09940","#edc98b"]
  },
  "Virgo": {
      "cool": ["#043921","#034d37","#00835e","#4bcbaa","#4df2cc","#a0dbbf"],
      "warm": ["#0f3917","#6d3d12","#376b32","#9d6216","#5a6b19","#e17e16"],
      "neutral": ["#3b4626","#596b3c","#857039","#a5a95e","#d1ac6d","#ddb793"]
  },
  "Libra": {
      "cool": ["#622674","#6d4b66","#9b63c2","#9683be","#b4b0e1","#ecc0d9"],
      "warm": ["#569c7e","#72af8e","#ffaaa5","#ffcbc3","#dcedc1","#ffe3c6"],
      "neutral": ["#ecc0d9","#7fa292","#a6d2bb","#f6bdb4","#fdd8c6","#fef0d5"]
  },
  "Scorpio": {
      "cool": ["#191933","#461d49","#15456b","#44229a","#7648b0","#3a89db"],
      "warm": ["#730101","#b70000","#e2293b","#b2301f","#c76a50","#c18584"],
      "neutral": ["#110f0d","#4c3860","#662a48","#504840","#867a6e","#d6d5da"]
  },
  "Sagittarius": {
      "cool": ["#40007b","#3830a0","#24879d","#7f1d80","#ce2c82","#ce6aac"],
      "warm": ["#52201c","#415715","#fa7e1e","#e7735a","#aac265","#edba4a"],
      "neutral": ["#2c2956","#4d234b","#786988","#6d76a7","#5386a2","#7b98b7"]
  },
  "Capricorn": {
      "cool": ["#001b33","#2e3958","#267b64","#4d90cf","#77d6c2","#78b895"],
      "warm": ["#3e1f1c","#2e472a","#662f0b","#ac6114","#639261","#fedca3"],
      "neutral": ["#303c54","#667f61","#979593","#8d7d6d","#6b9da6","#c4af90"]
  },
  "Aquarius": {
      "cool": ["#293aaa","#5f35b1","#0768c9","#ae4a8c","#ad55ea","#a09dea"],
      "warm": ["#8a2a2b","#108bff","#ee8f21","#f5c976","#fffa81","#eccbd1"],
      "neutral": ["#44499a","#4d90cf","#78b895","#75c3d0","#76899f","#bfafd3"]
  },
  "Pisces": {
      "cool": ["#007392","#727cd6","#b2adfd","#64ffd5","#b1d6ff","#b4fff6"],
      "warm": ["#ff8080","#ffab88","#fcb9b0","#ffd2c9","#fcf0da","#ffebeb"],
      "neutral": ["#39536d","#1ba8a0","#9e99d1","#8ed1d1","#a9d8de","#b5e8d5"]
  }
};

const descriptions = {
  "cool": "Cool undertones tend to have hints of blue, pink or red. They look best with silver jewelry and icy colors.",
  "warm": "Warm undertones have hints of yellow, golden or peach. They glow with gold jewelry and warm earthy colors.",
  "neutral": "Neutral undertones are balanced and can wear both warm and cool colors harmoniously."
};

const determineSeason = (zodiac, undertone) => {
  const seasonMap = {
      'Aries': { cool: 'Spring', warm: 'Spring', neutral: 'Spring' },
      'Taurus': { cool: 'Spring', warm: 'Spring', neutral: 'Spring' },
      'Gemini': { cool: 'Summer', warm: 'Spring', neutral: 'Summer' },
      'Cancer': { cool: 'Summer', warm: 'Summer', neutral: 'Summer' },
      'Leo': { cool: 'Summer', warm: 'Autumn', neutral: 'Summer' },
      'Virgo': { cool: 'Summer', warm: 'Autumn', neutral: 'Summer' },
      'Libra': { cool: 'Autumn', warm: 'Autumn', neutral: 'Autumn' },
      'Scorpio': { cool: 'Autumn', warm: 'Autumn', neutral: 'Autumn' },
      'Sagittarius': { cool: 'Winter', warm: 'Autumn', neutral: 'Winter' },
      'Capricorn': { cool: 'Winter', warm: 'Winter', neutral: 'Winter' },
      'Aquarius': { cool: 'Winter', warm: 'Winter', neutral: 'Winter' },
      'Pisces': { cool: 'Winter', warm: 'Spring', neutral: 'Winter' }
  };
  return seasonMap[zodiac]?.[undertone] || 'Spring';
};

export default function UndertoneResult() {
  const navigate = useNavigate();
  
  const onboardingData = JSON.parse(localStorage.getItem('celesticare_onboarding') || '{}');
  const userData = JSON.parse(localStorage.getItem('celesticare_user') || '{}');
  
  const token = localStorage.getItem('celesticare_token');
  const undertone = token ? userData.undertone : onboardingData.undertone;
  const zodiacSign = token ? userData.zodiac_sign : onboardingData.zodiac_sign;

  useEffect(() => {
    if (!undertone || !zodiacSign) {
      navigate('/undertone-test');
    }
  }, [undertone, zodiacSign, navigate]);

  const palette = palettes[zodiacSign]?.[undertone] || ["#ccc","#999","#666","#333","#000","#fff"];
  const wheelImage = assetUrl(`/src/pages/undertone/assets/${undertone || 'neutral'}_wheel.png`);
  const season = determineSeason(zodiacSign, undertone);

  return (
    <div className="undertoneresult-body">
      <div className="undertoneresult-quiz-box">
        <h1>CELESTICARE</h1>
        
        <div className="undertoneresult-result-section">
          <div className="undertoneresult-image-box">
            <img src={wheelImage} alt={`${undertone} Wheel`} className="undertoneresult-wheel" draggable="false" />
            <div className="undertoneresult-info-box">
              {zodiacSign || 'Your'} undertone gives insight into the best colors for your style and wardrobe.
            </div>
          </div>

          <div className="undertoneresult-text-box">
            <h2>{zodiacSign || 'Cosmic Traveler'} with a {undertone || 'neutral'} undertone</h2>
            
            <div className="undertoneresult-info-box undertoneresult-season-box">
              <strong>Your Season: {season}</strong>
            </div>
            
            <div className="undertoneresult-palette">
              {palette.map((color, idx) => (
                <div key={idx} className="undertoneresult-color-box" style={{ backgroundColor: color }}></div>
              ))}
            </div>

            <p style={{ marginTop: '10px', fontSize: '1rem', color: '#d0cce6' }}>{descriptions[undertone] || descriptions['neutral']}</p>
            <div className="undertoneresult-info-box">Experiment with these shades in clothing, makeup, and accessories to find your signature look.</div>
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
