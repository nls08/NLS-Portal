import express from "express";
import Task from "../models/Task.js";
// import { broadcast } from '../server.js';
import { requireAuth } from "@clerk/express";
// import { requireSuperAdmin } from '../middleware/requireAdminMiddleware.js';

const router = express.Router();

// Get all tasks
router.get("/", requireAuth(), async (req, res) => {
  try {
    const tasks = await Task.find()
      .sort({ createdAt: -1 })
      .populate("assignee")
      .populate("project")
      .populate("milestone");

    res.json(tasks);
    console.log(tasks, "this is task");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get task by ID
router.get("/:id", requireAuth(), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignee")
      .populate("project")
      .populate("milestone");
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new task
router.post("/", requireAuth(), async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      createdBy: req.auth?.userId || "system",
    });
    await task.save();

    // Broadcast notification
    broadcast({
      type: "task_assigned",
      taskName: task.title,
      assignee: task.assignee,
      message: `New task assigned: ${task.title}`,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update task
router.put("/:id", requireAuth(), async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Broadcast notification
    broadcast({
      type: "status_update",
      message: `Task ${task.title} status updated to ${task.status}`,
    });

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update task todos
router.put("/:id/todos", requireAuth(), async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { todos: req.body.todos },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Move task to QA
router.put("/:id/qa", requireAuth(), async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: "QA Ready" },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Broadcast notification
    broadcast({
      type: "notification",
      message: `Task ${task.title} moved to QA`,
    });

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete task
router.delete("/:id", requireAuth(), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
