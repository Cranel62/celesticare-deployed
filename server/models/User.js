const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    legacyId: { type: String },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      default: null,
      trim: true,
    },
    gender: { type: String, default: '' },
    birthdate: { type: Date, default: null },
    zodiac_sign: { type: String, default: '' },
    undertone: { type: String, default: '' },
    aesthetic_result: { type: String, default: '' },
    style_result: { type: String, default: '' },
    birth_time: { type: String, default: '' },
    birth_place: { type: String, default: '' },
    security_setup_complete: { type: Boolean, default: false },
    security_questions: { type: [{ question: String, answerHash: String }], default: [], select: false },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    is_admin: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    deletedAt: { type: Date, default: null },
    verificationToken: String,
    verificationTokenExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  // Guard against double-hashing legacy passwords
  if (this.password.startsWith('$2y$') || this.password.startsWith('$2a$')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  let hash = this.password;
  if (hash.startsWith('$2y$')) {
    hash = '$2a$' + hash.substring(4);
  }
  return await bcrypt.compare(enteredPassword, hash);
};

userSchema.methods.createEmailVerificationToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
  return rawToken;
};

module.exports = mongoose.model('User', userSchema);