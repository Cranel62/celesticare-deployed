require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const User = require('./models/User');
const UserOutfit = require('./models/UserOutfit');
const UserFeedback = require('./models/UserFeedback');

async function migrateData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Migration] Connected to MongoDB Atlas.');

    const rawData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'celesticare.json'), 'utf-8')
    );

    // Extract table arrays from JSON export
    const usersTable = rawData.find((t) => t.name === 'users')?.data || [];
    const feedbackTable = rawData.find((t) => t.name === 'user_feedback')?.data || [];
    const outfitsTable = rawData.find((t) => t.name === 'user_outfits')?.data || [];

    console.log(`Found: ${usersTable.length} users, ${feedbackTable.length} feedbacks, ${outfitsTable.length} outfits.`);

    // 1. Seed Users (existing users marked as verified)
    const userIdMap = {}; // Maps SQL id -> Mongo _id

    for (const u of usersTable) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) {
        const newUser = await User.create({
          legacyId: u.id,
          username: u.username,
          name: u.name,
          email: u.email,
          password: u.password, // Raw $2y$ hash preserved
          role: u.is_admin === '1' ? 'admin' : 'user',
          is_admin: u.is_admin === '1',
          zodiac_sign: u.zodiac_sign,
          undertone: u.undertone,
          birthdate: u.birthdate ? new Date(u.birthdate) : null,
          gender: u.gender,
          season: u.season,
          aesthetic_result: u.aesthetic_result,
          style_result: u.style_result,
          birth_time: u.birth_time,
          birth_place: u.birth_place,
          isVerified: true, // Legacy accounts are pre-verified
          verificationToken: null,
          verificationTokenExpires: null,
        });
        userIdMap[u.id] = newUser._id;
      } else {
        userIdMap[u.id] = existing._id;
      }
    }
    console.log('✅ Users synchronized.');

    // 2. Seed Outfits
    for (const o of outfitsTable) {
      const mongoUserId = userIdMap[o.user_id];
      if (mongoUserId) {
        let parsedOutfit = null;
        try {
          parsedOutfit = o.outfit_data ? JSON.parse(o.outfit_data) : null;
        } catch {
          parsedOutfit = o.outfit_data;
        }

        await UserOutfit.create({
          legacyId: o.id,
          user: mongoUserId,
          clothing_src: o.clothing_src,
          clothing_category: o.clothing_category,
          clothing_style: o.clothing_style,
          gender: o.gender,
          outfit_data: parsedOutfit,
        });
      }
    }
    console.log('✅ Outfits synchronized.');

    // 3. Seed Feedback
    for (const f of feedbackTable) {
      const mongoUserId = userIdMap[f.user_id];
      if (mongoUserId) {
        await UserFeedback.create({
          legacyId: f.id,
          user: mongoUserId,
          experience: f.experience,
          fashion_match: f.fashion_match,
          favorite_feature: f.favorite_feature,
          vibe: f.vibe,
          suggestions: f.suggestions,
        });
      }
    }
    console.log('✅ Feedback synchronized.');
    console.log('[Migration Complete] MongoDB Atlas is ready for Brevo verification flow.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateData();