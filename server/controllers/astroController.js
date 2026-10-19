const User = require('../models/User');

const FREE_ASTRO_API_KEY = process.env.FREE_ASTRO_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const expandSign = (abbr) => {
  const map = { Ari: 'Aries', Tau: 'Taurus', Gem: 'Gemini', Can: 'Cancer', Leo: 'Leo', Vir: 'Virgo', Lib: 'Libra', Sco: 'Scorpio', Sag: 'Sagittarius', Cap: 'Capricorn', Aqu: 'Aquarius', Pis: 'Pisces' };
  return map[abbr] || abbr;
};

exports.saveBirthDetails = async (req, res, next) => {
  try {
    const birthTime = String(req.body.birthTime || '').trim();
    const birthPlace = String(req.body.birthPlace || '').trim();
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(birthTime) || birthPlace.length < 2) {
      return res.status(400).json({ success: false, message: 'Enter a valid birth time and birthplace.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    user.birth_time = birthTime;
    user.birth_place = birthPlace;
    user.astro_insights = null;
    await user.save();
    res.status(200).json({ success: true, message: 'Birth details saved successfully', user });
  } catch (error) {
    next(error);
  }
};

const geocodeBirthPlace = async (birthPlace) => {
  const query = new URLSearchParams({ name: birthPlace, count: '1', language: 'en', format: 'json' });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${query}`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('Birthplace lookup is unavailable.');

  const result = (await response.json()).results?.[0];
  if (!result) throw new Error('Birthplace could not be located. Enter a city or town.');
  return { latitude: result.latitude, longitude: result.longitude, city: result.name };
};

exports.generateChart = async (req, res, next) => {
  try {
    const savedUser = await User.findById(req.user.id).select('astro_insights');
    if (savedUser?.astro_insights) {
      return res.status(200).json({ success: true, chart: savedUser.astro_insights, cached: true });
    }
    if (!FREE_ASTRO_API_KEY) {
      return res.status(503).json({ success: false, message: 'Astrology service is not configured.' });
    }

    const user = req.user;
    const dateObj = new Date(user.birthdate);
    const timeMatch = String(user.birth_time || '').match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    const birthPlace = String(user.birth_place || '').trim();
    if (Number.isNaN(dateObj.getTime()) || !timeMatch || !birthPlace) {
      return res.status(400).json({ success: false, message: 'Save your birth date, time, and birthplace before generating your chart.' });
    }

    const location = await geocodeBirthPlace(birthPlace);

    const postData = {
      year: dateObj.getFullYear(),
      month: dateObj.getMonth() + 1,
      day: dateObj.getDate(),
      hour: Number(timeMatch[1]),
      minute: Number(timeMatch[2]),
      lat: location.latitude,
      lng: location.longitude,
      city: location.city,
    };

    const response = await fetch('https://astro-api-1qnc.onrender.com/api/v1/natal/calculate', {
      method: 'POST',
      headers: { 'x-api-key': FREE_ASTRO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });

    if (!response.ok) throw new Error('The astrology chart service is temporarily unavailable.');
    const astroData = await response.json();
    if (!Array.isArray(astroData.planets) || !Array.isArray(astroData.houses)) {
      throw new Error('The astrology service returned an invalid chart.');
    }

    // Map Core Placements
    const sunPlanet = astroData.planets.find((planet) => planet.id === 'sun');
    const moonPlanet = astroData.planets.find((planet) => planet.id === 'moon');
    const risingSign = astroData.angles_details?.asc?.sign ? expandSign(astroData.angles_details.asc.sign) : 'Unknown';

    // Format Planets & Houses
    const planets = astroData.planets.map(p => ({
      name: p.name,
      sign: expandSign(p.sign),
      degrees: Math.floor(p.pos || 0),
      house: p.house || 0,
      symbol: { sun: '☉', moon: '☾', mercury: '☿', venus: '♀', mars: '♂', jupiter: '♃', saturn: '♄' }[p.id] || '●'
    }));

    const houses = astroData.houses.map(h => ({
      number: h.house,
      sign: expandSign(h.sign),
      degrees: Math.floor(h.pos || 0)
    }));

    res.status(200).json({
      success: true,
      chart: {
        sun_sign: sunPlanet ? expandSign(sunPlanet.sign) : expandSign(user.zodiac_sign || 'Unknown'),
        moon_sign: moonPlanet ? expandSign(moonPlanet.sign) : 'Unknown',
        rising_sign: risingSign,
        sun_degrees: Math.floor(sunPlanet?.pos || 0),
        planets,
        houses
      }
    });
  } catch (error) {
    console.error('Astro chart generation failed:', error.message);
    res.status(502).json({ success: false, message: error.message || 'Unable to generate your chart.' });
  }
};

exports.saveChart = async (req, res, next) => {
  try {
    if (!req.body.chart || typeof req.body.chart !== 'object') {
      return res.status(400).json({ success: false, message: 'A valid chart is required.' });
    }
    const user = await User.findByIdAndUpdate(req.user.id, { $set: { astro_insights: req.body.chart } }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, chart: user.astro_insights });
  } catch (error) {
    next(error);
  }
};

exports.enhanceChart = async (req, res, next) => {
  try {
    const { chartData } = req.body;
    if (!chartData || !GEMINI_API_KEY) {
      return res.status(200).json({ success: true, enhancedData: {}, available: false });
    }
    
    let prompt = `You are a professional astrologer. Analyze this birth chart and provide mystical, personalized insights. DO NOT give generic statements. Write 3-4 sentences explaining how this placement affects their life.\n\n`;
    prompt += `Sun: ${chartData.sun_sign} ${chartData.sun_degrees}°\nMoon: ${chartData.moon_sign}\nRising: ${chartData.rising_sign}\n\n`;
    prompt += `Return a JSON object strictly matching this structure: {"houses": [{"number": 1, "insight": "..."}], "planets": [{"name": "Sun", "influence": "..."}], "life_purpose": "...", "element_balance": "...", "modal_balance": "..."}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 8192 }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Gemini enhancement service is unavailable.');
    const geminiData = await response.json();
    let text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini returned an empty response.');
    
    // Clean markdown blocks
    text = text.replace(/```(?:json)?\s*|\s*```/g, '').trim();
    const enhancedData = JSON.parse(text);

    const currentUser = await User.findById(req.user.id);
    if (currentUser) {
      const mergedChart = { ...chartData, ...enhancedData };
      if (enhancedData.houses) mergedChart.houses = chartData.houses.map((house) => ({ ...house, ...enhancedData.houses.find((item) => item.number === house.number) }));
      if (enhancedData.planets) mergedChart.planets = chartData.planets.map((planet) => ({ ...planet, ...enhancedData.planets.find((item) => item.name === planet.name) }));
      currentUser.astro_insights = mergedChart;
      await currentUser.save({ validateBeforeSave: false });
    }

    res.status(200).json({ success: true, enhancedData });
  } catch (error) {
    console.error('Astro chart enhancement failed:', error.message);
    res.status(502).json({ success: false, message: 'Personalized AI insights are temporarily unavailable.' });
  }
};
