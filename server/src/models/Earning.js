import mongoose from 'mongoose';

const EarningSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  client: { type: String },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.models.Earning || mongoose.model('Earning', EarningSchema);