import express from 'express';
import { Attendance } from '../models/Attendance.js';
import { requireSuperAdmin } from '../middleware/requireAdminMiddleware.js';
import { requireAuth } from '@clerk/express';

const router = express.Router();

// Update the GET route path
router.get('/:userId', requireAuth(), async (req, res) => {  // Changed to /user/:userId
  try {
    const { month } = req.query;
    const userId = req.params.userId;

    if (!month) {
      return res.status(400).json({ message: 'Month parameter is required' });
    }

    // Create proper ISO dates with timezone consideration
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1) - 1);

    // Query database instead of mock data
    const attendanceData = await Attendance.find({
      employeeId: userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    res.json(attendanceData);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Error fetching attendance' });
  }
});

// Create or update attendance record
router.post('/', requireAuth(), requireSuperAdmin, async (req, res) => {
  try {
    const { employeeId, date, checkIn, checkOut, status, remarks, overtime } = req.body;
    let leaveType = req.body.leaveType;

    const existingRecord = await Attendance.findOne({ employeeId, date });

    if (leaveType === '' || !['Sick', 'Vacation', 'Personal', 'Emergency'].includes(leaveType)) {
      leaveType = undefined;
    }

    if (existingRecord) {
      // Update existing record
      Object.assign(existingRecord, { checkIn, checkOut, status, leaveType, remarks, overtime });

      if (checkIn && checkOut) {
        const checkInTime = new Date(`1970-01-01T${checkIn}:00Z`); // Use UTC to avoid timezone issues
        let checkOutTime = new Date(`1970-01-01T${checkOut}:00Z`);
        // If check-out is earlier than check-in, assume it's the next day
        if (checkOutTime < checkInTime) {
          checkOutTime = new Date(checkOutTime.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours
        }
        const diffMs = checkOutTime - checkInTime;
        const diffHours = diffMs / (1000 * 60 * 60);
        attendanceData.totalHours = diffHours.toFixed(1);
      }

      await existingRecord.save();
      res.json(existingRecord);
    } else {
      // Create new record
      const attendanceData = { employeeId, date, checkIn, checkOut, status, leaveType, remarks, overtime };


      if (checkIn && checkOut) {
        const checkInTime = new Date(`1970-01-01T${checkIn}:00Z`); // Use UTC to avoid timezone issues
        let checkOutTime = new Date(`1970-01-01T${checkOut}:00Z`);
        // If check-out is earlier than check-in, assume it's the next day
        if (checkOutTime < checkInTime) {
          checkOutTime = new Date(checkOutTime.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours
        }
        const diffMs = checkOutTime - checkInTime;
        const diffHours = diffMs / (1000 * 60 * 60);
        attendanceData.totalHours = diffHours.toFixed(1);
      }

      const attendance = new Attendance(attendanceData);
      await attendance.save();
      res.status(201).json(attendance);
    }
  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({ message: 'Error saving attendance' });
  }
});

// Update existing record
router.put('/:id', requireAuth(), requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.leaveType === '' || !['Sick', 'Vacation', 'Personal', 'Emergency'].includes(updateData.leaveType)) {
      updateData.leaveType = undefined;
    }

    // Calculate total hours if needed
    if (updateData.checkIn && updateData.checkOut && updateData.status === 'Present') {
      const checkInTime = new Date(`1970-01-01T${updateData.checkIn}:00`);
      const checkOutTime = new Date(`1970-01-01T${updateData.checkOut}:00`);
      const diffMs = checkOutTime - checkInTime;
      const diffHours = diffMs / (1000 * 60 * 60);
      updateData.totalHours = diffHours.toFixed(1);
    }

    const updatedRecord = await Attendance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json(updatedRecord);
  } catch (error) {
    console.error('Error updating attendance record:', error);
    res.status(500).json({ message: 'Error updating record' });
  }
});


// Add DELETE endpoint
router.delete('/:id', requireAuth(), requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRecord = await Attendance.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({ message: 'Error deleting record' });
  }
});

export default router;