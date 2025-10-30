const express = require('express');
const auth = require('../middleware/auth');
const Complaint = require('../models/Complaint');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// Create complaint
router.post('/', auth, upload.single('proofImage'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    const complaint = new Complaint({
      title,
      description,
      category,
      createdBy: req.user.id,
      proofImage: req.file ? req.file.filename : undefined
    });

    await complaint.save();
    await complaint.populate('createdBy', 'name email');

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all complaints (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    let query = {};

    // Role-based filtering
    if (req.user.role === 'student') {
      query.createdBy = req.user.id;
      // Students can see their complaints even if deleted by admin
    } else if (req.user.role === 'staff') {
      query.assignedTo = req.user.id;
      // Staff can see assigned complaints even if deleted by admin
    } else if (req.user.role === 'admin') {
      // Admin can see all complaints except deleted ones
      query.deletedByAdmin = { $ne: true };
    }

    if (status) query.status = status;
    if (category) query.category = category;

    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email department')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Complaint.countDocuments(query);

    res.json({
      complaints,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update complaint status
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (assignedTo) complaint.assignedTo = assignedTo;

    await complaint.save();
    await complaint.populate('createdBy', 'name email');
    await complaint.populate('assignedTo', 'name email');

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit feedback
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    complaint.feedback = {
      rating,
      comment,
      submittedAt: new Date()
    };

    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit work proof (Staff only)
router.post('/:id/work-proof', auth, upload.array('workProofFiles', 5), async (req, res) => {
  try {
    const { description } = req.body;
    
    // Check if user is staff
    if (req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Only staff members can submit work proof' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if complaint is assigned to this staff member
    if (complaint.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to submit work proof for this complaint' });
    }

    // Process uploaded files
    const workProofFiles = req.files ? req.files.map(file => file.filename) : [];

    complaint.workProof = {
      description,
      files: workProofFiles,
      submittedBy: req.user.id,
      submittedAt: new Date()
    };

    await complaint.save();
    await complaint.populate('workProof.submittedBy', 'name email');
    await complaint.populate('createdBy', 'name email');
    await complaint.populate('assignedTo', 'name email department');

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;