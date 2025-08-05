// routes/kpi.js
import express from 'express';
import { Kpi } from '../models/Kpi.js';
import { requireAuth } from '@clerk/express';
import User from '../models/User.js';
import { requireSuperAdmin } from '../middleware/requireAdminMiddleware.js';

const router = express.Router();

// GET /api/kpi - Get all KPIs
router.get('/', requireAuth(), async (req, res) => {
    try {
        const kpis = await Kpi.find().sort({ createdAt: -1 });
        res.json(kpis);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching KPIs', error: error.message });
    }
});

// GET /api/kpi/:id - Get single KPI
router.get('/kpi/:id', requireAuth(), requireSuperAdmin, async (req, res) => {
    try {
        const kpi = await Kpi.findById(req.params.id);
        if (!kpi) {
            return res.status(404).json({ message: 'KPI not found' });
        }
        res.json(kpi);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching KPI', error: error.message });
    }
});

// POST /api/kpi - Create new KPI
router.post('/create-kpi', requireAuth(), requireSuperAdmin, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const kpi = new Kpi({
            content
        });

        const savedKpi = await kpi.save();
        res.status(201).json(savedKpi);
    } catch (error) {
        res.status(400).json({ message: 'Error creating KPI', error: error.message });
    }
});

// PUT /api/kpi/:id - Update KPI
router.put('/:id', requireAuth(), requireSuperAdmin, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const kpi = await Kpi.findByIdAndUpdate(
            req.params.id,
            {
                content,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        if (!kpi) {
            return res.status(404).json({ message: 'KPI not found' });
        }

        res.json(kpi);
    } catch (error) {
        res.status(400).json({ message: 'Error updating KPI', error: error.message });
    }
});

// DELETE /api/kpi/:id - Delete KPI
router.delete('/:id', requireAuth(), requireSuperAdmin, async (req, res) => {
    try {
        const kpi = await Kpi.findByIdAndDelete(req.params.id);

        if (!kpi) {
            return res.status(404).json({ message: 'KPI not found' });
        }

        res.json({ message: 'KPI deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting KPI', error: error.message });
    }
});

export default router;