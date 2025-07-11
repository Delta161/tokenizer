const express = require('express');
const cors = require('cors');
const projectRoutes = require('./routes/projects');
require('dotenv').config();

const app = express();

app.use(cors()); // Allow cross-origin from frontend
app.use(express.json()); // Parse JSON body
app.use('/api/projects', projectRoutes); // Mount routes

module.exports = app;
