const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: [true,'Name is required'], trim: true, minlength: 2, maxlength: 60 },
  email:    { type: String, required: [true,'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  password: { type: String, required: [true,'Password is required'], minlength: 6, select: false },
  phone:    { type: String, trim: true, default: '' },
  role:     { type: String, enum: ['donor','creator','admin'], default: 'donor' },
  alertCategories:    { type: [String], default: [] },
  totalDonated:       { type: Number,  default: 0 },
  campaignsSupported: { type: Number,  default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method: compare password
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);