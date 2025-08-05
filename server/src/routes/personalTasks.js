import express from 'express';
import { requireAuth } from '@clerk/express';
import PersonalTasks from '../models/PersonalTasks.js';
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
        const task = await PersonalTasks.create(payload);
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
        const tasks = await PersonalTasks.find({ user: internalId }).sort({ createdAt: -1 }).populate('user');
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single task
router.get('/:id', async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const internalId = await getInternalUserId(clerkId);
        const task = await PersonalTasks.findOne({ _id: req.params.id, user: internalId }).populate('user');
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
        const task = await PersonalTasks.findOneAndUpdate({ _id: req.params.id, user: internalId }, updates, { new: true }).populate('user');
        console.log(task, "personaltaks");
        
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
        const task = await PersonalTasks.findOneAndDelete({ _id: req.params.id, user: internalId });
        if (!task) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;