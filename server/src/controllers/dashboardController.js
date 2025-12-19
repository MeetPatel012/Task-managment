const Project = require("../models/Project");
const Task = require("../models/Task");
const mongoose = require("mongoose");

/**
 * Get dashboard overview statistics
 * @route GET /api/dashboard/overview
 * @access Private
 */
const getDashboardOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Count projects where user is owner or member
    const projectsCount = await Project.countDocuments({
      $or: [{ owner: userId }, { "members.user": userId }],
      status: "active", // Only count active projects
    });

    // 2. Count tasks assigned to user
    const tasksAssignedCount = await Task.countDocuments({
      assignee: userId,
    });

    // 3. Get tasks grouped by status
    const tasksByStatusAgg = await Task.aggregate([
      {
        $match: { assignee: new mongoose.Types.ObjectId(userId) },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format tasksByStatus as an object
    const tasksByStatus = {
      todo: 0,
      in_progress: 0,
      under_review: 0,
      done: 0,
    };

    tasksByStatusAgg.forEach((item) => {
      if (item._id in tasksByStatus) {
        tasksByStatus[item._id] = item.count;
      }
    });

    // 4. Get upcoming tasks (due in next 7 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today (midnight)

    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999); // End of the 7th day

    const upcomingTasks = await Task.find({
      assignee: new mongoose.Types.ObjectId(userId),
      dueDate: {
        $gte: today,
        $lte: nextWeek,
      },
      status: { $ne: "done" }, // Exclude completed tasks
    })
      .populate("project", "name color")
      .populate("assignee", "name email avatarUrl")
      .sort({ dueDate: 1 })
      .limit(5)
      .select("title description status priority dueDate project");

    res.status(200).json({
      success: true,
      data: {
        projectsCount,
        tasksAssignedCount,
        tasksByStatus,
        upcomingTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
};
