import mongoose from 'mongoose';

const ReminderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, enum: ['work', 'personal', 'health', 'finance', 'other'], default: 'work' },
    datetime: { type: Date, required: true },
    notified: { type: Boolean, default: false },
}, {
    timestamps: true
});

export default mongoose.models.Reminder || mongoose.model('Reminder', ReminderSchema);