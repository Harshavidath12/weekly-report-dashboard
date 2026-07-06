import axios from 'axios';

const getToken = () => {
  return localStorage.getItem('token');
};

const authConfig = () => {
  return {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  };
};

const API_URL = '/api/projects/';

// Get all projects
const getProjects = async () => {
  const response = await axios.get(API_URL, authConfig());
  return response.data;
};

// Create a project (Manager only)
const createProject = async (projectData) => {
  const response = await axios.post(API_URL, projectData, authConfig());
  return response.data;
};

// Update a project (Manager only)
const updateProject = async (projectId, projectData) => {
  const response = await axios.put(API_URL + projectId, projectData, authConfig());
  return response.data;
};

// Delete a project (Manager only)
const deleteProject = async (projectId) => {
  const response = await axios.delete(API_URL + projectId, authConfig());
  return response.data;
};

// Join a project
const joinProject = async (projectId) => {
  const response = await axios.post(API_URL + projectId + '/join', {}, authConfig());
  return response.data;
};

// Leave a project
const leaveProject = async (projectId) => {
  const response = await axios.post(API_URL + projectId + '/leave', {}, authConfig());
  return response.data;
};

const projectService = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  joinProject,
  leaveProject,
};

export default projectService;
