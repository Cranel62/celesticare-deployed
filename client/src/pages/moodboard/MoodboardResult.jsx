import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import '../../styles/Moodboard.css';

// Importing local quiz asset images for aesthetics
import acad1 from '../quizzes/assets/acad1.jpg';
import acad2 from '../quizzes/assets/acad2.jpg';
import boho1 from '../quizzes/assets/boho1.jpg';
import boho2 from '../quizzes/assets/boho2.jpg';
import coquette12 from '../quizzes/assets/coquette12.jpg';
import coquette2 from '../quizzes/assets/coquette2.jpg';
import glam1 from '../quizzes/assets/glam1.jpg';
import glam2 from '../quizzes/assets/glam2.jpg';
import grunge1 from '../quizzes/assets/grunge1.jpg';
import grunge2 from '../quizzes/assets/grunge2.jpg';
import punk1 from '../quizzes/assets/punk1.jpg';
import punk2 from '../quizzes/assets/punk2.jpg';
import y2k1 from '../quizzes/assets/y2k1.jpg';
import y2k2 from '../quizzes/assets/y2k2.jpg';

const AESTHETICS = {
  academia: { color: "#bbaac6", mood: "Intellectual • Vintage • Poised", title: "The Scholar", desc: "You're drawn to timeless sophistication — think books, tweed, and candlelit study sessions.", assets: [acad1, acad2] },
  boho: { color: "#e38153", mood: "Free-Spirited • Earthy • Artistic", title: "The Bohemian Dreamer", desc: "You embody freedom, creativity, and a love for earthy tones and textures.", assets: [boho1, boho2] },
  coquette: { color: "#f5c4d4", mood: "Romantic • Vintage • Playful", title: "The Coquette Muse", desc: "Romantic and soft, your style leans into vintage elegance — ribbons, lace, and nostalgia.", assets: [coquette12, coquette2] },
  grunge: { color: "#b4b0c6", mood: "Edgy • Unfiltered • Rebellious", title: "The Rebel Soul", desc: "You thrive in expressive chaos — distressed textures, dark tones, and bold convention.", assets: [grunge1, grunge2] },
  punk: { color: "#ff00bf", mood: "Defiant • Raw • Bold", title: "The Anarchic Icon", desc: "You wear rebellion like armor — unapologetic, loud, and endlessly cool.", assets: [punk1, punk2] },
  y2k: { color: "#d46be3", mood: "Playful • Futuristic • Glam", title: "The Futuristic Popstar", desc: "You radiate playful confidence with metallics, baby tees, and digital-era nostalgia.", assets: [y2k1, y2k2] },
  luxurious: { color: "#faca72", mood: "Elegant • Dazzling • Confident", title: "The Luxe Visionary", desc: "Glitter, confidence, and high drama — your aura screams sophistication and luxury.", assets: [glam1, glam2] }
};

const STYLES = {
  minimalist: { name: 'Minimalist Elegance', colors: 'White, black, beige, grey', desc: 'Clean, simple, and timeless pieces. Less is more.' },
  businesswear: { name: 'Professional Businesswear', colors: 'Navy, black, grey, white', desc: 'Polished, professional, and structured looks.' },
  elegant: { name: 'Classic Elegance', colors: 'Pastels, jewel tones, black, white', desc: 'Sophisticated, classy, and luxurious styles.' },
  creative: { name: 'Creative Expression', colors: 'Bright, contrasting, eclectic', desc: 'Bold, artistic, and expressive looks.' },
  soft: { name: 'Soft Elegance', colors: 'Pastels, cream, light pink, baby blue', desc: 'Gentle, pastel, and cozy pieces.' },
  rough: { name: 'Rough Edge', colors: 'Black, grey, earthy tones', desc: 'Edgy, casual, and street-inspired styles.' },
  streetwear: { name: 'Urban Streetwear', colors: 'Black, white, bold bright accents', desc: 'Urban, trendy, and casual styles.' }
};

const PALETTES = {
  Aries: { cool: ["#131111","#6b0e3d","#80012b","#ad0f53","#8b3979","#f4338a"], warm: ["#40180b","#88171c","#d72113","#f0500c","#ff762d","#ff9a51"], neutral: ["#7f1619","#9b2627","#bd5858","#926454","#b8717e","#efaeb4"] },
  Taurus: { cool: ["#22a068","#ff5ee1","#ff9afb","#9bee99","#ffc8fb","#a7efcb"], warm: ["#2e3f16","#3a5d09","#7bab44","#b25526","#ff762d","#ffc451"], neutral: ["#253e18","#9d6f45","#689257","#c68139","#eccb67","#a4c49c"] },
  Gemini: { cool: ["#052542","#175374","#9e37a0","#b478cd","#e669ef","#82d3d7"], warm: ["#567b18","#55844f","#ffa408","#fab738","#afd84b","#ffcf40"], neutral: ["#19344d","#435c89","#807145","#5e666b","#cea63f","#96accd"] },
  Cancer: { cool: ["#0c205b","#212d9b","#009cff","#81b0ff","#a3e6ff","#85e9e9"], warm: ["#0c3b3b","#097b77","#17cba0","#5df6bf","#a5ffe7","#b3ffc8"], neutral: ["#013b60","#2b2f59","#435c89","#5e5f73","#a5b2c2","#cddfeb"] },
  Leo: { cool: ["#5b204e","#862d58","#7c465d","#cf1e5a","#ff0068","#be2736"], warm: ["#774526","#c43b3b","#ac4b2a","#fa4d00","#ff6a04","#f28115"], neutral: ["#52351a","#724923","#a96236","#c78d2f","#d09940","#edc98b"] },
  Virgo: { cool: ["#043921","#034d37","#00835e","#4bcbaa","#4df2cc","#a0dbbf"], warm: ["#0f3917","#6d3d12","#376b32","#9d6216","#5a6b19","#e17e16"], neutral: ["#3b4626","#596b3c","#857039","#a5a95e","#d1ac6d","#ddb793"] },
  Libra: { cool: ["#622674","#6d4b66","#9b63c2","#9683be","#b4b0e1","#ecc0d9"], warm: ["#569c7e","#72af8e","#ffaaa5","#ffcbc3","#dcedc1","#ffe3c6"], neutral: ["#ecc0d9","#7fa292","#a6d2bb","#f6bdb4","#fdd8c6","#fef0d5"] },
  Scorpio: { cool: ["#191933","#461d49","#15456b","#44229a","#7648b0","#3a89db"], warm: ["#730101","#b70000","#e2293b","#b2301f","#c76a50","#c18584"], neutral: ["#110f0d","#4c3860","#662a48","#504840","#867a6e","#d6d5da"] },
  Sagittarius: { cool: ["#40007b","#3830a0","#24879d","#7f1d80","#ce2c82","#ce6aac"], warm: ["#52201c","#415715","#fa7e1e","#e7735a","#aac265","#edba4a"], neutral: ["#2c2956","#4d234b","#786988","#6d76a7","#5386a2","#7b98b7"] },
  Capricorn: { cool: ["#001b33","#2e3958","#267b64","#4d90cf","#77d6c2","#78b895"], warm: ["#3e1f1c","#2e472a","#662f0b","#ac6114","#639261","#fedca3"], neutral: ["#303c54","#667f61","#979593","#8d7d6d","#6b9da6","#c4af90"] },
  Aquarius: { cool: ["#293aaa","#5f35b1","#0768c9","#ae4a8c","#ad55ea","#a09dea"], warm: ["#8a2a2b","#108bff","#ee8f21","#f5c976","#fffa81","#eccbd1"], neutral: ["#44499a","#4d90cf","#78b895","#75c3d0","#76899f","#bfafd3"] },
  Pisces: { cool: ["#007392","#727cd6","#b2adfd","#64ffd5","#b1d6ff","#b4fff6"], warm: ["#ff8080","#ffab88","#fcb9b0","#ffd2c9","#fcf0da","#ffebeb"], neutral: ["#39536d","#1ba8a0","#9e99d1","#8ed1d1","#a9d8de","#b5e8d5"] }
};

const ZODIAC_CIRCLES = {
  Aries: 'aries_circle.png', Taurus: 'taurus_circle.png', Gemini: 'gemini_circle.png',
  Cancer: 'cancer_circle.png', Leo: 'leo_circle.png', Virgo: 'virgo_circle.png',
  Libra: 'libra_circle.png', Scorpio: 'scorpio_circle.png', Sagittarius: 'sag_circle.png',
  Capricorn: 'capricorn_circle.png', Aquarius: 'aqua_circle.png', Pisces: 'pisces_circle.png',
};

const ASTRO_FACTS = {
  Aries: "You are bold, ambitious, and a natural leader.", Taurus: "You value comfort and beauty in all things.", Gemini: "Your curiosity and wit make you adaptable.",
  Cancer: "You are intuitive and deeply caring.", Leo: "Your creativity shines brightly.", Virgo: "You find harmony in order and detail.",
  Libra: "Balance and beauty guide your choices.", Scorpio: "You're magnetic and passionate.", Sagittarius: "Your adventurous heart inspires others.",
  Capricorn: "You are grounded and ambitious.", Aquarius: "You think differently and value authenticity.", Pisces: "Your creativity and empathy define you."
};

export default function MoodboardResult() {
  const navigate = useNavigate();
  const [outfitData, setOutfitData] = useState([]);
  const user = JSON.parse(localStorage.getItem('celesticare_user') || '{}');
  const onboarding = JSON.parse(localStorage.getItem('celesticare_onboarding') || '{}');

  const aestheticResult = user.aesthetic_result || '';
  const styleResult = user.style_result || '';
  const zodiac = onboarding.zodiac_sign || user.zodiac_sign || 'Not set';
  const undertone = (onboarding.undertone || user.undertone || 'neutral').toLowerCase();

  useEffect(() => {
    if (!aestheticResult) navigate('/aesthetic-welcome');
    if (!styleResult) navigate('/style-welcome');

    API.get('/outfits/latest')
      .then(res => {
        if (res.data.success && res.data.outfit) {
          setOutfitData(res.data.outfit.outfit_data);
        }
      })
      .catch(err => console.error("Outfit fetch error:", err));
  }, [navigate, aestheticResult, styleResult]);

  const aestheticData = AESTHETICS[aestheticResult] || AESTHETICS['boho'];
  const styleData = STYLES[styleResult] || STYLES['minimalist'];
  const userPalette = PALETTES[zodiac]?.[undertone] || ["#8B5FBF", "#6D28D9", "#C084FC", "#495482", "#9b83d3", "#F8FAFC"];

  return (
    <div className="mb-body">
      <div className="editorial-container">
        <header className="magazine-header">
          <h1 className="magazine-title">CelestiCare</h1>
          <p className="magazine-subtitle">Your Personal Style Editorial MoodBoard</p>
        </header>

        <div className="main-content">
          <div className="left-panel">
            <div className="section-card">
              <h2 className="section-title">Aesthetic Signature</h2>
              <div className="aesthetic-display">
                <div>
                  {aestheticData.assets.map((asset, i) => (
                    <img key={i} src={asset} alt="Aesthetic Inspiration" className="aesthetic-image" />
                  ))}
                </div>
                <div className="aesthetic-info">
                  <div className="aesthetic-tag" style={{ background: aestheticData.color }}>Aesthetic</div>
                  <h3 className="aesthetic-title">{aestheticData.title}</h3>
                  <div className="aesthetic-mood" style={{ color: aestheticData.color, fontStyle: 'italic', fontWeight: 500, marginBottom: '1rem' }}>{aestheticData.mood}</div>
                  <p className="aesthetic-desc">{aestheticData.desc}</p>
                </div>
              </div>
            </div>

            <div className="section-card">
              <h2 className="section-title">Style DNA</h2>
              <div className="aesthetic-tag" style={{ background: 'linear-gradient(135deg, #9177c0ff, #594082ff)' }}>{styleData.name}</div>
              <p className="aesthetic-desc">{styleData.desc}</p>
              <div className="mt-3">
                <strong>Recommended Colors:</strong>
                <div className="color-palette mt-2">
                  {userPalette.map((color, i) => (
                    <div key={i} className="color-swatch" style={{ background: color }} title={color}></div>
                  ))}
                </div>
              </div>
            </div>

            {outfitData.length > 0 && (
              <div className="section-card">
                <h2 className="section-title">Your Curated Collection</h2>
                <div className="outfit-grid">
                  {outfitData.map((item, i) => (
                    <img key={i} src={item.src} alt="Outfit Item" className="outfit-item" />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="right-panel">
            <div className="section-card">
              <h2 className="section-title">Color Analysis</h2>
              <p><strong>Undertone:</strong> <span style={{ textTransform: 'capitalize' }}>{undertone}</span></p>
              
              <div className="color-wheel-container">
                <img src={`/src/pages/undertone/assets/${undertone}_wheel.png`} alt="Color Wheel" className="undertoneresult-wheel" />
              </div>
              <div className="color-palette">
                {userPalette.map((color, i) => (
                  <div key={i} className="color-swatch" style={{ background: color }} title={color}></div>
                ))}
              </div>
            </div>

            <div className="section-card">
              <h2 className="section-title">Celestial Influence</h2>
              <div className="zodiac-display">
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <img src={ZODIAC_CIRCLES[user.zodiac_sign] ? `src/pages/moodboard/assets/${ZODIAC_CIRCLES[user.zodiac_sign]}` : 'src/pages/moodboard/assets/zodiac_circle.png'} alt="Zodiac" className="zodiac-symbol" />
                </div>
                <h4>{user.zodiac_sign}</h4>
                <p style={{ fontStyle: 'italic', color: '#666' }}>{ASTRO_FACTS[user.zodiac_sign]}</p>
              </div>
            </div>

            <div className="section-card">
              <h2 className="section-title">Your Style Story</h2>
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#555', fontStyle: 'italic' }}>
                  A unique blend of <strong>{aestheticData.title}</strong> aesthetic with <strong>{styleData.name}</strong> sensibilities.
                  Your <strong>{user.zodiac_sign}</strong> energy shines through in every curated piece, creating a signature look that's authentically you.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '3rem', background: 'transparent' }}>
          <div className="section-card" style={{ background: 'linear-gradient(135deg, #9177c0ff, #594082ff)', color: 'white', textAlign: 'center', borderLeft: '4px solid #C084FC' }}>
            <h2 className="section-title" style={{ color: 'white', borderBottom: '2px solid rgba(255,255,255,0.3)' }}>Refine Your Style Journey</h2>
            <div className="action-buttons">
              <Link to="/aesthetic-welcome" className="action-btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.3)' }}>Refine Aesthetic</Link>
              <Link to="/style-welcome" className="action-btn" style={{ background: 'transparent', color: 'white', border: '2px solid white' }}>Update Style</Link>
              <Link to="/dashboard" className="action-btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.3)' }}>Dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}