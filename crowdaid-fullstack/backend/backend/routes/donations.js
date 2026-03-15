const express  = require('express');
const router   = express.Router();
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const User     = require('../models/User');
const { protect } = require('../middleware/auth');

// POST /api/donations  — dummy payment, always succeeds
router.post('/', protect, async (req, res) => {
  try {
    const { campaignId, amount, paymentMethod, paymentDetails, message, isAnonymous } = req.body;

    if (!campaignId || !amount || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'campaignId, amount and paymentMethod are required.' });
    }
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount < 1) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number.' });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found.' });
    if (campaign.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'This campaign is not currently accepting donations.' });
    }

    // Create donation record (dummy — always success)
    const donation = await Donation.create({
      donor:         req.user._id,
      donorName:     isAnonymous ? 'Anonymous' : req.user.name,
      donorEmail:    req.user.email,
      campaign:      campaignId,
      campaignTitle: campaign.title,
      amount:        parsedAmount,
      paymentMethod,
      paymentDetails: paymentDetails || {},
      status:        'success',
      isAnonymous:   !!isAnonymous,
      message:       message || '',
    });

    // Update campaign stats
    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { raisedAmount: parsedAmount, donorCount: 1 },
    });

    // Update donor profile stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalDonated: parsedAmount, campaignsSupported: 1 },
    });

    const platformFee = Math.round(parsedAmount * 0.005);

    res.status(201).json({
      success: true,
      message: 'Donation successful!',
      donation: {
        id:             donation._id,
        transactionId:  donation.transactionId,
        amount:         donation.amount,
        platformFee,
        totalCharged:   parsedAmount + platformFee,
        paymentMethod:  donation.paymentMethod,
        paymentDetails: donation.paymentDetails,
        campaignTitle:  campaign.title,
        campaignEmoji:  campaign.emoji,
        donorName:      donation.donorName,
        status:         donation.status,
        createdAt:      donation.createdAt,
      },
    });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ success: false, message: 'Invalid campaign ID.' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/donations/my
router.get('/my', protect, async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .sort({ createdAt: -1 })
      .populate('campaign', 'title emoji status');
    res.json({ success: true, donations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/donations/campaign/:id
router.get('/campaign/:id', protect, async (req, res) => {
  try {
    const donations = await Donation.find({ campaign: req.params.id, status: 'success' })
      .select('donorName amount createdAt isAnonymous message')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, donations });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ success: false, message: 'Campaign not found.' });
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;