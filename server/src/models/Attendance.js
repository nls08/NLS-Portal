import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  checkIn: {
    type: String, 
  },
  checkOut: {
    type: String, 
  },
  totalHours: {
    type: String, 
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Leave', 'Holiday'],
    required: true,
  },
  leaveType: {
    type: String,
    enum: ['Sick', 'Vacation', 'Personal', 'Emergency'],
    default: undefined
  },
  overtime: {
    type: Number,
    enum: [0, 1, 2, 3, 4],
    default: 0
  },
  remarks: {
    type: String,
    default: '',
  },
  zktecoData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Compound index for employee and date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);