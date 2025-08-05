import express from 'express';
import { requireSuperAdmin } from '../middleware/requireAdminMiddleware.js';
import { clerkClient, requireAuth } from '@clerk/express';
import { transporter } from '../services/email.js';
const router = express.Router();


// GET /api/admin/users-summary
router.get(
    '/users-summary',
    requireAuth({ enforce: true }),
    requireSuperAdmin,
    async (req, res) => {
        // 1) Load all users in one call
        const { data: users } = await clerkClient.users.getUserList({
            limit: 100,
            offset: 0,
        });

        // 2) Partition into pending vs approved
        const pending = [];
        const approved = [];
        for (const u of users) {
            const rec = {
                id: u.id,
                email: u.emailAddresses[0].emailAddress,
                createdAt: u.createdAt,
            };
            if (u.publicMetadata?.approved === true) {
                approved.push(rec);
            } else {
                pending.push(rec);
            }
        }

        // 3) Return both arrays at once
        return res.json({ pending, approved });
    }
);

router.post(
    '/approve-user',
    requireAuth({ enforce: true }),
    requireSuperAdmin,
    async (req, res) => {
        const { userId } = req.body;

        // 1) Mark approved in Clerk
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: { approved: true },
        });

        // 2) Fetch the user so we have name & email
        const approvedUser = await clerkClient.users.getUser(userId);
        const email =
            approvedUser.emailAddresses?.[0]?.emailAddress;
        const name = approvedUser.firstName || 'User';

        if (!email) {
            console.warn(`No email found for user ${userId}, skipping notification.`);
            return res.sendStatus(204);
        }

        // 3) Load or build your approval template
        //    If you have an HTML file, you can read and inject the name dynamically:
        let html;
        try {
            const templatePath = path.join(
                __dirname,
                '..',
                'templates',
                'approvalNotification.html'
            );
            html = fs.readFileSync(templatePath, 'utf8')
                .replace(/||USERNAME||/g, name);
        } catch {
            // fallback to a simple inline HTML
            html = `
        <p>Hi ${name},</p>
        <p>Your account has just been <strong>approved</strong> by an administrator!</p>
        <p>You can now <a href="https://your-app.com/">log in</a> and start using the dashboard.</p>
        <p>Welcome aboard!</p>
      `;
        }

        // 4) Send via Nodemailer
        console.log("starting email");

        try {
            await transporter.sendMail({
                from: process.env.SMTP_EMAIL, 
                to: email,
                subject: 'Your account is now approved',
                html,
            });
            console.log("ending email");
            console.log(`Approval email sent to ${email}`);
        } catch (err) {
            console.error(`Failed to send approval email to ${email}:`, err);
        }

        res.sendStatus(204);
    }
);


export default router;
