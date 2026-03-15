const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donorName:    { type: String },
  donorEmail:   { type: String },
  campaign:     { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  campaignTitle:{ type: String },
  amount:       { type: Number, required: true, min: 1 },
  platformFee:  { type: Number, default: 0 },
  totalCharged: { type: Number, default: 0 },

  // Payment details
  paymentMethod: { type: String, enum: ['upi','card','netbanking','wallet'], required: true },
  paymentDetails: {
    upiId:    { type: String, default: '' },
    bank:     { type: String, default: '' },
    wallet:   { type: String, default: '' },
    cardLast4:{ type: String, default: '' },
  },
  transactionId: { type: String, unique: true },
  status: { type: String, enum: ['pending','success','failed','refunded'], default: 'success' },
  isAnonymous: { type: Boolean, default: false },
  message:     { type: String, default: '' },
}, { timestamps: true });

// Auto-generate transaction ID before save
donationSchema.pre('save', function (next) {
  if (!this.transactionId) {
    this.transactionId = 'TXN' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,6).toUpperCase();
  }
  this.platformFee = Math.round(this.amount * 0.005);
  this.totalCharged = this.amount + this.platformFee;
  next();
});

module.exports = mongoose.model('Donation', donationSchema);