import express from 'express';
import Expense from '../models/Expense.js';
import Earning from '../models/Earning.js';
import Advance from '../models/Advance.js';
import { requireAuth } from '@clerk/express';
import { requireSuperAdmin } from '../middleware/requireAdminMiddleware.js';

const router = express.Router();
router.use(requireAuth());


router.post('/advances', requireSuperAdmin, async (req, res) => {
    try {
        // const userId = await getUserId(req);
        console.log(req.body, "body");
        const a = await Advance.create({ ...req.body });

        res.status(201).json(a);
    } catch (err) { res.status(400).json({ error: err.message }); }
});
router.get('/advances', requireSuperAdmin, async (req, res) => {
    // const userId = await getUserId(req);
    const list = await Advance.find({}).sort({ dateGiven: -1 });
    res.json(list);
});
router.put('/advances/:id', requireSuperAdmin, async (req, res) => {
    // const userId = await getUserId(req);
    const a = await Advance.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });
    res.json(a);
});
router.delete('/advances/:id', requireSuperAdmin, async (req, res) => {
    // const userId = await getUserId(req);
    await Advance.findOneAndDelete({ _id: req.params.id });
    res.json({ success: true });
});

export default router;