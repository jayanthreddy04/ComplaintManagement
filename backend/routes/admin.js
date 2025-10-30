const express = require('express');
const auth = require('../middleware/auth');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const router = express.Router();

// Admin middleware - check if user is admin
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Get all complaints (admin only)
router.get('/complaints', auth, adminAuth, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Admin complaints list should not include items that were soft-deleted by admin
    query.deletedByAdmin = { $ne: true };

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

// Get complaint statistics
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'in-progress' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
    const rejectedComplaints = await Complaint.countDocuments({ status: 'rejected' });

    // Category-wise statistics
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Priority-wise statistics
    const priorityStats = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      rejectedComplaints,
      categoryStats,
      priorityStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all staff members
router.get('/staff', auth, adminAuth, async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('name email department');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Assign complaint to staff
router.put('/complaints/:id/assign', auth, adminAuth, async (req, res) => {
  try {
    const { assignedTo, adminNotes } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Verify staff member exists
    if (assignedTo) {
      const staff = await User.findById(assignedTo);
      if (!staff || staff.role !== 'staff') {
        return res.status(400).json({ message: 'Invalid staff member' });
      }
    }

    complaint.assignedTo = assignedTo;
    complaint.status = assignedTo ? 'in-progress' : 'pending';
    if (adminNotes) complaint.adminNotes = adminNotes;

    await complaint.save();
    await complaint.populate('createdBy', 'name email');
    await complaint.populate('assignedTo', 'name email department');

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update complaint status (admin)
router.put('/complaints/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = status;
    if (adminNotes) complaint.adminNotes = adminNotes;
    
    // Set resolved date if status is resolved
    if (status === 'resolved') {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();
    await complaint.populate('createdBy', 'name email');
    await complaint.populate('assignedTo', 'name email department');

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single complaint details (admin)
router.get('/complaints/:id', auth, adminAuth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email department');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create staff member (admin only)
router.post('/staff', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new staff member
    const staff = new User({
      name,
      email,
      password,
      role: 'staff',
      department
    });

    await staff.save();

    res.status(201).json({
      message: 'Staff member created successfully',
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        department: staff.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update staff member (admin only)
router.put('/staff/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, department } = req.body;
    
    const staff = await User.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    if (staff.role !== 'staff') {
      return res.status(400).json({ message: 'User is not a staff member' });
    }

    // Check if email is being changed and if new email already exists
    if (email && email !== staff.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Update staff member
    if (name) staff.name = name;
    if (email) staff.email = email;
    if (department) staff.department = department;

    await staff.save();

    res.json({
      message: 'Staff member updated successfully',
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        department: staff.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete staff member (admin only)
router.delete('/staff/:id', auth, adminAuth, async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    if (staff.role !== 'staff') {
      return res.status(400).json({ message: 'User is not a staff member' });
    }

    // Check if staff has assigned complaints
    const assignedComplaints = await Complaint.countDocuments({ assignedTo: req.params.id });
    if (assignedComplaints > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete staff member with assigned complaints. Please reassign complaints first.' 
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete complaint (admin only) - only resolved complaints
router.delete('/complaints/:id', auth, adminAuth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.status !== 'resolved') {
      return res.status(400).json({ 
        message: 'Only resolved complaints can be deleted' 
      });
    }

    // Mark as deleted but keep visible to user
    complaint.deletedByAdmin = true;
    complaint.deletedAt = new Date();
    await complaint.save();

    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
