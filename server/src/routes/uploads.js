// routes/uploads.js
import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { requireAuth } from '@clerk/express';

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

router.delete(
    '/uploads/:public_id',
    requireAuth(),
    async (req, res) => {
        try {
            await cloudinary.uploader.destroy(req.params.public_id);
            res.sendStatus(204);
        } catch (err) {
            console.error('Cloudinary destroy error:', err);
            res.status(500).json({ error: err.message });
        }
    }
);

export default router;
