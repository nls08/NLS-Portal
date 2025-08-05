import mongoose from 'mongoose';

const AdvanceSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeName: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  dateGiven: { type: Date, required: true },
  installmentAmount: { type: Number, required: true },
  nextDueDate: { type: Date },
  status: { type: String, enum: ['Active','Completed'], default: 'Active' },
  payments: [{ date: Date, amount: Number }],
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.models.Advance || mongoose.model('Advance', AdvanceSchema);
