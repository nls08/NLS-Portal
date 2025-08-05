import express from 'express';
import { broadcast } from '../server.js';
import ClientMilestone from '../models/ClientMilestone.js';
import Project from '../models/Project.js';
import { requireSuperAdmin } from '../middleware/requireAdminMiddleware.js';
import { requireAuth } from '@clerk/express';

const router = express.Router();

// Get all milestones
router.get('/', requireAuth(), async (req, res) => {
  try {
    const { type = 'client' } = req.query;
    const milestones = await ClientMilestone.find({ type }).sort({ createdAt: -1 }).populate('assignee').populate('project');
    console.log(milestones, "client milestones");

    res.json(milestones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get milestone by ID
router.get('/:id', requireAuth(), async (req, res) => {
  try {
    const milestone = await ClientMilestone.findById(req.params.id).populate('assignee').populate('project');
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    res.json(milestone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new client milestone
router.post('/', requireAuth(), requireSuperAdmin, async (req, res) => {
  const session = await ClientMilestone.startSession();
  session.startTransaction();
  try {
    // 1) Create the milestone
    const m = new ClientMilestone({
      ...req.body,
      createdBy: req.auth?.userId || 'system'
    });
    await m.save({ session });

    // 2) Add its _id into the parent project's milestones array
    await Project.findByIdAndUpdate(
      m.project,
      { $push: { clientMilestones: m._id } },
      { session }
    );

    // 3) Commit and populate for response
    await session.commitTransaction();
    session.endSession();
    const populated = await ClientMilestone.findById(m._id)
      .populate('assignee')
      .populate('project');

    broadcast({
      type: 'notification',
      message: `New ${m.type} milestone created: ${m.name}`
    });
    res.status(201).json(populated);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: err.message });
  }
});

// Update milestone
router.put('/:id', requireAuth(), requireSuperAdmin, async (req, res) => {
  const session = await ClientMilestone.startSession();
  session.startTransaction();
  try {
    // 1) Load existing milestone
    const existing = await ClientMilestone.findById(req.params.id).session(session);
    if (!existing) {
      throw new Error('Milestone not found');
    }

    const oldProjectId = existing.project.toString();
    const newProjectId = req.body.project;

    // 2) Update the milestone itself
    const updated = await ClientMilestone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true, session }
    );

    // 3) If the project changed, move the ID between the two Projects
    if (newProjectId !== oldProjectId) {
      // remove from old
      await Project.findByIdAndUpdate(
        oldProjectId,
        { $pull: { clientMilestones: updated._id } },
        { session }
      );
      // add to new
      await Project.findByIdAndUpdate(
        newProjectId,
        { $push: { clientMilestones: updated._id } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    // Populate for response
    const populated = await ClientMilestone.findById(updated._id)
      .populate('assignee')
      .populate('project');

    broadcast({
      type: 'status_update',
      message: `Milestone ${populated.name} updated`
    });
    res.json(populated);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: err.message });
  }
});


// Delete milestone
router.delete('/:id', requireAuth(), requireSuperAdmin, async (req, res) => {
  try {
    const milestone = await ClientMilestone.findByIdAndDelete(req.params.id);
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;