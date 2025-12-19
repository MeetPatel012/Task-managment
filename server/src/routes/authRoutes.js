const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", protect, getMe);
router.get("/users", protect, getAllUsers);
router.patch("/profile", protect, updateProfile);
router.patch("/password", protect, changePassword);

module.exports = router;
