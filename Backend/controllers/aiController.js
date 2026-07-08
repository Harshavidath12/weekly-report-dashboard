const asyncHandler = require('express-async-handler');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const WeeklyReport = require('../models/WeeklyReport');

// @desc    Process chat query with RAG context
// @route   POST /api/ai/chat
// @access  Private/Manager
const chatWithAI = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Please provide a message');
  }

  // Initialize Gemini API inside the handler or after checking env, to prevent crash if env is missing
  if (!process.env.GEMINI_API_KEY) {
    res.status(500);
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // 1. Fetch recent reports as context
  // Fetch the last 50 reports to provide context without overloading token limits
  const recentReports = await WeeklyReport.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('user', 'name email role')
    .populate('project', 'name');

  // Format the reports into a readable text context
  const contextData = recentReports.map((r, index) => {
    return `
Report #${index + 1}:
User: ${r.user?.name || 'Unknown'}
Project: ${r.project?.name || 'Unknown'}
Date: ${r.weekStartDate ? new Date(r.weekStartDate).toLocaleDateString() : 'N/A'} - ${r.weekEndDate ? new Date(r.weekEndDate).toLocaleDateString() : 'N/A'}
Status: ${r.submissionStatus}
Tasks Completed: ${r.tasksCompleted?.join('; ') || 'None'}
Tasks Planned: ${r.tasksPlanned?.join('; ') || 'None'}
Hours Worked: ${r.hoursWorked || 'Not specified'}
Blockers: ${r.blockers || 'None'}
`;
  }).join('\n');

  // 2. Prepare the prompt for Gemini
  // gemini-1.5-flash is generally faster and highly capable for this type of task
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: "You are an executive AI Management Assistant for TeamReports. Your role is to analyze the provided raw weekly team reports context and answer the manager's query clearly. RULES:\n1. If the manager greets you (e.g. 'Hi', 'Hello'), respond naturally and conversationally without analyzing reports.\n2. Only analyze and provide project/team data when specifically requested.\n3. ALWAYS use gender-neutral pronouns (they/them/their) when referring to employees, or refer to them strictly by their name, to completely avoid any misgendering. Be concise and professional."
  });

  const fullPrompt = `
Here is the recent team weekly reports context:
${contextData}

Manager's Query: ${message}
`;

  try {
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    res.status(200).json({
      success: true,
      data: responseText
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500);
    throw new Error('Failed to generate AI response');
  }
});

module.exports = {
  chatWithAI
};
