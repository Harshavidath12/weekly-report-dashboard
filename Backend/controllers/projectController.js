const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({}).sort({ createdAt: -1 });
  res.status(200).json(projects);
});

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Manager
const createProject = asyncHandler(async (req, res) => {
  const { name, description, assignedMembers, status, priority, startDate, endDate } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Please provide a project name');
  }

  const projectExists = await Project.findOne({ name });
  if (projectExists) {
    res.status(400);
    throw new Error('Project with this name already exists');
  }

  const project = await Project.create({
    name,
    description: description || '',
    assignedMembers: assignedMembers || [],
    status: status || 'Active',
    priority: priority || 'Medium',
    startDate,
    endDate,
  });

  res.status(201).json(project);
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Manager
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updatedProject);
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Manager
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  await project.deleteOne();
  res.status(200).json({ id: req.params.id });
});

// @desc    Join a project
// @route   POST /api/projects/:id/join
// @access  Private
const joinProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.assignedMembers.includes(req.user._id)) {
    res.status(400);
    throw new Error('You are already assigned to this project');
  }

  project.assignedMembers.push(req.user._id);
  await project.save();

  res.status(200).json(project);
});

// @desc    Leave a project
// @route   POST /api/projects/:id/leave
// @access  Private
const leaveProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (!project.assignedMembers.includes(req.user._id)) {
    res.status(400);
    throw new Error('You are not assigned to this project');
  }

  project.assignedMembers = project.assignedMembers.filter(
    (userId) => userId.toString() !== req.user._id.toString()
  );
  await project.save();

  res.status(200).json(project);
});

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  joinProject,
  leaveProject,
};
