import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    // required: true
  },
  type: {
    type: String,
    enum: ['client', 'dev'],
    required: true
  },
  status: {
    type: String,
    enum: ['Planning', 'In Progress', 'Review', 'Testing', 'Completed', 'On Hold', 'Blocked'],
    default: 'Planning'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignee: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  dueDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  techStack: {
    type: String,
    default: ''
  },
  createdBy: {
    type: String,
    required: true
  },
  attachments: {
    type: [{
      public_id: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      }
    }],   // Array of Cloudinary URLs
    default: [],
  },
}, {
  timestamps: true
});

export default mongoose.model('Milestone', milestoneSchema);