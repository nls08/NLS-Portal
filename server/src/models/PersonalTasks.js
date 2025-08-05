import mongoose from 'mongoose';

const PersonalTaskSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, enum: ['work', 'personal', 'health', 'finance', 'other'], default: 'work' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    dueDate: { type: Date },
}, {
    timestamps: true
});

export default mongoose.models.personalTasks || mongoose.model('personalTasks', PersonalTaskSchema);