import mongoose, { Schema } from "mongoose";


const donationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    isAnonymous: { type: Boolean, default: false },
}, {
    timestamps: true
})


export default mongoose.models.Donation || mongoose.model('Donation', donationSchema);