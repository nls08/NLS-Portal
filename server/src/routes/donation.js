import express from 'express';
import { requireAuth } from '@clerk/express';
import Donation from '../models/Donation.js';
import User from '../models/User.js';
import { getInternalUserId } from '../services/getUserId.js';

const router = express.Router();
router.use(requireAuth());


// Create Task
router.post('/', async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const internalId = await getInternalUserId(clerkId);
        const payload = { ...req.body, user: internalId };
        const task = await Donation.create(payload);
        await task.populate('user');
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// Get all tasks for current user
router.get('/', async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const internalId = await getInternalUserId(clerkId);
        const tasks = await Donation.find({ user: internalId }).sort({ createdAt: -1 }).populate('user');
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Get task by id
router.get('/:id', async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const internalId = await getInternalUserId(clerkId);
        const task = await Donation.findOne({ _id: req.params.id, user: internalId }).populate('user');
        if (!task) return res.status(404).json({ error: 'Not found' });
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Update task
router.put('/:id', async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const internalId = await getInternalUserId(clerkId);
        const updates = req.body;
        const task = await Donation.findOneAndUpdate({ _id: req.params.id, user: internalId }, updates, { new: true }).populate('user');
        if (!task) return res.status(404).json({ error: 'Not found' });
        res.json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// Delete task
router.delete('/:id', async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const internalId = await getInternalUserId(clerkId);
        const task = await Donation.findOneAndDelete({ _id: req.params.id, user: internalId });
        if (!task) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


export default router;