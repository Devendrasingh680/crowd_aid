const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  story:       { type: String, required: true },
  category:    { type: String, required: true, enum: ['Medical','Education','Disaster','Community','Disability','Other'] },
  targetAmount: { type: Number, required: true, min: 1000 },
  raisedAmount: { type: Number, default: 0 },
  emoji:       { type: String, default: '🌟' },
  creator:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creatorName: { type: String },

  // Beneficiary details
  beneficiaryName: { type: String, default: '' },
  hospitalName:    { type: String, default: '' },
  doctorRegNo:     { type: String, default: '' },

  // Documents (file paths)
  documents: [{ name: String, path: String, uploadedAt: { type: Date, default: Date.now } }],

  // AI Verification
  aiScore:  { type: Number, default: 0 },
  aiChecks: {
    nlpCredibility:      { type: Boolean, default: false },
    documentEla:         { type: Boolean, default: false },
    imageOriginality:    { type: Boolean, default: false },
    doctorVerification:  { type: Boolean, default: false },
    costValidation:      { type: Boolean, default: false },
    hospitalGeoCheck:    { type: Boolean, default: false },
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'pending', 'manual_review', 'approved', 'rejected', 'completed'],
    default: 'draft',
  },
  rejectionReason: { type: String, default: '' },

  // Fund release stages
  fundStages: {
    stage1Released: { type: Boolean, default: false },
    stage1Amount:   { type: Number, default: 0 },
    stage2Released: { type: Boolean, default: false },
    stage2Amount:   { type: Number, default: 0 },
    stage2Proof:    { type: String, default: '' },
    stage3Released: { type: Boolean, default: false },
    stage3Amount:   { type: Number, default: 0 },
    stage3Proof:    { type: String, default: '' },
  },

  donorCount:  { type: Number, default: 0 },
  daysLeft:    { type: Number, default: 30 },
  endDate:     { type: Date },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

// Virtual: percent funded
campaignSchema.virtual('percentFunded').get(function () {
  return this.targetAmount > 0 ? Math.round((this.raisedAmount / this.targetAmount) * 100) : 0;
});

campaignSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Campaign', campaignSchema);