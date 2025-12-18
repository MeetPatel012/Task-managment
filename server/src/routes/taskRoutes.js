const express = require('express');
const router = express.Router();
const {
  getTasksByProject,
  createTask,
  getTaskById,
  updateTask,
  reorderTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');

// All routes are protected
router.use(protect);

// Project-based task routes
router.get('/projects/:projectId/tasks', getTasksByProject);
router.post('/projects/:projectId/tasks', createTask);

// Task-specific routes
router.get('/:id', getTaskById);
router.patch('/:id', updateTask);
router.patch('/:id/reorder', reorderTask);
router.delete('/:id', deleteTask);

module.exports = router;
