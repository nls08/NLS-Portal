import express from 'express';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Milestone from '../models/Milestone.js';
import User from '../models/User.js';
const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    // — basic counts —
    const [ totalProjects, activeProjects ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: { $in: ['In Progress','QA'] } })
    ]);
    const [ totalTasks, pendingTasks, inProgressTasks, completedTasks ] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: 'Pending' }),
      Task.countDocuments({ status: 'In Progress' }),
      Task.countDocuments({ status: 'Completed' })
    ]);
    const [ totalMilestones, upcomingMilestones, overdueMilestones ] = await Promise.all([
      Milestone.countDocuments(),
      Milestone.countDocuments({ status: { $in: ['Planning','In Progress'] }, dueDate: { $gte: new Date() } }),
      Milestone.countDocuments({ status: { $ne: 'Completed' }, dueDate: { $lt: new Date() } })
    ]);

    // — projectProgress: for each project, % of its tasks completed —
    const allProjects = await Project.find({}, 'name');
    const projectProgress = await Promise.all(allProjects.map(async proj => {
      const total = await Task.countDocuments({ project: proj._id });
      const done  = await Task.countDocuments({ project: proj._id, status: { $in: ['Completed','Approved'] } });
      return {
        name: proj.name,
        progress: total > 0 ? Math.round((done/total)*100) : 0
      };
    }));

    // — recentActivities: last 5 task updates, with user & action —
    const recentRaw = await Task.find({})
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('assignee','firstName lastName');
    const recentActivities = recentRaw.map(t => ({
      user: t.assignee
        ? `${t.assignee.firstName} ${t.assignee.lastName}`
        : 'System',
      action: (t.status === 'Completed') 
        ? 'completed task' 
        : (t.status === 'QA Ready') 
          ? 'moved to QA' 
          : 'updated task',
      item: t.title,
      time: t.updatedAt
    }));

    // — redZoneAlerts: anyone with > 3 open tasks —
    const tasksByUser = await Task.aggregate([
      { $match: { status: { $in: ['Pending','In Progress','QA Ready','QA'] } } },
      { $group: { _id: '$assignee', count: { $sum: 1 } } },
      { $match: { count: { $gt: 3 } } }
    ]);
    // populate user names
    const redZoneAlerts = await Promise.all(tasksByUser.map(async grp => {
      const user = await User.findById(grp._id,'firstName lastName');
      return {
        employee: user
          ? `${user.firstName} ${user.lastName}`
          : 'Unknown',
        issue: `${grp.count} open tasks`,
        severity: grp.count > 5 ? 'high' : 'medium'
      };
    }));

    return res.json({
      projects:  { total: totalProjects, active: activeProjects },
      tasks:     { total: totalTasks, pending: pendingTasks, inProgress: inProgressTasks, completed: completedTasks },
      milestones:{ total: totalMilestones, upcoming: upcomingMilestones, overdue: overdueMilestones },
      projectProgress,
      recentActivities,
      redZoneAlerts
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
