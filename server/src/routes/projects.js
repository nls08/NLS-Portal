import express from "express";
import Project from "../models/Project.js";
// import { broadcast } from '../server.js'; // Comment out or remove for now
import { requireAuth } from "@clerk/express";
import User from "../models/User.js";
import mongoose from "mongoose";
import { requireSuperAdmin } from "../middleware/requireAdminMiddleware.js";

const router = express.Router();

router.get("/", requireAuth(), async (req, res) => {
  try {
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .populate("assignee")
      .populate("milestones");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project by ID
router.get("/:id", requireAuth(), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("assignee");
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", requireAuth(), requireSuperAdmin, async (req, res) => {
  try {
    // 1) find the Mongo user record
    const creator = await User.findOne({ clerkId: req.auth.userId });
    if (!creator) {
      return res.status(400).json({ error: "Creator not found in database" });
    }
    console.log(req.body, "this is req.body");

    // 2) build & save the project
    const project = new Project({
      ...req.body,
      assignee: req.body.assignee.map((id) => new mongoose.Types.ObjectId(id)),
      // array of User ObjectIds
      createdBy: creator._id, // <-- Mongo ObjectId
    });
    await project.save();

    // 3) populate assignee for the response
    await project.populate("assignee", "firstName lastName imageUrl email");

    // Conditionally broadcast (only for local development)
    if (process.env.NODE_ENV !== "production") {
      // broadcast({
      //   type: "notification",
      //   message: `New project: ${project.name}`,
      // });
    }

    res.status(201).json(project);
  } catch (err) {
    console.error("❌ Project creation error:", err);
    res.status(400).json({ error: err.message, stack: err.stack });
  }
});

router.put("/:id", requireAuth(), requireSuperAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, assignee: req.body.assignee },
      { new: true, runValidators: true }
    ).populate("assignee");
    if (!project) return res.status(404).json({ error: "Not found" });
    // Conditionally broadcast
    if (process.env.NODE_ENV !== "production") {
      // broadcast({ type: "status_update", message: `Updated: ${project.name}` });
    }
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete project
router.delete("/:id", requireAuth(), requireSuperAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project milestones
router.get("/:id/milestones", requireAuth(), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "milestones"
    );
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project.milestones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get(
  "/:id/client-milestones",
  requireAuth(),
  requireSuperAdmin,
  async (req, res) => {
    try {
      const project = await Project.findById(req.params.id).populate(
        "clientMilestones"
      );
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project.clientMilestones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
