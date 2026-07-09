# Weekly Report Dashboard

This repository contains the source code for the Weekly Report Dashboard application, featuring a Node.js/Express backend and a modern frontend.

## Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or a free MongoDB Atlas cluster)

---

## 1. Installing Dependencies

This project is divided into `Frontend` and `Backend` directories. You will need to install the NPM packages for both environments.

**Install Backend Dependencies:**
```bash
cd Backend
npm install
```

**Install Frontend Dependencies:**
```bash
cd Frontend
npm install
```

---

## 2. Running the Database

This application uses MongoDB for data storage. 

1. Ensure you have MongoDB running locally, or obtain a connection string from your [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster.
2. Navigate to the `Backend` folder and create a `.env` file.
3. Add your database connection string and other required variables to the `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
```
*(Note: Do not commit your actual `.env` file to version control).*

---

## 3. Running the Backend

Once your database is set up and dependencies are installed, you can launch the backend server.

Open a terminal and run the following commands:
```bash
cd Backend
npm start 
```
*You should see a message in the console indicating the server is running (e.g., "Server running on port 5000" and "MongoDB Connected").*

---

## 4. Running the Frontend

To launch the user interface, open a **new, separate terminal window** (keep the backend running in the first one).

Run the following commands:
```bash
cd Frontend
npm run dev
```
*The terminal will provide a local URL (typically `http://localhost:3000` or `http://localhost:5173`). Click or copy this URL into your browser to view the application.*
