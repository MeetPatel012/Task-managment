const express = require('express');
const router = express.Router();
const { getDashboardOverview } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

// All routes are protected
router.use(protect);

// Dashboard overview
router.get('/overview', getDashboardOverview);

module.exports = router;
