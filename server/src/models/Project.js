import mongoose from 'mongoose';

const assigneeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String },
  email: { type: String },
  imageUrl: { type: String }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Planning', 'In Progress', 'QA', 'Revision', 'Done'],
    default: 'Planning'
  },
  // assignee: {
  //   type: [assigneeSchema],
  //   required: true
  // },
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
  appProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  panelProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  serverProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  overallProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  createdBy: {
    type: String,
    required: true
  },
  // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  milestones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone'
  }],
  clientMilestones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'clientMilestone'
  }],
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

// Calculate overall progress before saving
projectSchema.pre('save', function (next) {
  this.overallProgress = Math.round((this.appProgress + this.panelProgress + this.serverProgress) / 3);
  next();
});

export default mongoose.model('Project', projectSchema);