const express  = require('express');
const router   = express.Router();
const User     = require('../models/User');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalCampaigns, donationAgg, pendingCampaigns] = await Promise.all([
      User.countDocuments(),
      Campaign.countDocuments({ status: 'approved' }),
      Donation.aggregate([{ $match: { status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Campaign.countDocuments({ status: { $in: ['pending', 'manual_review'] } }),
    ]);
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCampaigns,
        totalRaised:    donationAgg[0]?.total || 0,
        totalDonations: donationAgg[0]?.count || 0,
        pendingCampaigns,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/campaigns?status=pending  (pending tab uses $in for pending+manual_review)
router.get('/campaigns', async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status === 'pending') {
      // Admin "pending" tab shows both pending AND manual_review
      filter = { status: { $in: ['pending', 'manual_review'] } };
    } else if (status) {
      filter = { status };
    }
    const campaigns = await Campaign.find(filter)
      .sort({ createdAt: -1 })
      .populate('creator', 'name email');
    res.json({ success: true, campaigns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/campaigns/:id/status
router.put('/campaigns/:id/status', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const allowed = ['approved', 'rejected', 'manual_review', 'pending'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason: rejectionReason || '' },
      { new: true }
    );
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found.' });
    res.json({ success: true, message: `Campaign ${status}!`, campaign });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ success: false, message: 'Campaign not found.' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id/toggle  — suspend / activate
router.put('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'suspended'}.`, isActive: user.isActive });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/donations
router.get('/donations', async (req, res) => {
  try {
    const donations = await Donation.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('donor',    'name email')
      .populate('campaign', 'title emoji');
    res.json({ success: true, donations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;