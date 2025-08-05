import mongoose from 'mongoose';

const redZoneSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  affectedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  affectedProgress: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  intensity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true,
  },
  remarks: {
    type: String,
    default: '',
  },
  notesForImprovement: {
    type: String,
    default: '',
  },
  isResolved: {
    type: Boolean,
    default: false,
  },
  resolvedAt: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export const RedZone = mongoose.model('RedZone', redZoneSchema);