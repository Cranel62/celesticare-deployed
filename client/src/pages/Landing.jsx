import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import zodiacWheel from '../assets/images/zodiac_circle.png';
import astralMusic from '../music/Astral.mp3';
import '../styles/Landing.css';

export default function Landing() {
  const wheelRef = useRef(null);
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});

  useEffect(() => {
    let rafId = null;
    let angle = 0;
    const step = () => {
      angle = (angle + 0.15) % 360;
      if (wheelRef.current) {
        wheelRef.current.style.transform = `rotate(${angle}deg)`;
      }
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);

    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => setIsMuted(true));
    }

    const starfield = document.getElementById('starfield');
    if (starfield) {
      starfield.innerHTML = '';
      for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'landing-star';
        const size = Math.random() < 0.1 ? Math.random() * 4 + 3 : Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.opacity = Math.random() * 0.8 + 0.2;
        starfield.appendChild(star);
      }
    }

    return () => cancelAnimationFrame(rafId);
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  const handleCardClick = (sign) => {
    setFlippedCards((prev) => ({
      ...prev,
      [sign]: !prev[sign]
    }));
  };

  return (
    <div className="landing-body">
      <audio ref={audioRef} autoPlay loop>
        <source src={astralMusic} type="audio/mpeg" />
      </audio>

      <div className={`landing-music-control ${isMuted ? 'muted' : ''}`} onClick={toggleMusic} title="Toggle Ambient Audio">
        {isMuted ? '🔇' : '🔈'}
      </div>

      <div className="landing-starfield" id="starfield"></div>
      
      <div className="landing-content-container">
        
        {/* HERO SECTION */}
        <section className="landing-hero-section">
          <div className="landing-hero-text">
            <h1>Let the stars guide your taste</h1>
            <p>
              The stylist of the stars, CelestiCare, gives you the latest fashion tips by using your zodiac sign
              and matching it to your preferred style preferences and aesthetics.
            </p>
            <Link to="/get-to-know" className="landing-hero-btn">Get Started</Link>
          </div>
          <div className="landing-hero-image">
            <img ref={wheelRef} src={zodiacWheel} alt="Zodiac Wheel" className="landing-wheel" draggable="false" />
          </div>
        </section>

        {/* INTRO ANNOUNCEMENT BAR */}
        <div className="landing-new-features-intro">
          <div className="container">
            <h3>⟡˙⋆ Introducing Deeper Cosmic Insights ⋆˙⟡</h3>
            <p>We've expanded our celestial offerings to provide you with more personalized guidance than ever before</p>
          </div>
        </div>

        {/* FEATURE HIGHLIGHT 1 */}
        <section className="landing-features-section">
          <div className="container">
            <h2 className="landing-section-title">Discover Our New Mystic Features</h2>
            <p className="landing-section-subtitle">Go beyond your sun sign with comprehensive astrological readings and tarot guidance</p>
            <div className="row g-4">
              <div className="col-md-4">
                <div className="landing-feature-card">
                  <div className="landing-feature-icon"><i className="fas fa-globe-americas"></i></div>
                  <h4>Complete Birth Chart</h4>
                  <p>Get your full planetary placements and houses by providing your birth time and location. We calculate your Moon sign, Rising sign, and all celestial positions for a truly personalized reading.</p>
                  <div className="landing-feature-badge">Philippines Locations</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="landing-feature-card">
                  <div className="landing-feature-icon"><i className="fas fa-crystal-ball"></i></div>
                  <h4>Mystic Arcana Tarot</h4>
                  <p>Access all 78 cards of the tarot - Major Arcana, Cups, Wands, Swords, and Pentacles. Choose between Single Card Reading or Four-Card Spread.</p>
                  <div className="landing-feature-badge">Conflict Resolution</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="landing-feature-card">
                  <div className="landing-feature-icon"><i className="fas fa-brain"></i></div>
                  <h4>Head vs. Heart Guidance</h4>
                  <p>Our four-card spread reveals the conflict between your rational thoughts and emotional desires, then consults on your possible path forward with clarity and purpose.</p>
                  <div className="landing-feature-badge">Path Consulting</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE HIGHLIGHT 2 */}
        <section className="landing-features-section" style={{ background: 'rgba(0, 0, 0, 0.08)' }}>
          <div className="container">
            <h2 className="landing-section-title">How CelestiCare Works</h2>
            <p className="landing-section-subtitle">We combine astrology with fashion to help you express your true self through clothing.</p>
            <div className="row g-4">
              <div className="col-md-4">
                <div className="landing-small-card">
                  <div className="landing-feature-icon"><i className="fas fa-chart-line"></i></div>
                  <h4>Personalized Moodboard</h4>
                  <p>Receive a personalized magazine-style visual summary of your complete style profile and personal data.</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="landing-small-card">
                  <div className="landing-feature-icon"><i className="fas fa-palette"></i></div>
                  <h4>Color Guidance</h4>
                  <p>Discover which colors will bring you positive energy and complement your natural aura each day.</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="landing-small-card">
                  <div className="landing-feature-icon"><i className="fas fa-tshirt"></i></div>
                  <h4>Virtual Style Studio</h4>
                  <p>A virtual closet where users mix-and-match fashion items to discover their personal style through interactive dressing.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EXPLORE ZODIAC FASHION */}
        <section className="landing-zodiac-section">
          <div className="container">
            <h2 className="landing-section-title">Explore Zodiac Fashion</h2>
            <p className="landing-section-subtitle">Click on any sign card to flip it and reveal its signature aesthetic traits and fashion energy.</p>
            <div className="row g-4">
              {[
                { s: 'Aries', i: '♈', d: 'Bold & Dynamic - Confident, energetic styles with fiery accents' },
                { s: 'Taurus', i: '♉', d: 'Luxurious & Earthy - Quality fabrics and nature-inspired tones' },
                { s: 'Gemini', i: '♊', d: 'Versatile & Expressive - Mix-and-match pieces for every occasion' },
                { s: 'Cancer', i: '♋', d: 'Comforting & Nostalgic - Soft textures and sentimental pieces' },
                { s: 'Leo', i: '♌', d: 'Dramatic & Regal - Bold statements and attention-grabbing pieces' },
                { s: 'Virgo', i: '♍', d: 'Refined & Practical - Tailored fits and functional elegance' },
                { s: 'Libra', i: '♎', d: 'Harmonious & Chic - Balanced ensembles and romantic touches' },
                { s: 'Scorpio', i: '♏', d: 'Intense & Mysterious - Dark hues and transformative pieces' },
                { s: 'Sagittarius', i: '♐', d: 'Adventurous & Free - Bohemian styles and travel-ready outfits' },
                { s: 'Capricorn', i: '♑', d: 'Classic & Ambitious - Timeless silhouettes and professional elegance' },
                { s: 'Aquarius', i: '♒', d: 'Innovative & Unique - Futuristic cuts and unconventional styling' },
                { s: 'Pisces', i: '♓', d: 'Dreamy & Artistic - Flowing fabrics and ethereal, romantic looks'},
              ].map((zodiac) => (
                <div className="col-md-3 col-6" key={zodiac.s}>
                  <div 
                    className={`landing-flip-card ${flippedCards[zodiac.s] ? 'flipped' : ''}`}
                    onClick={() => handleCardClick(zodiac.s)}
                  >
                    <div className="landing-flip-card-inner">
                      {/* FRONT FACE: Word and Symbol Only */}
                      <div className="landing-flip-card-front">
                        <h5 className="landing-zodiac-title-only">{zodiac.s}</h5>
                        <div className="landing-zodiac-icon-only">{zodiac.i}</div>
                        <span className="landing-click-hint">Click to Flip</span>
                      </div>
                      {/* BACK FACE: Traits / Description */}
                      <div className="landing-flip-card-back">
                        <h5>{zodiac.s}</h5>
                        <p className="landing-zodiac-desc">{zodiac.d}</p>
                        <span className="landing-click-hint">Click to Flip Back</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* READY TO TRANSFORM YOUR STYLE */}
        <section className="landing-cta-section">
          <div className="container">
            <div className="landing-cta-content">
              <h2>Ready to Transform Your Style?</h2>
              <p>Join thousands of fashion-forward individuals who use astrology to enhance their personal style and discover deeper cosmic insights.</p>
              <Link to="/register" className="landing-cta-btn">Sign In to Your Account</Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="landing-footer">
          <div className="container">
            <div className="row">
              <div className="col-lg-5 mb-4">
                <div className="landing-footer-brand">CELESTICARE</div>
                <p className="landing-footer-description">
                  Where astrology meets fashion. Discover your unique style through the wisdom of the stars and express your true cosmic self.
                </p>
                <div className="landing-social-links">
                  <a href="#"><i className="fab fa-facebook-f"></i></a>
                  <a href="#"><i className="fab fa-instagram"></i></a>
                  <a href="#"><i className="fab fa-twitter"></i></a>
                  <a href="#"><i className="fab fa-pinterest"></i></a>
                </div>
              </div>
              <div className="col-lg-3 col-md-4 mb-4">
                <div className="landing-footer-links">
                  <h5>Quick Links</h5>
                  <Link to="/">Home</Link>
                  <Link to="/zodiac">Zodiacs</Link>
                  <Link to="/forecast">Arcana</Link>
                  <Link to="/about">About Us</Link>
                </div>
              </div>
              <div className="col-lg-4 col-md-4 mb-4">
                <div className="landing-footer-links">
                  <h5>Newsletter</h5>
                  <p className="landing-footer-description" style={{marginBottom: '1rem'}}>Get daily fashion tips based on your zodiac sign.</p>
                  <div className="input-group mb-3">
                    <input type="email" className="form-control landing-subscribe-input" placeholder="Your email address" />
                    <button className="btn landing-subscribe-btn">Subscribe</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="landing-footer-bottom">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <p className="mb-0">&copy; 2026 CelestiCare. All rights reserved.</p>
                </div>
                <div className="col-md-6 text-md-end">
                  <Link to="/privacy" className="me-3">Privacy Policy</Link>
                  <Link to="/terms">Terms of Service</Link>
                </div>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
