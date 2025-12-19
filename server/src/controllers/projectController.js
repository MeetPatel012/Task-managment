const Project = require("../models/Project");
const User = require("../models/User");

/**
 * Get all projects for current user
 * @route GET /api/projects
 * @access Private
 */
const getProjects = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    // Build query
    const query = {
      $or: [{ owner: userId }, { "members.user": userId }],
    };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const projects = await Project.find(query)
      .populate("owner", "name email avatarUrl")
      .populate("members.user", "name email avatarUrl")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(query);

    res.status(200).json({
      success: true,
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new project
 * @route POST /api/projects
 * @access Private
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description, startDate, dueDate, color } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    // Create project with owner as a member
    const project = await Project.create({
      name,
      description,
      startDate,
      dueDate,
      color,
      owner: userId,
      members: [
        {
          user: userId,
          role: "owner",
        },
      ],
    });

    // Populate owner and members
    await project.populate("owner", "name email avatarUrl");
    await project.populate("members.user", "name email avatarUrl");

    res.status(201).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get project by ID
 * @route GET /api/projects/:id
 * @access Private
 */
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findById(id)
      .populate("owner", "name email avatarUrl")
      .populate("members.user", "name email avatarUrl");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user has access
    const hasAccess =
      project.owner._id.toString() === userId ||
      project.members.some((m) => m.user._id.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update project
 * @route PATCH /api/projects/:id
 * @access Private (owner/manager only)
 */
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, description, startDate, dueDate, status, color } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is owner or manager
    const member = project.members.find((m) => m.user.toString() === userId);
    const isOwner = project.owner.toString() === userId;
    const isManager = member && member.role === "manager";

    if (!isOwner && !isManager) {
      return res.status(403).json({
        success: false,
        message: "Only owner or manager can update project",
      });
    }

    // Update fields
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (startDate !== undefined) project.startDate = startDate;
    if (dueDate !== undefined) project.dueDate = dueDate;
    if (status !== undefined) project.status = status;
    if (color !== undefined) project.color = color;

    await project.save();

    // Populate and return
    await project.populate("owner", "name email avatarUrl");
    await project.populate("members.user", "name email avatarUrl");

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Archive project (soft delete)
 * @route DELETE /api/projects/:id
 * @access Private (owner only)
 */
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is owner
    if (project.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only owner can archive project",
      });
    }

    // Archive project
    project.status = "archived";
    await project.save();

    res.status(200).json({
      success: true,
      message: "Project archived successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add member to project
 * @route POST /api/projects/:id/members
 * @access Private (owner/manager only)
 */
const addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId: newUserId, email, role } = req.body;
    const currentUserId = req.user.id;

    // Validate input - at least one identifier is required
    if ((!newUserId && !email) || !role) {
      return res.status(400).json({
        success: false,
        message: "Either userId or email is required, along with role",
      });
    }

    // Find user by ID or email
    let userToAdd;
    if (email) {
      userToAdd = await User.findOne({ email: email.toLowerCase() });
      if (!userToAdd) {
        return res.status(404).json({
          success: false,
          message: "User with this email not found",
        });
      }
    } else {
      userToAdd = await User.findById(newUserId);
      if (!userToAdd) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if current user is owner or manager
    const member = project.members.find(
      (m) => m.user.toString() === currentUserId
    );
    const isOwner = project.owner.toString() === currentUserId;
    const isManager = member && member.role === "manager";

    if (!isOwner && !isManager) {
      return res.status(403).json({
        success: false,
        message: "Only owner or manager can add members",
      });
    }

    // Check if user is already a member
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member",
      });
    }

    // Add member
    project.members.push({
      user: userToAdd._id,
      role,
    });

    await project.save();
    await project.populate("members.user", "name email avatarUrl");

    res.status(200).json({
      success: true,
      message: "Member added successfully",
      members: project.members,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove member from project
 * @route DELETE /api/projects/:id/members/:userId
 * @access Private (owner/manager only)
 */
const removeMember = async (req, res, next) => {
  try {
    const { id, userId: userIdToRemove } = req.params;
    const currentUserId = req.user.id;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if current user is owner or manager
    const member = project.members.find(
      (m) => m.user.toString() === currentUserId
    );
    const isOwner = project.owner.toString() === currentUserId;
    const isManager = member && member.role === "manager";

    if (!isOwner && !isManager) {
      return res.status(403).json({
        success: false,
        message: "Only owner or manager can remove members",
      });
    }

    // Cannot remove owner
    if (project.owner.toString() === userIdToRemove) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove project owner",
      });
    }

    // Remove member
    project.members = project.members.filter(
      (m) => m.user.toString() !== userIdToRemove
    );

    await project.save();

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
