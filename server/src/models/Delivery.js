import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Project', 'Milestone', 'Task'],
    required: true
  },
  // Reference to the actual project, milestone, or task
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: function() { return this.type === 'Project'; }
  },
  milestoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone',
    required: function() { return this.type === 'Milestone'; }
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: function() { return this.type === 'Task'; }
  },
  status: {
    type: String,
    enum: ['Delivered', 'Pending', 'In Review'],
    default: 'Delivered'
  },
  // deliveredBy: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true
  // },
   deliveredBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  client: {
    type: String,
    required: true
  },
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  deliverables: [{
    type: String,
    required: true
  }],
  completedDate: {
    type: Date,
    default: Date.now
  },
  deliveryNotes: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
deliverySchema.index({ type: 1, status: 1 });
deliverySchema.index({ completedDate: -1 });

export default mongoose.model('Delivery', deliverySchema);