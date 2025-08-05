import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema({
  title:            { type: String, required: true },
  employee:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goal:             { type: String, required: true },
  // kpi:              { type: mongoose.Schema.Types.ObjectId, ref: 'Kpi', required: true },
  projectImpact:    { type: String },
  project:          { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  rootCause:        { type: String },
  status:           { type: String, enum: ['New','In Progress','Resolved'], default: 'New' },
  notifiedAt:       { type: Date, default: Date.now },
  targetImprovementDate: { type: Date },
}, {
  timestamps: true
});

export default Performance = mongoose.model('Performance', performanceSchema);
