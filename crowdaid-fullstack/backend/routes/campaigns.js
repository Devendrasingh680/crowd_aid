const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const Campaign = require('../models/Campaign');
const { protect, creatorOnly } = require('../middleware/auth');

// ── Multer (auto-create upload dir) ──────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/campaigns');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    cb(null, `${Date.now()}-${safe}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg','image/png','image/jpg','application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const EMOJI_MAP = {
  Medical:'🏥', Education:'🎓', Disaster:'🌊',
  Community:'🌱', Disability:'♿', Other:'🌟',
};

// Simulated AI verification (replace with real ML later)
function runAiVerification({ story, documents, doctorRegNo, targetAmount, hospitalName }) {
  const checks = {
    nlpCredibility:    story.length > 100,
    documentEla:       documents.length > 0,
    imageOriginality:  true,
    doctorVerification: doctorRegNo ? Math.random() > 0.2 : false,
    costValidation:    Number(targetAmount) < 5000000,
    hospitalGeoCheck:  (hospitalName || '').length > 3,
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const score  = Math.round((passed / 6) * 100);
  const status = score >= 70 ? 'approved' : score >= 50 ? 'manual_review' : 'rejected';
  return { score, checks, status };
}

// ── IMPORTANT: /my/list MUST come before /:id ────────────────────────────────

// GET /api/campaigns/my/list  — creator's own campaigns
router.get('/my/list', protect, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ creator: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, campaigns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/campaigns  — public, approved only
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const filter = { status: 'approved', isActive: true };
    if (category && category !== 'All') filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { story:  { $regex: search, $options: 'i' } },
      ];
    }
    const total     = await Campaign.countDocuments(filter);
    const campaigns = await Campaign.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('creator', 'name');
    res.json({ success: true, campaigns, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/campaigns  — creator only
router.post('/', protect, creatorOnly, upload.array('documents', 5), async (req, res) => {
  try {
    const { title, story, category, targetAmount, beneficiaryName, hospitalName, doctorRegNo } = req.body;
    if (!title || !story || !category || !targetAmount) {
      return res.status(400).json({ success: false, message: 'Title, story, category and targetAmount are required.' });
    }
    const documents = (req.files || []).map(f => ({ name: f.originalname, path: f.filename }));
    const endDate   = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const { score, checks, status } = runAiVerification({
      story, documents,
      doctorRegNo:  doctorRegNo  || '',
      targetAmount: Number(targetAmount),
      hospitalName: hospitalName || '',
    });

    const campaign = await Campaign.create({
      title, story, category,
      targetAmount: Number(targetAmount),
      emoji:        EMOJI_MAP[category] || '🌟',
      creator:      req.user._id,
      creatorName:  req.user.name,
      beneficiaryName: beneficiaryName || '',
      hospitalName:    hospitalName    || '',
      doctorRegNo:     doctorRegNo     || '',
      documents,
      aiScore:  score,
      aiChecks: checks,
      status,
      endDate,
      daysLeft: 30,
    });

    res.status(201).json({ success: true, message: 'Campaign submitted!', campaign, aiScore: score, aiStatus: status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/campaigns/:id  — public (must be AFTER /my/list)
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('creator', 'name email');
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found.' });
    res.json({ success: true, campaign });
  } catch (err) {
    // Invalid ObjectId format
    if (err.name === 'CastError') return res.status(404).json({ success: false, message: 'Campaign not found.' });
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;