const mongoose = require('mongoose');

const weeklyReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    weekStartDate: {
      type: Date,
      required: true,
    },
    weekEndDate: {
      type: Date,
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    tasksCompleted: [
      {
        type: String,
        required: true,
      },
    ],
    tasksPlanned: [
      {
        type: String,
        required: true,
      },
    ],
    blockers: {
      type: String,
      default: '',
    },
    hoursWorked: {
      type: Number,
      default: null,
    },
    notesOrLinks: {
      type: String,
      default: '',
    },
    submissionStatus: {
      type: String,
      enum: ['draft', 'submitted'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema);
