// models/Kpi.js
import mongoose, { Schema } from "mongoose";

const kpiSchema = new Schema({
    content: { 
        type: String, 
        required: true,
        trim: true
    }
}, {
    timestamps: true 
});

export const Kpi = mongoose.model('Kpi', kpiSchema);