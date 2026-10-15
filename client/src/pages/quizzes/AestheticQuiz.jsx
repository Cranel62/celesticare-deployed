import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

// Importing images directly from the local quizzes/assets folder relative to this file
import acad1 from './assets/acad1.jpg';
import acad2 from './assets/acad2.jpg';
import acad3 from './assets/acad3.jpg';
import boho1 from './assets/boho1.jpg';
import boho2 from './assets/boho2.jpg';
import boho3 from './assets/boho3.jpg';
import coquette12 from './assets/coquette12.jpg';
import coquette2 from './assets/coquette2.jpg';
import coquette3 from './assets/coquette3.jpg';
import glam1 from './assets/glam1.jpg';
import glam2 from './assets/glam2.jpg';
import glam3 from './assets/glam3.jpg';
import grunge1 from './assets/grunge1.jpg';
import grunge2 from './assets/grunge2.jpg';
import grunge3 from './assets/grunge3.jpg';
import punk1 from './assets/punk1.jpg';
import punk2 from './assets/punk2.jpg';
import punk3 from './assets/punk3.jpg';
import y2k1 from './assets/y2k1.jpg';
import y2k2 from './assets/y2k2.jpg';
import y2k3 from './assets/y2k3.jpg';

const ALL_IMAGES = [
  { src: acad1, aesthetic: "academia" },
  { src: acad2, aesthetic: "academia" },
  { src: acad3, aesthetic: "academia" },
  { src: boho1, aesthetic: "boho" },
  { src: boho2, aesthetic: "boho" },
  { src: boho3, aesthetic: "boho" },
  { src: coquette12, aesthetic: "coquette" },
  { src: coquette2, aesthetic: "coquette" },
  { src: coquette3, aesthetic: "coquette" },
  { src: glam1, aesthetic: "luxurious" },
  { src: glam2, aesthetic: "luxurious" },
  { src: glam3, aesthetic: "luxurious" },
  { src:grunge1, aesthetic: "grunge" },
  { src: grunge2, aesthetic: "grunge" },
  { src: grunge3, aesthetic: "grunge" },
  { src: punk1, aesthetic: "punk" },
  { src: punk2, aesthetic: "punk" },
  { src: punk3, aesthetic: "punk" },
  { src: y2k1, aesthetic: "y2k" },
  { src: y2k2, aesthetic: "y2k" },
  { src: y2k3, aesthetic: "y2k" }
];

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

export default function AestheticQuiz() {
  const navigate = useNavigate();
  const [imageSets, setImageSets] = useState([]);
  const [currentSet, setCurrentSet] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [scores, setScores] = useState({});
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const shuffled = shuffleArray(ALL_IMAGES);
    const sets = [];
    for (let i = 0; i < 6; i++) {
      sets.push(shuffled.slice(i * 3, i * 3 + 3));
    }
    setImageSets(sets);
  }, []);

  const handleNext = async () => {
    if (!selectedImage) return;

    const newScores = { ...scores, [selectedImage.aesthetic]: (scores[selectedImage.aesthetic] || 0) + 1 };
    setScores(newScores);
    setSelectedImage(null);

    if (currentSet < 5) {
      setIsFlipped(!isFlipped);
      setTimeout(() => setCurrentSet(prev => prev + 1), 300);
    } else {
      const maxScore = Math.max(...Object.values(newScores));
      const topAesthetics = Object.keys(newScores).filter(a => newScores[a] === maxScore);
      const finalAesthetic = topAesthetics[Math.floor(Math.random() * topAesthetics.length)];
      
      try {
        await API.post('/auth/update-aesthetic', { aesthetic_result: finalAesthetic })
        
        const user = JSON.parse(localStorage.getItem('celesticare_user') || '{}')
        user.aesthetic_result = finalAesthetic;
        localStorage.setItem('celesticare_user', JSON.stringify(user));
        
        navigate(`/aesthetic-result/${finalAesthetic}`);
      } catch (err) {
        console.error('Failed to save aesthetic:', err);
        navigate(`/aesthetic-result/${finalAesthetic}`);
      }
    }
  };

  if (imageSets.length === 0) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #090614 0%, #1e173d 35%, #422d6b 70%, #765a96 100%)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'calc(80px + 20px) 20px 40px 20px',
      fontFamily: "'Poppins', sans-serif"
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '24px', width: '100%', maxWidth: '900px', padding: '40px', textAlign: 'center', color: '#fff',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(193, 155, 250, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        transform: isFlipped ? 'rotateY(180deg)' : 'none', transition: 'transform 0.6s ease'
      }}>
        <div style={{ transform: isFlipped ? 'rotateY(180deg)' : 'none', transition: 'transform 0s' }}>
          <h2 style={{ marginBottom: '10px', fontWeight: '800', fontSize: '1.8rem', color: '#ffffff', textShadow: '0 0 15px rgba(193, 155, 250, 0.5)' }}>
            Pick the Image that Speaks to You ({currentSet + 1}/6)
          </h2>
          <p style={{ color: '#d0cce6', marginBottom: '30px', fontSize: '0.95rem' }}>Select the visual that resonates with your core aesthetic.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '25px', justifyItems: 'center' }}>
            {imageSets[currentSet].map((img, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedImage(img)}
                style={{
                  width: '100%', maxWidth: '240px', aspectRatio: '1/1', borderRadius: '18px', overflow: 'hidden', cursor: 'pointer',
                  border: selectedImage === img ? '3px solid #c19bfa' : '3px solid rgba(255, 255, 255, 0.15)',
                  transform: selectedImage === img ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: selectedImage === img ? '0 0 25px rgba(193, 155, 250, 0.6)' : '0 8px 20px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease'
                }}
              >
                <img src={img.src} alt="Aesthetic Choice" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>

          <button 
            disabled={!selectedImage}
            onClick={handleNext}
            style={{ 
              marginTop: '35px', 
              background: selectedImage ? 'linear-gradient(135deg, #c19bfa, #a628c5)' : 'rgba(255, 255, 255, 0.1)', 
              color: '#fff', border: 'none', borderRadius: '30px', padding: '14px 50px', fontSize: '1.05rem', 
              fontWeight: '700', cursor: selectedImage ? 'pointer' : 'not-allowed', 
              opacity: selectedImage ? 1 : 0.5,
              boxShadow: selectedImage ? '0 6px 20px rgba(166, 40, 197, 0.4)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            {currentSet === 5 ? 'Finish Quiz' : 'Next Selection'}
          </button>
        </div>
      </div>
    </div>
  );
}