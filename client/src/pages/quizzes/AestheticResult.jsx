import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

// Academia Assets (relative to src/pages/quizzes/)
import acadBg from './assets/acad_bg3.jpg';
import acad1 from './assets/acad1.jpg';
import acad3 from './assets/acad3.jpg';

// Boho Assets
import bohoBg from './assets/boho_bg2.jpg';
import boho2 from './assets/boho2.jpg';
import boho1 from './assets/boho1.jpg';

// Coquette Assets
import coquetteBg from './assets/coquette_bg.jpg';
import coquette2 from './assets/coquette2.jpg';
import coquette12 from './assets/coquette12.jpg';

// Luxurious / Glam Assets
import glamBg from './assets/glam_bg1.jpg';
import glam2 from './assets/glam2.jpg';
import glam1 from './assets/glam1.jpg';

// Grunge Assets
import grungeBg from './assets/grunge_bg2.jpg';
import grunge2 from './assets/grunge2.jpg';
import grunge3 from './assets/grunge3.jpg';

// Punk Assets
import punkBg from './assets/punk_bg1.jpg';
import punk1 from './assets/punk1.jpg';
import punk3 from './assets/punk3.jpg';

// Y2K Assets
import y2kBg from './assets/y2k_bg2.jpg';
import y2k1 from './assets/y2k1.jpg';
import y2k3 from './assets/y2k3.jpg';

// Music Imports from src/music/
import acadMusic from '../../music/acad.mp3';
import bohoMusic from '../../music/boho.mp3';
import coquetteMusic from '../../music/coquette.mp3';
import glamMusic from '../../music/glam.mp3';
import grungeMusic from '../../music/grunge.mp3';
import punkMusic from '../../music/punk.mp3';
import y2kMusic from '../../music/y2k.mp3';

const AESTHETICS = {
  academia: {
    title: "The Scholar",
    desc: "You're drawn to timeless sophistication — think books, tweed, and candlelit study sessions. You find beauty in intellect and classic detail.",
    history: "Rooted in literary charm and old-world academia, this aesthetic draws from classic literature, university libraries, and British collegiate style.",
    mood: "Intellectual • Vintage • Poised",
    bg: acadBg,
    side1: acad1,
    side2: acad3,
    color: "#bbaac6",
    music: acadMusic
  },
  boho: {
    title: "The Bohemian Dreamer",
    desc: "You embody freedom, creativity, and a love for earthy tones and textures. Every outfit tells a story — unbothered, soulful, and effortlessly chic.",
    history: "Emerging from 1960s counterculture, Bohemian style fuses artistic expression with natural fabrics and global influences.",
    mood: "Free-Spirited • Earthy • Artistic",
    bg: bohoBg,
    side1: boho2,
    side2: boho1,
    color: "#e38153",
    music: bohoMusic
  },
  coquette: {
    title: "The Coquette Muse",
    desc: "Romantic and soft, your style leans into vintage elegance — ribbons, lace, and an air of flirtatious nostalgia.",
    history: "Blending Rococo-era charm with 90s Lolita revival, the Coquette aesthetic celebrates femininity and delicate romanticism.",
    mood: "Romantic • Vintage • Playful",
    bg: coquetteBg,
    side1: coquette2,
    side2: coquette12,
    color: "#f5c4d4",
    music: coquetteMusic
  },
  luxurious: {
    title: "The Luxe Visionary",
    desc: "Glitter, confidence, and high drama — your aura screams sophistication and luxury. You turn moments into red-carpet statements.",
    history: "Rooted in Old Hollywood and modern couture, Glam embraces opulence, allure, and timeless beauty.",
    mood: "Elegant • Dazzling • Confident",
    bg: glamBg,
    side1: glam2,
    side2: glam1,
    color: "#faca72",
    music: glamMusic
  },
  grunge: {
    title: "The Rebel Soul",
    desc: "You thrive in expressive chaos — distressed textures, dark tones, and a bold disregard for convention define your edge.",
    history: "Born from 90s alternative rock culture, Grunge fashion embodies rebellion, comfort, and raw individuality.",
    mood: "Edgy • Unfiltered • Rebellious",
    bg: grungeBg,
    side1: grunge2,
    side2: grunge3,
    color: "#b4b0c6",
    music: grungeMusic
  },
  punk: {
    title: "The Anarchic Icon",
    desc: "You wear rebellion like armor — unapologetic, loud, and endlessly cool. Spikes, leather, and confidence are your essentials.",
    history: "Emerging from 1970s UK subcultures, punk aesthetic rejected mainstream norms through fashion, music, and activism.",
    mood: "Defiant • Raw • Bold",
    bg: punkBg,
    side1: punk1,
    side2: punk3,
    color: "#ff00bf",
    music: punkMusic
  },
  y2k: {
    title: "The Futuristic Popstar",
    desc: "You radiate playful confidence with metallics, baby tees, and digital-era nostalgia. The early 2000s live in your sparkle.",
    history: "A revival of late 90s and early 2000s cyber fashion — glossy textures, technology-inspired motifs, and glittery confidence.",
    mood: "Playful • Futuristic • Glam",
    bg: y2kBg,
    side1: y2k1,
    side2: y2k3,
    color: "#d46be3",
    music: y2kMusic
  }
};

export default function AestheticResult() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('celesticare_user') || '{}');
    const finalAesthetic = resultId || user.aesthetic_result;

    if (!finalAesthetic || !AESTHETICS[finalAesthetic]) {
      navigate('/dashboard');
      return;
    }
    const aestheticData = AESTHETICS[finalAesthetic];
    setData(aestheticData);

    if (audioRef.current && aestheticData.music) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => setIsMuted(true));
    }
  }, [resultId, navigate]);

  const toggleMusic = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  if (!data) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(rgba(9, 6, 20, 0.7), rgba(30, 23, 61, 0.85)), url(${data.bg}) center/cover no-repeat fixed`,
      fontFamily: "'Poppins', sans-serif",
      paddingTop: 'calc(80px + 20px)',
      paddingBottom: '60px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Background Audio Player */}
      {data.music && (
        <audio ref={audioRef} autoPlay loop>
          <source src={data.music} type="audio/mpeg" />
        </audio>
      )}

      {/* Music Toggle Control */}
      <div 
        onClick={toggleMusic} 
        style={{
          position: 'fixed', top: '100px', right: '25px', zIndex: 1050,
          background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '50%',
          width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.3s ease', color: '#ffffff', fontSize: '1.2rem',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
        }}
        title="Toggle Ambient Audio"
      >
        {isMuted ? '🔇' : '🔈'}
      </div>

      <div style={{
        maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: '0 20px', position: 'relative'
      }}>
        
        {/* Left Side Banner Image */}
        <img src={data.side1} alt="Style 1" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', width: '200px', height: '300px', borderRadius: '18px', objectFit: 'cover', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }} className="d-none d-xl-block" />
        
        {/* Right Side Banner Image */}
        <img src={data.side2} alt="Style 2" style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', width: '200px', height: '300px', borderRadius: '18px', objectFit: 'cover', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }} className="d-none d-xl-block" />

        {/* Central Glassmorphism Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '24px', padding: '50px', maxWidth: '780px', width: '100%',
          color: '#ffffff', boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(193, 155, 250, 0.2)', zIndex: 2,
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: data.color, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', textShadow: '0 0 15px rgba(193, 155, 250, 0.4)' }}>
            {data.title}
          </h1>

          <div style={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.85rem', color: '#c19bfa', letterSpacing: '1.5px', marginTop: '25px' }}>About</div>
          <p style={{ fontSize: '1rem', color: '#f0ecfc', lineHeight: 1.7, marginTop: '5px' }}>{data.desc}</p>

          <div style={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.85rem', color: '#c19bfa', letterSpacing: '1.5px', marginTop: '25px' }}>History</div>
          <p style={{ fontSize: '1.0rem', color: '#f0ecfc', lineHeight: 1.7, marginTop: '5px' }}>{data.history}</p>

          <div style={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.85rem', color: '#c19bfa', letterSpacing: '1.5px', marginTop: '25px' }}>Mood</div>
          <p style={{ fontStyle: 'italic', fontWeight: 600, fontSize: '1.1rem', color: data.color, marginTop: '5px' }}>{data.mood}</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '35px', flexWrap: 'wrap' }}>
            <Link to="/dashboard" style={{ background: 'linear-gradient(135deg, #c19bfa, #a628c5)', color: '#fff', padding: '12px 35px', borderRadius: '30px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 6px 20px rgba(166, 40, 197, 0.4)', transition: '0.3s' }}>Back to Dashboard</Link>
            <Link to="/aesthetic-quiz" style={{ background: 'rgba(255,255,255,0.08)', border: `2px solid ${data.color}`, color: '#fff', padding: '10px 35px', borderRadius: '30px', fontWeight: 700, textDecoration: 'none', transition: '0.3s' }}>Retake Quiz</Link>
          </div>
        </div>
      </div>
    </div>
  );
}