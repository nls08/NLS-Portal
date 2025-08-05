import User from "../models/User.js";

export async function getInternalUserId(clerkUserId) {
    let user = await User.findOne({ clerkId: clerkUserId });
    if (!user) {
        return new Error('User not found');
    }
    return user._id;
}