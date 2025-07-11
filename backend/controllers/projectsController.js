// backend/controllers/projectsController.js

const { prisma } = require('../prisma/client');

const getAllProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
};

// backend/app.js   

const createProject = async (req, res) => {
    try {
      const {
        title,
        location,
        issuer,
        network,
        type,
        tokenPrice,
        tokensAvailable,
        totalTokens,
        fundedPercent,
        status,
        launchDate,
        description,
        tokenAddress,
        imageUrl,
      } = req.body;
  
      // Basic validation
      if (!title || !tokenPrice || !totalTokens) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      const newProject = await prisma.project.create({
        data: {
          title,
          location,
          issuer,
          network,
          type,
          tokenPrice,
          tokensAvailable,
          totalTokens,
          fundedPercent,
          status,
          launchDate: new Date(launchDate),
          description,
          tokenAddress,
          imageUrl,
        },
      });
  
      res.status(201).json(newProject);
    } catch (err) {
      console.error('Create project error:', err);
      res.status(500).json({ error: 'Failed to create project' });
    }
  };

  module.exports = {
    getAllProjects,
    getProjectById,
    createProject,
  };
// tokenizer/backend/app.js  
// backend/app.js  