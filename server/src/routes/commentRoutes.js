const express = require('express');
const router = express.Router();
const {
  getCommentsByTask,
  createComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

// All routes are protected
router.use(protect);

// Task-based comment routes
router.get('/tasks/:taskId/comments', getCommentsByTask);
router.post('/tasks/:taskId/comments', createComment);

// Comment-specific routes
router.delete('/:id', deleteComment);

module.exports = router;
