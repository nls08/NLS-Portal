import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  category: { type: String, enum: ['salary','overhead','other'], required: true },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);