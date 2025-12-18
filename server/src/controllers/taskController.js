const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * Get all tasks for a project
 * @route GET /api/projects/:projectId/tasks
 * @access Private
 */
const getTasksByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, assignee, search } = req.query;
    const userId = req.user.id;

    // Check if user has access to project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const hasAccess =
      project.owner.toString() === userId ||
      project.members.some(m => m.user.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Build query
    const query = { project: projectId };

    if (status) {
      query.status = status;
    }

    if (assignee) {
      query.assignee = assignee;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'name email avatarUrl')
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task
 * @route POST /api/projects/:projectId/tasks
 * @access Private
 */
const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, assignee, dueDate, tags } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    // Check if user has access to project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const hasAccess =
      project.owner.toString() === userId ||
      project.members.some(m => m.user.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Get max order for the status column
    const taskStatus = status || 'todo';
    const maxOrderTask = await Task.findOne({
      project: projectId,
      status: taskStatus,
    }).sort({ order: -1 });

    const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

    // Create task
    const task = await Task.create({
      project: projectId,
      title,
      description,
      status: taskStatus,
      priority,
      assignee,
      dueDate,
      tags,
      createdBy: userId,
      order,
    });

    // Populate and return
    await task.populate('assignee', 'name email avatarUrl');
    await task.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get task by ID
 * @route GET /api/tasks/:id
 * @access Private
 */
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(id)
      .populate('project', 'name owner members')
      .populate('assignee', 'name email avatarUrl')
      .populate('createdBy', 'name email avatarUrl');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user has access to the project
    const hasAccess =
      task.project.owner.toString() === userId ||
      task.project.members.some(m => m.user.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update task
 * @route PATCH /api/tasks/:id
 * @access Private
 */
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, status, priority, assignee, dueDate, tags, subtasks } = req.body;

    const task = await Task.findById(id).populate('project', 'owner members');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user has access
    const hasAccess =
      task.project.owner.toString() === userId ||
      task.project.members.some(m => m.user.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assignee !== undefined) task.assignee = assignee;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (tags !== undefined) task.tags = tags;
    if (subtasks !== undefined) task.subtasks = subtasks;

    await task.save();

    // Populate and return
    await task.populate('assignee', 'name email avatarUrl');
    await task.populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder task (for Kanban drag & drop)
 * @route PATCH /api/tasks/:id/reorder
 * @access Private
 */
const reorderTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, order } = req.body;
    const userId = req.user.id;

    // Validate input
    if (status === undefined || order === undefined) {
      return res.status(400).json({
        success: false,
        message: 'status and order are required',
      });
    }

    const task = await Task.findById(id).populate('project', 'owner members');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user has access
    const hasAccess =
      task.project.owner.toString() === userId ||
      task.project.members.some(m => m.user.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const oldStatus = task.status;
    const oldOrder = task.order;
    const newStatus = status;
    const newOrder = parseInt(order);

    // If moving to a different status column
    if (oldStatus !== newStatus) {
      // Shift tasks in old column (decrease order for tasks after the moved task)
      await Task.updateMany(
        {
          project: task.project._id,
          status: oldStatus,
          order: { $gt: oldOrder },
        },
        { $inc: { order: -1 } }
      );

      // Shift tasks in new column (increase order for tasks at or after new position)
      await Task.updateMany(
        {
          project: task.project._id,
          status: newStatus,
          order: { $gte: newOrder },
        },
        { $inc: { order: 1 } }
      );
    } else {
      // Moving within the same column
      if (newOrder > oldOrder) {
        // Moving down: decrease order for tasks between old and new position
        await Task.updateMany(
          {
            project: task.project._id,
            status: oldStatus,
            order: { $gt: oldOrder, $lte: newOrder },
          },
          { $inc: { order: -1 } }
        );
      } else if (newOrder < oldOrder) {
        // Moving up: increase order for tasks between new and old position
        await Task.updateMany(
          {
            project: task.project._id,
            status: oldStatus,
            order: { $gte: newOrder, $lt: oldOrder },
          },
          { $inc: { order: 1 } }
        );
      }
    }

    // Update the task
    task.status = newStatus;
    task.order = newOrder;
    await task.save();

    // Populate and return
    await task.populate('assignee', 'name email avatarUrl');
    await task.populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete task
 * @route DELETE /api/tasks/:id
 * @access Private
 */
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(id).populate('project', 'owner members');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user has access
    const hasAccess =
      task.project.owner.toString() === userId ||
      task.project.members.some(m => m.user.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasksByProject,
  createTask,
  getTaskById,
  updateTask,
  reorderTask,
  deleteTask,
};
