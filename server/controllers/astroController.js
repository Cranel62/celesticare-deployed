const User = require('../models/User');

// Keep provider credentials server-side. Values are loaded from server/.env by server.js
// and from the hosting provider's environment in production.
const NATALCHART_API_KEY = String(process.env.NATALCHART_API_KEY || process.env.FREE_ASTRO_API_KEY || '').trim();
const GEMINI_API_KEY = String(process.env.GEMINI_API_KEY || '').trim();
const NATALCHART_API_URL = String(process.env.NATALCHART_API_URL || 'https://api.natalchart.ai/v1/chart/full').trim();

const expandSign = (abbr) => {
  const map = { Ari: 'Aries', Tau: 'Taurus', Gem: 'Gemini', Can: 'Cancer', Leo: 'Leo', Vir: 'Virgo', Lib: 'Libra', Sco: 'Scorpio', Sag: 'Sagittarius', Cap: 'Capricorn', Aqu: 'Aquarius', Pis: 'Pisces' };
  return map[abbr] || abbr;
};

exports.saveBirthDetails = async (req, res, next) => {
  try {
    const birthTime = String(req.body.birthTime || '').trim();
    const savedBirthPlace = String(req.body.birthPlace || '').trim();
    const savedPlaceParts = savedBirthPlace.split(',');
    const birthCity = String(req.body.birthCity || savedPlaceParts.shift() || '').trim();
    const birthProvince = String(req.body.birthProvince || savedPlaceParts.join(',') || '').trim();
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(birthTime) || birthCity.length < 2 || birthProvince.length < 2) {
      return res.status(400).json({ success: false, message: 'Enter a valid birth time, city, and province.' });
    }
    const birthPlace = `${birthCity}, ${birthProvince}`;

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

const normalizeLocationPart = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const getBirthDateString = (birthdate) => {
  if (!birthdate) return '';
  const date = new Date(birthdate);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
};

const getChartBirthData = (user) => ({
  date: getBirthDateString(user.birthdate),
  time: String(user.birth_time || '').trim(),
  place: String(user.birth_place || '').trim(),
  timezone: 'Asia/Manila',
});

const chartMatchesBirthData = (chart, birthData) => (
  chart?.birth_data
  && chart.birth_data.date === birthData.date
  && chart.birth_data.time === birthData.time
  && chart.birth_data.place === birthData.place
  && chart.birth_data.timezone === birthData.timezone
);

const geocodeBirthPlace = async (birthPlace) => {
  const placeParts = String(birthPlace || '').split(',');
  const city = placeParts.shift()?.trim() || '';
  const province = placeParts.join(',').trim();
  const search = async (name) => {
    const query = new URLSearchParams({ name, count: '100', language: 'en', format: 'json' });
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${query}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('Birthplace lookup is unavailable.');
    return (await response.json()).results || [];
  };
  const results = await search(city || birthPlace);
  const normalizedProvince = normalizeLocationPart(province);
  const provinceMatches = (candidate) => {
    const fields = [candidate.admin1, candidate.admin2, candidate.admin3]
      .map(normalizeLocationPart).filter(Boolean);
    return fields.some((field) => field === normalizedProvince || field.includes(normalizedProvince) || normalizedProvince.includes(field));
  };
  const isPhilippines = (candidate) => normalizeLocationPart(candidate.country) === 'philippines';
  let result = results.find((candidate) => isPhilippines(candidate) && provinceMatches(candidate));
  if (!result && province) {
    const broaderResults = await search(`${city}, ${province}, Philippines`);
    result = broaderResults.find((candidate) => isPhilippines(candidate) && provinceMatches(candidate));
  }
  if (!result) throw new Error('Birthplace could not be located. Enter a city or town.');
  return { latitude: result.latitude, longitude: result.longitude, city: result.name };
};

exports.generateChart = async (req, res, next) => {
  try {
    const user = req.user;
    const dateObj = new Date(user.birthdate);
    const timeMatch = String(user.birth_time || '').match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    const birthPlace = String(user.birth_place || '').trim();
    if (Number.isNaN(dateObj.getTime()) || !timeMatch || !birthPlace) {
      return res.status(400).json({ success: false, message: 'Save your birth date, time, and birthplace before generating your chart.' });
    }

    const birthData = getChartBirthData(user);
    const savedChart = user.astro_insights;
    if (chartMatchesBirthData(savedChart, birthData)) {
      return res.status(200).json({ success: true, chart: savedChart, cached: true });
    }
    if (!NATALCHART_API_KEY) {
      return res.status(503).json({ success: false, message: 'Astrology service is not configured.' });
    }

    const location = await geocodeBirthPlace(birthPlace);

    const birthDate = `${dateObj.getUTCFullYear()}-${String(dateObj.getUTCMonth() + 1).padStart(2, '0')}-${String(dateObj.getUTCDate()).padStart(2, '0')}`;
    const postData = {
      birth: {
        date: birthDate,
        time: `${timeMatch[1]}:${timeMatch[2]}`,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: birthData.timezone,
        utc_offset: 8,
      },
    };

    const response = await fetch(NATALCHART_API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${NATALCHART_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
      signal: AbortSignal.timeout(20000),
    });

    const responseBody = await response.text();
    if (!response.ok) {
      console.error(`[NatalChart.AI] ${response.status}: ${responseBody.slice(0, 500)}`);
      if (response.status === 401 || response.status === 403) {
        throw new Error('The astrology provider rejected NATALCHART_API_KEY. Update the valid NatalChart.AI key in Render and redeploy.');
      }
      throw new Error('The astrology chart service is temporarily unavailable.');
    }
    let astroData;
    try {
      astroData = JSON.parse(responseBody);
    } catch {
      throw new Error('The astrology chart service returned invalid data.');
    }
    if (!Array.isArray(astroData.planets) || !Array.isArray(astroData.houses)) {
      throw new Error('The astrology service returned an invalid chart.');
    }

    // Map Core Placements
    const planetKey = (planet) => String(planet.name || planet.id || '').toLowerCase();
    const sunPlanet = astroData.planets.find((planet) => planetKey(planet) === 'sun');
    const moonPlanet = astroData.planets.find((planet) => planetKey(planet) === 'moon');
    const risingSign = expandSign(
      astroData.angles?.ascendant?.sign
      || astroData.angles?.asc?.sign
      || astroData.angles_details?.asc?.sign
      || astroData.ascendant?.sign
      || 'Unknown'
    );

    // Format Planets & Houses
    const planets = astroData.planets.map(p => ({
      name: p.name || p.id || 'Unknown',
      sign: expandSign(p.sign || ''),
      degrees: Math.floor(p.degreeInSign ?? p.pos ?? p.degree ?? 0),
      house: p.house ?? 0,
      symbol: { sun: '☉', moon: '☾', mercury: '☿', venus: '♀', mars: '♂', jupiter: '♃', saturn: '♄' }[planetKey(p)] || '●'
    }));

    const houses = astroData.houses.map(h => ({
      number: h.house ?? h.number,
      sign: expandSign(h.sign || ''),
      degrees: Math.floor(h.degreeInSign ?? h.pos ?? h.degree ?? h.longitude ?? 0)
    }));

    res.status(200).json({
      success: true,
      chart: {
        birth_data: birthData,
        sun_sign: sunPlanet ? expandSign(sunPlanet.sign) : expandSign(user.zodiac_sign || 'Unknown'),
        moon_sign: moonPlanet ? expandSign(moonPlanet.sign) : 'Unknown',
        rising_sign: risingSign,
        sun_degrees: Math.floor(sunPlanet?.degreeInSign ?? sunPlanet?.pos ?? sunPlanet?.degree ?? 0),
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
    
    let prompt = `You are a professional astrologer writing for a beginner. Use only the exact signs and houses provided in this birth chart. Write concise, personalized, easy-to-understand insights. Make every planet and house explanation different, accurate to its placement, and no more than 1-2 short sentences or 35 words. Avoid repeated wording, vague claims, and unnecessary jargon.\n\n`;
    prompt += `Sun: ${chartData.sun_sign} ${chartData.sun_degrees}°\nMoon: ${chartData.moon_sign}\nRising: ${chartData.rising_sign}\n\n`;
    prompt += `Return a JSON object strictly matching this structure: {"houses": [{"number": 1, "insight": "..."}], "planets": [{"name": "Sun", "influence": "..."}], "life_purpose": "...", "element_balance": "...", "modal_balance": "..."}`;
    const planetaryPlacements = (chartData.planets || [])
      .map((planet) => `${planet.name}: ${planet.sign} ${planet.degrees} degrees in House ${planet.house}`)
      .join('\n');
    const celestialHouses = (chartData.houses || [])
      .map((house) => `House ${house.number}: ${house.sign} ${house.degrees} degrees`)
      .join('\n');
    prompt += `\nFull Planetary Placements:\n${planetaryPlacements}\n\nThe Twelve Celestial Houses:\n${celestialHouses}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 4096 }
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
      mergedChart.enhancement_version = 3;
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
