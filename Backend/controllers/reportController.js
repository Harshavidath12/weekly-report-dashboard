const asyncHandler = require('express-async-handler');
const WeeklyReport = require('../models/WeeklyReport');

// @desc    Create a new weekly report
// @route   POST /api/reports
// @access  Private
const createReport = asyncHandler(async (req, res) => {
  const {
    weekStartDate,
    weekEndDate,
    project,
    tasksCompleted,
    tasksPlanned,
    blockers,
    hoursWorked,
    notesOrLinks,
    submissionStatus
  } = req.body;

  if (!weekStartDate || !weekEndDate || !project) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const report = await WeeklyReport.create({
    user: req.user._id,
    weekStartDate,
    weekEndDate,
    project,
    tasksCompleted: tasksCompleted || [],
    tasksPlanned: tasksPlanned || [],
    blockers: blockers || '',
    hoursWorked: hoursWorked || null,
    notesOrLinks: notesOrLinks || '',
    submissionStatus: submissionStatus || 'draft',
  });

  res.status(201).json(report);
});

// @desc    Update a weekly report
// @route   PUT /api/reports/:id
// @access  Private
const updateReport = asyncHandler(async (req, res) => {
  const report = await WeeklyReport.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  // Check for user
  if (report.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized to update this report');
  }

  // Prevent editing if already submitted (optional based on requirements, but requirement says "before/after submission")
  // For now, allow edits but maybe manager dashboard needs a history of edits later.

  const updatedReport = await WeeklyReport.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updatedReport);
});

// @desc    Get logged in user's reports
// @route   GET /api/reports/me
// @access  Private
const getMyReports = asyncHandler(async (req, res) => {
  const reports = await WeeklyReport.find({ user: req.user._id })
    .populate('project', 'name')
    .sort({ weekStartDate: -1 });
  res.status(200).json(reports);
});

// @desc    Get report by ID
// @route   GET /api/reports/:id
// @access  Private
const getReportById = asyncHandler(async (req, res) => {
  const report = await WeeklyReport.findById(req.params.id).populate('project', 'name');

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  // Check for user
  if (report.user.toString() !== req.user._id.toString() && req.user.role !== 'Manager') {
    res.status(401);
    throw new Error('User not authorized to view this report');
  }

  res.status(200).json(report);
});

module.exports = {
  createReport,
  updateReport,
  getMyReports,
  getReportById,
};
