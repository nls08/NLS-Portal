import express from 'express';
import { requireAuth } from '@clerk/express';
import Feedback from '../models/Feedback.js';
import { requireSuperAdmin } from '../middleware/requireAdminMiddleware.js';


const router = express.Router();

// All routes require a valid Clerk JWT
router.use(requireAuth());

// Create feedback
router.post('/', async (req, res) => {
    try {
        const { category, rating, feedback, suggestions } = req.body;
        const newFb = await Feedback.create({ category, rating, feedback, suggestions });
        return res.status(201).json(newFb);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

// get all feedbacks
router.get('/', async (req, res) => {
    try {
        const list = await Feedback.find().sort({ createdAt: -1 });
        return res.json(list);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
})

// get single
router.get('/:id', async (req, res) => {
    try {
        const fb = await Feedback.findById(req.params.id);
        if (!fb) return res.status(404).json({ error: 'Not found' });
        return res.json(fb);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Update feedback (e.g., status or suggestions)
router.put('/:id', requireSuperAdmin, async (req, res) => {
    try {
        const updates = req.body;
        const fb = await Feedback.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!fb) return res.status(404).json({ error: 'Not found' });
        return res.json(fb);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

// Delete feedback
router.delete('/:id', requireSuperAdmin, async (req, res) => {
    try {
        const fb = await Feedback.findByIdAndDelete(req.params.id);
        if (!fb) return res.status(404).json({ error: 'Not found' });
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;