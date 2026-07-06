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

const API_URL = '/api/auth/';

// Get all users (Manager only)
const getAllUsers = async () => {
  const response = await axios.get(API_URL + 'users', authConfig());
  return response.data;
};

const userService = {
  getAllUsers,
};

export default userService;
