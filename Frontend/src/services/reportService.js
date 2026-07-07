import axios from 'axios';

// Get user token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Setup axios config with auth header
const authConfig = () => {
  return {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  };
};

const API_URL = '/api/reports/';

// Create new report
const createReport = async (reportData) => {
  const response = await axios.post(API_URL, reportData, authConfig());
  return response.data;
};

// Update report
const updateReport = async (reportId, reportData) => {
  const response = await axios.put(API_URL + reportId, reportData, authConfig());
  return response.data;
};

// Get logged in user's reports
const getMyReports = async () => {
  const response = await axios.get(API_URL + 'me', authConfig());
  return response.data;
};

// Get specific report by ID
const getReportById = async (reportId) => {
  const response = await axios.get(API_URL + reportId, authConfig());
  return response.data;
};

// Get all reports (Manager only)
const getAllReports = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await axios.get(`${API_URL}?${query}`, authConfig());
  return response.data;
};

const reportService = {
  createReport,
  updateReport,
  getMyReports,
  getReportById,
  getAllReports,
};

export default reportService;
