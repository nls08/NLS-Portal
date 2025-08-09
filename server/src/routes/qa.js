import express from "express";
import Task from "../models/Task.js";
// import { broadcast } from '../server.js';
import { requireAuth } from "@clerk/express";
import { requireSuperAdmin } from "../middleware/requireAdminMiddleware.js";

const router = express.Router();

// Get all QA tasks
router.get("/tasks", requireAuth(), async (req, res) => {
  try {
    const qaTasks = await Task.find({
      status: {
        $in: ["QA Ready", "QA", "Approved", "Rejected", "Fixing Required"],
      },
    })
      .sort({ createdAt: -1 })
      .populate("assignee")
      .populate("project")
      .populate("milestone");

    res.json(qaTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update QA task status
router.put("/tasks/:id", requireAuth(), requireSuperAdmin, async (req, res) => {
  try {
    const { status, qaRemarks } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        status,
        qaRemarks: qaRemarks || "",
      },
      { new: true, runValidators: true }
    )
      .populate("assignee")
      .populate("project")
      .populate("milestone");

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Broadcast notification based on status
    let message = "";
    switch (status) {
      case "Approved":
        message = `Task ${task.title} approved by QA`;
        break;
      case "Rejected":
        message = `Task ${task.title} rejected by QA`;
        break;
      case "Fixing Required":
        message = `Task ${task.title} requires fixes`;
        break;
      default:
        message = `Task ${task.title} status updated`;
    }

    broadcast({
      type: "notification",
      message,
    });

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get revision tasks
router.get("/revision", requireAuth(), async (req, res) => {
  try {
    const revisionTasks = await Task.find({
      status: { $in: ["Rejected", "Fixing Required"] },
    })
      .sort({ updatedAt: -1 })
      .populate("assignee")
      .populate("project")
      .populate("milestone");
    res.json(revisionTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
