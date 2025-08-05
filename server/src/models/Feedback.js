// models/Kpi.js
import mongoose, { Schema } from "mongoose";

const categories = [
    'Work Environment',
    'Management',
    'Work-Life Balance',
    'Career Development',
    'Team Collaboration',
    'Company Culture',
    'Benefits & Compensation',
    'Other',
  ];

const feedbackSchema = new Schema({
    category: { type: String, enum: categories, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    feedback: { type: String, required: true },
    suggestions: { type: String }, // optional
    status: {
        type: String,
        enum: ['Submitted', 'Under Review', 'In Progress', 'Acknowledged'],
        default: 'Submitted',
    },
}, {
    timestamps: true
});

export default mongoose.model('Feedback', feedbackSchema);