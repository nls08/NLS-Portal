import express from 'express';
import Expense from '../models/Expense.js';
import Earning from '../models/Earning.js';
import Advance from '../models/Advance.js';
import { requireAuth } from '@clerk/express';
import { requireSuperAdmin } from '../middleware/requireAdminMiddleware.js';

const router = express.Router();
router.use(requireAuth());

router.post('/earnings', requireSuperAdmin, async (req, res) => {
  try {
    // const userId = await getUserId(req);
    const e = await Earning.create({ ...req.body });
    res.status(201).json(e);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get('/earnings', requireSuperAdmin, async (req, res) => {
  // const userId = await getUserId(req);
  const list = await Earning.find({}).sort({ date: -1 });
  res.json(list);
});

router.put('/earnings/:id', requireSuperAdmin, async (req, res) => {
  // const userId = await getUserId(req);
  const e = await Earning.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });
  res.json(e);
});

router.delete('/earnings/:id', requireSuperAdmin, async (req, res) => {
  // const userId = await getUserId(req);
  await Earning.findOneAndDelete({ _id: req.params.id });
  res.json({ success: true });
});

export default router