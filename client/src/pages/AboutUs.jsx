import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import '../styles/AboutUs.css';

export default function AboutUs() {
  const [activeTab, setActiveTab] = useState('who');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    experience: '',
    fashion_match: '',
    favorite_feature: '',
    vibe: '',
    suggestions: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('celesticare_token');
    setIsLoggedIn(!!token);
  }, []);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      // Connects to your backend API route
      await API.post('/feedback/submit', formData);
      setMessage("✨ Thank you for your feedback!");
      setFormData({ experience: '', fashion_match: '', favorite_feature: '', vibe: '', suggestions: '' });
      setTimeout(() => setIsModalOpen(false), 2000);
    } catch (err) {
      setMessage("❌ Error submitting feedback. Please try again.");
    }
  };

  return (
    <div className="about-body">
      <main className="page-wrapper">
        <section className="about-card">
          <div className="about-header">
            <div className="about-header-inner">
              <h1>CELESTICARE</h1>
              <div className="subtitle">ABOUT US</div>
            </div>
          </div>

          <div className="about-content-body">
            {/* Tabs */}
            <div className="info-tabs">
              <button className={`tab-btn ${activeTab === 'who' ? 'active' : ''}`} onClick={() => setActiveTab('who')}>
                Who We Are
              </button>
              <button className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`} onClick={() => setActiveTab('team')}>
                Our Team
              </button>
            </div>

            {/* WHO WE ARE */}
            {activeTab === 'who' && (
              <section className="about-section active">
                <div className="section-headline">
                  <h2>Style Written in the Stars</h2>
                  <div className="subline">
                    Celesticare blends astrology and fashion to help you express who you are — not just what's trending. We create personalized style guidance based on your zodiac traits, energy, and aesthetic identity.
                  </div>
                </div>

                <article className="info-card">
                  <h3>Our Purpose</h3>
                  <div className="subsection-title">Fashion Meets Self-Discovery</div>
                  <p>
                    We believe style should feel personal. Instead of asking "What's popular right now?" we ask "What feels like you?" Celesticare turns your birth details and sign traits into wearable inspiration — outfits, palettes, and aesthetics you actually connect with.
                  </p>
                  <p>
                    Through our platform, users can create a profile, share birth information, and receive curated outfit and beauty suggestions inspired by their sign.
                  </p>

                  <div className="subsection-title" style={{ marginTop: '2rem' }}>Mission</div>
                  <p>To empower individuality through a thoughtful blend of astrology and fashion — helping people express their real selves, not just follow trends.</p>

                  <div className="subsection-title" style={{ marginTop: '2rem' }}>Vision</div>
                  <p>To become the go-to space for cosmic styling: a platform where identity, creativity, and wardrobe come together.</p>
                </article>
              </section>
            )}

            {/* OUR TEAM */}
            {activeTab === 'team' && (
              <section className="about-section active">
                <div className="section-headline">
                  <h2>Meet the Team</h2>
                  <div className="subline">The people shaping Celesticare and building the experience.</div>
                </div>

                <article className="info-card">
                  <h3>Core Team</h3>
                  <div className="team-grid">
                    {[
                      {
                        name: 'Elle Skye S. Babao',
                        role: 'Project Manager',
                        phrase: 'Guiding Celesticare from vision to launch.'
                      },
                      {
                        name: 'Ma. Monica L. Deloa',
                        role: 'UI/UX Designer',
                        phrase: 'Making every interaction feel clear and considered.'
                      },
                      {
                        name: 'Ken Joseph L. Estayo',
                        role: 'Frontend Developer',
                        phrase: 'Bringing cosmic ideas to life in the interface.'
                      },
                      {
                        name: 'Jovanie C. Nadado',
                        role: 'Quality Assurance',
                        phrase: 'Finding the details that make the experience dependable.'
                      },
                      {
                        name: 'Dave E. Pimentel',
                        role: 'Presentation Specialist',
                        phrase: 'Turning the story into a presentation that shines.'
                      },
                      {
                        name: 'Mark Lawrence M. Soriano',
                        role: 'Database Administrator',
                        phrase: 'Keeping every piece of data in orbit.'
                      },
                      {
                        name: 'Jerald E. Vinoya',
                        role: 'Documentation Manager',
                        phrase: 'Giving every idea a clear place to land.'
                      }
                    ].map((member) => (
                      <div className="team-card" key={member.name}>
                        <div className="member-role">{member.role}</div>
                        <div className="member-name">{member.name}</div>
                        <div className="member-desc">{member.phrase}</div>
                      </div>
                    ))}
                  </div>
                </article>
              </section>
            )}
          </div>
        </section>
      </main>

      {/* Floating Feedback Trigger */}
      <button className="feedback-btn" onClick={() => setIsModalOpen(true)}>
        <i className="fas fa-comment-dots" style={{ marginRight: '8px' }}></i> Give Feedback
      </button>

      {/* Conditional Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setIsModalOpen(false) }}>
          <div className="modal-content">
            
            {isLoggedIn ? (
              // LOGGED IN FEEDBACK FORM
              <>
                <div className="modal-header">
                  <h2>Share Your Experience</h2>
                  <button className="close-modal" onClick={() => setIsModalOpen(false)}>&times;</button>
                </div>
                <div className="modal-body">
                  {message && <div className="message">{message}</div>}
                  <form onSubmit={handleFeedbackSubmit}>
                    <div className="field-group">
                      <label>Overall Experience</label>
                      <select required value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})}>
                        <option value="">Select your experience</option>
                        <option value="5">Excellent ⭐⭐⭐⭐⭐</option>
                        <option value="4">Great ⭐⭐⭐⭐</option>
                        <option value="3">Average ⭐⭐⭐</option>
                        <option value="2">Fair ⭐⭐</option>
                        <option value="1">Poor ⭐</option>
                      </select>
                    </div>
                    <div className="field-group">
                      <label>Did the fashion suggestions match your vibe?</label>
                      <select required value={formData.fashion_match} onChange={(e) => setFormData({...formData, fashion_match: e.target.value})}>
                        <option value="">Select an option</option>
                        <option value="Very accurate">Very accurate</option>
                        <option value="Somewhat">Somewhat</option>
                        <option value="Not really">Not really</option>
                      </select>
                    </div>
                    <div className="field-group">
                      <label>Favorite Feature</label>
                      <select required value={formData.favorite_feature} onChange={(e) => setFormData({...formData, favorite_feature: e.target.value})}>
                        <option value="">Select your favorite</option>
                        <option value="Color Analysis">Color Analysis</option>
                        <option value="Fashion Forecast">Fashion Forecast</option>
                        <option value="Aesthetic Quiz">Aesthetic Quiz</option>
                        <option value="Virtual Style Studio">Virtual Style Studio</option>
                      </select>
                    </div>
                    <div className="field-group">
                      <label>Describe the website's vibe in one word</label>
                      <input type="text" required placeholder="e.g., Magical, Chic, Inspiring" value={formData.vibe} onChange={(e) => setFormData({...formData, vibe: e.target.value})} />
                    </div>
                    <div className="field-group">
                      <label>Any suggestions or wishes?</label>
                      <textarea placeholder="Tell us what you'd love to see..." value={formData.suggestions} onChange={(e) => setFormData({...formData, suggestions: e.target.value})}></textarea>
                    </div>
                    <button type="submit" className="submit-btn">Submit Feedback</button>
                  </form>
                </div>
              </>
            ) : (
              // GUEST LOGIN PROMPT
              <>
                <div className="modal-header">
                  <h2>Join Our Community</h2>
                  <button className="close-modal" onClick={() => setIsModalOpen(false)}>&times;</button>
                </div>
                <div className="modal-body" style={{ textAlign: 'center' }}>
                  <i className="fas fa-users" style={{ fontSize: '3rem', color: '#6b5b95', marginBottom: '1rem' }}></i>
                  <h4 style={{ color: '#f0ecfc', marginBottom: '15px' }}>Want to share your thoughts?</h4>
                  <p style={{ color: '#d0cce6', marginBottom: '25px' }}>Create an account to provide feedback and get personalized style recommendations!</p>
                  <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                    <Link to="/login" className="login-prompt-btn">Login</Link>
                    <Link to="/register" className="login-prompt-btn black">Sign Up</Link>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
