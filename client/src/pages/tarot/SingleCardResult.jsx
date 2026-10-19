import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../../services/api';
import '../../styles/Tarot.css';
import { tarotCardSrc, TAROT_BACK } from '../../utils/tarotImages';

const TAROT_CARDS = {
  9: {
    name: 'The Hermit',
    upright: 'Soul-searching, introspection, inner guidance.',
    keywords: 'introspection, solitude, guidance, inner wisdom',
    essence: 'The light in the darkness. Wisdom found in solitude.',
    challenge: 'Withdrawal becomes avoidance rather than reflection.',
    opportunity: 'A period of solitude brings profound insight.',
    ritual: 'Spend 10 minutes in complete silence, listening inward.',
    affirmation: 'I find wisdom and light in the quiet spaces.',
    archetype: 'The Sage',
    archetypes: ['The Sage', 'The Wise Elder', 'The Seeker of Truth'],
    myth: 'Diotima, teaching Socrates the deepest mysteries of love.',
    question: 'What truth are you seeking in the silence?',
    advice: 'Turn inward. The answers you seek are within.',
    shadow_work: 'Notice where solitude is restoring you — and where it may be keeping you from connection.',
    soul_question: "If you could hear your soul's voice clearly, what would it say?",
    fashion: 'Simple, comfortable, earthy layers; functional pieces',
    colors: ['#ffb900', '#ffd260', '#e9a900', '#ffe28c'],
    style_tip: 'Invest in quality loungewear that feels like a hug.',
    style_challenge: 'Spend a day in simple, comfortable clothes and notice how you feel.',
    evening: "Journal what you've discovered in today's silences.",
    morning: 'Begin the day slowly and listen for your own inner guidance.',
    afternoon: 'Take a quiet moment away from the noise and return to what matters.'
  },
  18: {
    name: 'The Moon',
    upright: 'Illusion, fear, anxiety, subconscious, intuition.',
    keywords: 'intuition, mystery, dreams, illusion',
    essence: "Trust your intuition, even when things aren't clear.",
    challenge: 'Overcoming self-doubt and seeing through illusions.',
    opportunity: 'Tapping into deep creative reservoirs.',
    ritual: 'Light a silver candle and meditate on your true desires.',
    affirmation: 'I trust the unseen forces guiding my path.',
    archetype: 'The Dreamer',
    archetypes: ['The Dreamer', 'The Intuitive', 'The Seeker'],
    myth: 'Associated with Artemis and the glowing silver moon.',
    question: 'What are you not seeing clearly?',
    advice: 'Look beyond the surface; your subconscious holds the answers.',
    shadow_work: 'Explore the fears you project onto others. Sit with discomfort until it becomes a familiar friend.',
    soul_question: 'What secret is my soul trying to whisper to me in the dark?',
    fashion: 'Moon phase jewelry, iridescent fabrics, dreamy layers.',
    colors: ['#c0c0c0', '#483D8B', '#191970', '#bda6df'],
    style_tip: 'Wear iridescent pieces that shift colors in different light.',
    style_challenge: 'Incorporate a piece of silver jewelry you rarely wear.',
    morning: 'The morning mist hides the path, but your inner compass is true.',
    afternoon: 'Daylight reveals what the night concealed. Trust your insights.',
    evening: 'As shadows lengthen, your intuitive powers are at their peak.'
  }
};

function getPeriod() {
  const hour = new Date().getHours();
  if (hour < 12) return { key: 'morning', label: 'This Morning' };
  if (hour < 18) return { key: 'afternoon', label: 'This Afternoon' };
  return { key: 'evening', label: 'This Evening' };
}

export default function SingleCardResult() {
  const { id } = useParams();
  const cardId = parseInt(id, 10) || 18;
  const card = TAROT_CARDS[cardId] || TAROT_CARDS[18];
  const period = getPeriod();
  const timeMessage = card[period.key] || card.essence;
  const [showEntrance, setShowEntrance] = useState(true);
  const [entranceFading, setEntranceFading] = useState(false);
  const infoColumnRef = useRef(null);

  useEffect(() => {
    const timer1 = setTimeout(() => setEntranceFading(true), 1500);
    const timer2 = setTimeout(() => setShowEntrance(false), 2200);
    API.post('/tarot/save', {
      reading_type: 'single',
      cards: [{ id: cardId, name: card.name, arcana: 'major', suit: 'major' }],
      interpretation: card.upright,
      spread_data: { time_message: timeMessage }
    })
      .catch(err => console.error('Save reading error:', err));
    API.put('/tarot/single-card', { cardId })
      .catch(err => console.error('Save selected card error:', err));

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [cardId, card, timeMessage]);

  return (
    <main className="tarot-body single-result-page">
      <div className="stars" aria-hidden="true" />

      {showEntrance && (
        <div className={`single-card-entrance ${entranceFading ? 'fade-out' : ''}`} aria-hidden="true">
          <img
            src={tarotCardSrc(cardId)}
            alt=""
            onError={event => { event.currentTarget.src = TAROT_BACK; }}
          />
        </div>
      )}

      <div className="single-reading-layout">
        <aside className="single-card-column">
          <div className="single-card-frame">
            <img
              src={tarotCardSrc(cardId)}
              alt={card.name}
              onError={event => { event.currentTarget.src = TAROT_BACK; }}
            />
          </div>
          <p className="single-card-essence">“{card.essence}”</p>
        </aside>

        <div className="single-info-column" ref={infoColumnRef}>
          <section className="single-panel single-daily">
            <h2><span aria-hidden="true">⌛</span>{period.label}</h2>
            <p>{timeMessage}</p>
          </section>

          <section className="single-panel single-meaning">
            <h2><span aria-hidden="true">▣</span>Meaning</h2>
            <p>{card.upright}</p>
            <div className="single-keywords">
              {card.keywords.split(',').map(keyword => (
                <span key={keyword}>{keyword.trim()}</span>
              ))}
            </div>
          </section>

          <section className="single-insight-grid" aria-label="Challenge and opportunity">
            <article className="single-insight single-challenge">
              <h3>CHALLENGE</h3>
              <p>{card.challenge}</p>
            </article>
            <article className="single-insight single-opportunity">
              <h3>OPPORTUNITY</h3>
              <p>{card.opportunity}</p>
            </article>
          </section>

          <p className="single-ritual">{card.ritual}</p>
          <p className="single-affirmation">{card.affirmation}</p>

          <section className="single-panel single-archetype">
            <h2><span aria-hidden="true">♟</span>Archetype</h2>
            <div className="single-keywords">
              {(card.archetypes || [card.archetype]).map(archetype => (
                <span key={archetype}>{archetype}</span>
              ))}
            </div>
            <p className="single-myth">{card.myth}</p>
          </section>

          <section className="single-panel single-reflection">
            <h2><span aria-hidden="true">☁</span>Reflection</h2>
            <h3>{card.question}</h3>
            <p>{card.advice}</p>
          </section>

          <details className="single-shadow-work">
            <summary><span aria-hidden="true">✦</span>Shadow Work</summary>
            <p>{card.shadow_work}</p>
          </details>

          <blockquote className="single-soul-question">{card.soul_question}</blockquote>

          <section className="single-panel single-style">
            <h2><span aria-hidden="true">♥</span>Style</h2>
            <p className="single-fashion">{card.fashion}</p>
            <div className="single-palette">
              <h3><span aria-hidden="true">🎨</span>Color Palette</h3>
              <div className="single-color-swatches">
                {card.colors.map(color => (
                  <span key={color} style={{ backgroundColor: color }} title={color} />
                ))}
              </div>
              <p className="single-style-tip">{card.style_tip}</p>
              <p className="single-style-challenge">{card.style_challenge}</p>
            </div>
          </section>

          <div className="single-result-actions">
            <Link to="/tarot/single" className="return-button">← New Reading</Link>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="single-scroll-button"
        aria-label="Scroll to the end of the reading"
        onClick={() => infoColumnRef.current?.scrollTo({
          top: infoColumnRef.current.scrollHeight,
          behavior: 'smooth'
        })}
      >
        <span aria-hidden="true">⌄</span>
      </button>
    </main>
  );
}
