import express from 'express';
// import { clerkClient } from '@clerk/clerk-sdk-node';
import { clerkClient, requireAuth } from '@clerk/express';
import User from '../models/User.js';
import { Webhook } from "svix"

const router = express.Router();



router.post('/sync', requireAuth(), async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    // fetch full user profile from Clerk
    const cu = await clerkClient.users.getUser(clerkId);
    console.log(cu, "cu");

    // upsert into your local User collection
    const userDoc = await User.findOneAndUpdate(
      { clerkId: cu.id },
      {
        $set: {
          // these are the fields you want to update
          firstName: cu.firstName || '',
          lastName: cu.lastName || '',
          email: cu.emailAddresses?.[0]?.emailAddress || '',
          imageUrl: cu.imageUrl,
          role: cu.publicMetadata?.role || '',
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(userDoc, "userdoc");


    return res.json({ message: 'User synced', user: userDoc });
  } catch (err) {
    console.error('Sync error', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Get all users from your DB
 */
router.get('/', requireAuth(), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ message: 'Users fetched successfully', users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get or update the current user's profile.
 * This also ensures the user exists in your DB.
 */
router
  .route('/profile')
  .all(requireAuth())
  .get(async (req, res) => {
    try {
      const clerkId = req.auth.userId;
      const user = await User.findOne({ clerkId });
      res.json({ message: 'Profile fetched', profile: user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })



// Example: New endpoint to update local fields
router.put('/update-profile', requireAuth(), async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const { bio, phone, location } = req.body; // Fields to update

    // Update only the specified local fields
    const updateFields = {};
    // if (role) updateFields.role = role;
    if (bio) updateFields.bio = bio;
    if (phone) updateFields.phone = phone;
    if (location) updateFields.location = location;

    const userDoc = await User.findOneAndUpdate(
      { clerkId },
      updateFields,
      { new: true }
    );

    if (!userDoc) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ message: 'Profile updated', user: userDoc });
  } catch (err) {
    console.error('Update profile error', err);
    return res.status(500).json({ error: err.message });
  }
});


// This should be publicly reachable by Clerk's webhook but verify its signature!
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  let evt;
  try {
    evt = Webhook.verify(req);    // throws if signature invalid
  } catch (err) {
    console.error('Invalid Clerk webhook', err);
    return res.sendStatus(400);
  }

  if (evt.type === 'user.created') {
    const userId = evt.data.id;
    // initialize publicMetadata.approved = false
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { approved: false, role: 'user' }
    });
  }

  res.sendStatus(200);
});


export default router;