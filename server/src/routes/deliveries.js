
import express from 'express';
import Delivery from '../models/Delivery.js';
import Project from '../models/Project.js';
import Milestone from '../models/Milestone.js';
import Task from '../models/Task.js';
import { requireAuth } from '@clerk/express';

const router = express.Router();

// Get all deliveries (auto-generated from completed projects, milestones, and tasks)
router.get('/', requireAuth(), async (req, res) => {
  try {
    const deliveries = [];

    // Get completed projects
    const completedProjects = await Project.find({
      status: { $in: ['Completed', 'Done', 'Approved'] }
    })
      .populate('assignee', 'firstName lastName imageUrl email')
      .populate('createdBy', 'firstName lastName imageUrl email')
      .sort({ updatedAt: -1 });

    // Get completed milestones
    const completedMilestones = await Milestone.find({
      status: { $in: ['Completed', 'Done', 'Approved'] }
    })
      .populate('assignee', 'firstName lastName imageUrl email')
      .populate('createdBy', 'firstName lastName imageUrl email')
      .populate('project', 'name client')
      .sort({ updatedAt: -1 });

    // Get completed tasks
    const completedTasks = await Task.find({
      status: { $in: ['Completed', 'Done', 'Approved'] }
    })
      .populate('assignee', 'firstName lastName imageUrl email')
      .populate('createdBy', 'firstName lastName imageUrl email')
      .populate('project', 'name client')
      .sort({ updatedAt: -1 });

      console.log(completedProjects, "this");


    // Transform projects to delivery format
    completedProjects.forEach(project => {
      deliveries.push({
        id: project._id,
        type: 'Project',
        name: project.name,
        description: project.description,
        completedDate: project.updatedAt,
        deliveredBy: project.assignee.map(u => ({
  id: u._id,
  name: u.firstName + ' ' + u.lastName,
  imageUrl: u.imageUrl
})),
        client: project.client || 'N/A',
        version: project.version || '1.0.0',
        status: 'Delivered',
        deliverables: project.name || [
          'Project Files',
          'Documentation',
          'Source Code'
        ],
        originalData: project
      });
    });

    // Transform milestones to delivery format
    completedMilestones.forEach(milestone => {
      deliveries.push({
        id: milestone._id,
        type: 'Milestone',
        name: milestone.name,
        description: milestone.description,
        completedDate: milestone.updatedAt,
        // deliveredBy: milestone.assignee?.name || 'Unknown',
        deliveredBy: milestone.assignee.map(u => ({
  id: u._id,
  name: u.firstName + ' ' + u.lastName,
  imageUrl: u.imageUrl
})),
        client: milestone.project?.client || 'N/A',
        version: milestone.version || '1.0.0',
        status: 'Delivered',
        deliverables: milestone.name || [
          'Milestone Deliverables',
          'Progress Report',
          'Documentation'
        ],
        originalData: milestone
      });
    });

    // Transform tasks to delivery format
    completedTasks.forEach(task => {
      deliveries.push({
        id: task._id,
        type: 'Task',
        name: task.title,
        description: task.description,
        completedDate: task.updatedAt,
        deliveredBy: task.assignee?.imageUrl || 'Unknown',
        client: task.project?.client || 'N/A',
        version: task.version || '1.0.0',
        status: 'Delivered',
        deliverables: task.title || [
          'Task Output',
          'Documentation',
          'Test Results'
        ],
        originalData: task
      });
    });

    // Sort all deliveries by completion date
    deliveries.sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
    // console.log(deliveries, "deliveries");

    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get deliveries by type
router.get('/type/:type', requireAuth(), async (req, res) => {
  try {
    const { type } = req.params;
    let deliveries = [];

    if (type.toLowerCase() === 'project') {
      const completedProjects = await Project.find({
        status: { $in: ['Completed', 'Done', 'Approved'] }
      })
        .populate('assignee', 'firstName lastName imageUrl email')
        .populate('createdBy', 'firstName lastName imageUrl email')
        .sort({ updatedAt: -1 });

        console.log(completedProjects, "completedProjects");


      deliveries = completedProjects.map(project => ({
        id: project._id,
        type: 'Project',
        name: project.name,
        description: project.description,
        completedDate: project.updatedAt,
        deliveredBy: project.assignee.map(u => ({
  id: u._id,
  name: u.firstName + ' ' + u.lastName,
  imageUrl: u.imageUrl
})),
        client: project.client || 'N/A',
        version: project.version || '1.0.0',
        status: 'Delivered',
        deliverables: project.name || [
          'Project Files',
          'Documentation',
          'Source Code'
        ],
        originalData: project
      }));
    } else if (type.toLowerCase() === 'milestone') {
      const completedMilestones = await Milestone.find({
        status: { $in: ['Completed', 'Done', 'Approved'] }
      })
        .populate('assignee', 'firstName lastName imageUrl email')
        .populate('createdBy', 'firstName lastName imageUrl email')
        .populate('project', 'name client')
        .sort({ updatedAt: -1 });

      deliveries = completedMilestones.map(milestone => ({
        id: milestone._id,
        type: 'Milestone',
        name: milestone.name,
        description: milestone.description,
        completedDate: milestone.updatedAt,
        deliveredBy: milestone.assignee.map(u => ({
  id: u._id,
  name: u.firstName + ' ' + u.lastName,
  imageUrl: u.imageUrl
})),
        client: milestone.project?.client || 'N/A',
        version: milestone.version || '1.0.0',
        status: 'Delivered',
        deliverables: milestone.name || [
          'Milestone Deliverables',
          'Progress Report',
          'Documentation'
        ],
        originalData: milestone
      }));
    } else if (type.toLowerCase() === 'task') {
      const completedTasks = await Task.find({
        status: { $in: ['Completed', 'Done', 'Approved'] }
      })
        .populate('assignee', 'firstName lastName imageUrl email')
        .populate('createdBy', 'firstName lastName imageUrl email')
        .populate('project', 'name client')
        .sort({ updatedAt: -1 });

      deliveries = completedTasks.map(task => ({
        id: task._id,
        type: 'Task',
        name: task.name,
        description: task.description,
        completedDate: task.updatedAt,
        deliveredBy: task.assignee?.imageUrl || 'Unknown',
        client: task.project?.client || 'N/A',
        version: task.version || '1.0.0',
        status: 'Delivered',
        deliverables: task.title || [
          'Task Output',
          'Documentation',
          'Test Results'
        ],
        originalData: task
      }));
    }

    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get deliveries by project ID
router.get('/project/:project', requireAuth(), async (req, res) => {
  try {
    const { project } = req.params;
    const deliveries = [];

    // Get completed project
    const projectData = await Project.findById(project)
      .populate('assignee', 'firstName lastName imageUrl email');

    if (project && ['Completed', 'Done', 'Approved'].includes(project.status)) {
      deliveries.push({
        id: projectData._id,
        type: 'Project',
        name: projectData.name,
        description: projectData.description,
        completedDate: projectData.updatedAt,
        deliveredBy: projectData.assignee.map(u => ({
  id: u._id,
  name: u.firstName + ' ' + u.lastName,
  imageUrl: u.imageUrl
})),
        client: projectData.client || 'N/A',
        version: projectData.version || '1.0.0',
        status: 'Delivered',
        deliverables: projectData.name || [
          'Project Files',
          'Documentation',
          'Source Code'
        ]
      });
    }

    // Get completed milestones for this project
    const completedMilestones = await Milestone.find({
      project,
      status: { $in: ['Completed', 'Done', 'Approved'] }
    })
      .populate('assignee', 'firstName lastName imageUrl email')
      .populate('project', 'name client');

    completedMilestones.forEach(milestone => {
      deliveries.push({
        id: milestone._id,
        type: 'Milestone',
        name: milestone.name,
        description: milestone.description,
        completedDate: milestone.updatedAt,
        deliveredBy: milestone.assignee.map(u => ({
  id: u._id,
  name: u.firstName + ' ' + u.lastName,
  imageUrl: u.imageUrl
})),
        client: milestone.project?.client || 'N/A',
        version: milestone.version || '1.0.0',
        status: 'Delivered',
        deliverables: milestone.name || [
          'Milestone Deliverables',
          'Progress Report',
          'Documentation'
        ]
      });
    });

    // Get completed tasks for this project
    const completedTasks = await Task.find({
      project,
      status: { $in: ['Completed', 'Done', 'Approved'] }
    })
      .populate('assignee', 'firstName lastName imageUrl email')
      .populate('project', 'name client');

    completedTasks.forEach(task => {
      deliveries.push({
        id: task._id,
        type: 'Task',
        name: task.name,
        description: task.description,
        completedDate: task.updatedAt,
        deliveredBy: task.assignee?.imageUrl || 'Unknown',
        client: task.project?.client || 'N/A',
        version: task.version || '1.0.0',
        status: 'Delivered',
        deliverables: task.title || [
          'Task Output',
          'Documentation',
          'Test Results'
        ]
      });
    });

    // Sort by completion date
    deliveries.sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));

    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get delivery stats
router.get('/stats', requireAuth(), async (req, res) => {
  try {
    const projectCount = await Project.countDocuments({
      status: { $in: ['Completed', 'Done', 'Approved'] }
    });

    const milestoneCount = await Milestone.countDocuments({
      status: { $in: ['Completed', 'Done', 'Approved'] }
    });

    const taskCount = await Task.countDocuments({
      status: { $in: ['Completed', 'Done', 'Approved'] }
    });

    res.json({
      projects: projectCount,
      milestones: milestoneCount,
      tasks: taskCount,
      total: projectCount + milestoneCount + taskCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
