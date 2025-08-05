// import User from "../models/User.js";

import User from "../models/User.js";

// export async function requireSuperAdmin(req, res, next) {
//   const clerkId = req.auth.userId;
//   const dbUser = await User.findOne({ clerkId });

//   // if no user OR role is neither super-admin *nor* admin → forbidden
//   if (!dbUser || (dbUser.role !== 'super-admin' && dbUser.role !== 'admin')) {
//     return res.status(403).json({ message: 'Forbidden: super-admin or admin only' });
//   }

//   next();
// }



export async function requireSuperAdmin(req, res, next) {
  const { userId: clerkId } = req.auth();   // ← call it!
  const dbUser = await User.findOne({ clerkId });
  if (!dbUser || (dbUser.role !== 'super-admin' && dbUser.role !== 'admin')) {
    return res.status(403).json({ message: 'Forbidden: super-admin or admin only' });
  }
  next();
}
