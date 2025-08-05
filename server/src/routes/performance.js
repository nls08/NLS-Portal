import express from 'express';
import Performance from '../models/Performance.js';
import { requireAuth } from '@clerk/express';
import User from '../models/User.js';
import { broadcast } from '../server.js';
import { requireSuperAdmin } from '../middleware/requireAdminMiddleware.js';

const router = express.Router();


// GET /api/performance — list for anyone signed in
router.get('/', requireAuth(), async (req, res) => {
  const items = await Performance.find()
    .populate('employee')
    .populate('project')
    // .populate('kpi', 'content')
    .sort({ createdAt: -1 });
  res.json(items);
});

// POST /api/performance — super-admin only
router.post('/', requireAuth(), requireSuperAdmin, async (req, res) => {
  console.log(req.body, "req body");

  const perf = new Performance(req.body);
  await perf.save();
  await perf.populate([
    { path: 'employee' },
    { path: 'project' }
  ]);

  broadcast({
    type: 'Performance Created',
    taskName: perf.title,
    assignee: `${perf.employee.firstName} ${perf.employee.lastName}`,
    message: `New Performance created for: ${perf.project.name}`
  });

  // req.app.get('io').emit('performance:create', perf);
  res.status(201).json(perf);
});

// PUT /api/performance/:id — super-admin only
router.put('/:id', requireAuth(), requireSuperAdmin, async (req, res) => {
  const perf = await Performance.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
    .populate('employee')
    .populate('project');
  // .populate('kpi','content')

  if (!perf) return res.status(404).json({ message: 'Not found' });

  broadcast({
    type: 'Performance Updated',
    taskName: perf.title,
    assignee: `${perf.employee.firstName} ${perf.employee.lastName}`,
    message: `Performance Updated for: ${perf.project.name}`
  });

  res.json(perf);
});

// DELETE /api/performance/:id — super-admin only
router.delete('/:id', requireAuth(), requireSuperAdmin, async (req, res) => {
  const perf = await Performance.findByIdAndDelete(req.params.id);
  if (!perf) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});

export default router;
