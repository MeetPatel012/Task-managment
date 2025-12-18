const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * Get all comments for a task
 * @route GET /api/tasks/:taskId/comments
 * @access Private
 */
const getCommentsByTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    // Check if task exists and user has access
    const task = await Task.findById(taskId).populate('project', 'owner members');
    
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

    // Get comments sorted by creation time
    const comments = await Comment.find({ task: taskId })
      .populate('author', 'name email avatarUrl')
      .populate('parentComment')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new comment
 * @route POST /api/tasks/:taskId/comments
 * @access Private
 */
const createComment = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { content, parentComment } = req.body;
    const userId = req.user.id;

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      });
    }

    // Check if task exists and user has access
    const task = await Task.findById(taskId).populate('project', 'owner members');
    
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

    // If parentComment is provided, verify it exists and belongs to the same task
    if (parentComment) {
      const parentCommentDoc = await Comment.findById(parentComment);
      if (!parentCommentDoc) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found',
        });
      }
      if (parentCommentDoc.task.toString() !== taskId) {
        return res.status(400).json({
          success: false,
          message: 'Parent comment does not belong to this task',
        });
      }
    }

    // Create comment
    const comment = await Comment.create({
      task: taskId,
      author: userId,
      content,
      parentComment: parentComment || null,
    });

    // Increment commentsCount on the task
    task.commentsCount += 1;
    await task.save();

    // Populate author before returning
    await comment.populate('author', 'name email avatarUrl');

    res.status(201).json({
      success: true,
      comment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a comment
 * @route DELETE /api/comments/:id
 * @access Private (author or admin only)
 */
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check if user is the author or an admin
    const isAuthor = comment.author.toString() === userId;
    const isAdmin = userRole === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the comment author or admin can delete this comment',
      });
    }

    // Get the task to decrement commentsCount
    const task = await Task.findById(comment.task);
    if (task) {
      task.commentsCount = Math.max(0, task.commentsCount - 1);
      await task.save();
    }

    // Delete the comment
    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommentsByTask,
  createComment,
  deleteComment,
};
