import express from 'express';
import { requireAuth } from '@clerk/express';
import Reminder from '../models/Reminder.js';
import { getInternalUserId } from '../services/getUserId.js';

const router = express.Router();
router.use(requireAuth());

// Create Reminder
router.post('/', async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const internalId = await getInternalUserId(clerkId);
    const payload = { ...req.body, user: internalId };
    const reminder = await Reminder.create(payload);
    res.status(201).json(reminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all reminders for current user
router.get('/', async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const internalId = await getInternalUserId(clerkId);
    const reminders = await Reminder.find({ user: internalId }).sort({ datetime: 1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single reminder
router.get('/:id', async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const internalId = await getInternalUserId(clerkId);
    const reminder = await Reminder.findOne({ _id: req.params.id, user: internalId });
    if (!reminder) return res.status(404).json({ error: 'Not found' });
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update reminder
router.put('/:id', async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const internalId = await getInternalUserId(clerkId);
    const updates = req.body;
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: internalId },
      updates,
      { new: true }
    );
    if (!reminder) return res.status(404).json({ error: 'Not found' });
    res.json(reminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete reminder
router.delete('/:id', async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const internalId = await getInternalUserId(clerkId);
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, user: internalId });
    if (!reminder) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;