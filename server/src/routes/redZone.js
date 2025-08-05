import express from 'express';
import { RedZone } from '../models/RedZone.js';
import User from '../models/User.js';
import { requireAuth } from '@clerk/express';
import { requireSuperAdmin } from '../middleware/requireAdminMiddleware.js';

const router = express.Router();

// Get all red zone entries
router.get('/', requireAuth(), async (req, res) => {
  try {
    const entries = await RedZone.find({ isResolved: false })
      .populate('employee')
      .populate('affectedProject')
      .populate('createdBy')
      .sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Error fetching red zone entries:', error);
    res.status(500).json({ message: 'Error fetching red zone entries' });
  }
});

// Create red zone entry
router.post('/', requireAuth(), requireSuperAdmin, async (req, res) => {
  try {
    const {
      employee,
      affectedProject,
      reason,
      affectedProgress,
      intensity,
      remarks,
      notesForImprovement,
      createdBy,   // sent from frontend
    } = req.body;
    const creator = await User.findOne({ clerkId: createdBy });
    if (!creator) {
      return res.status(400).json({ message: 'Invalid createdByClerkId' });
    }

    // 2) build the entry
    const entry = new RedZone({
      employee,
      affectedProject,
      reason,
      affectedProgress,
      intensity,
      remarks,
      notesForImprovement,
      createdBy: creator._id,
    });
    // const entry = new RedZone(req.body);
    await entry.save();
    await entry.populate('employee');
    await entry.populate('affectedProject');
    await entry.populate('createdBy');
    res.status(201).json(entry);
  } catch (error) {
    console.error('Error creating red zone entry:', error);
    res.status(500).json({ message: 'Error creating red zone entry' });
  }
});

// Update red zone entry
router.put('/:id', requireAuth(), requireSuperAdmin, async (req, res) => {
  try {
    const entry = await RedZone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('employee')
      .populate('affectedProject')
      .populate('createdBy');

    if (!entry) {
      return res.status(404).json({ message: 'Red zone entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Error updating red zone entry:', error);
    res.status(500).json({ message: 'Error updating red zone entry' });
  }
});

// Resolve red zone entry
router.patch('/:id/resolve', requireAuth(), requireSuperAdmin, async (req, res) => {
  try {
    const entry = await RedZone.findByIdAndUpdate(
      req.params.id,
      {
        isResolved: true,
        resolvedAt: new Date()
      },
      { new: true }
    )
      .populate('employee')
      .populate('affectedProject')
      .populate('createdBy');

    if (!entry) {
      return res.status(404).json({ message: 'Red zone entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Error resolving red zone entry:', error);
    res.status(500).json({ message: 'Error resolving red zone entry' });
  }
});

// Delete red zone entry
router.delete('/:id', requireAuth(), requireSuperAdmin, async (req, res) => {
  try {
    const entry = await RedZone.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Red zone entry not found' });
    }
    res.json({ message: 'Red zone entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting red zone entry:', error);
    res.status(500).json({ message: 'Error deleting red zone entry' });
  }
});

export default router;