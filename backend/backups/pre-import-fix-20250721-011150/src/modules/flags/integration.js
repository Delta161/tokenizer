/**
 * Feature Flags Module Integration Examples
 * This file provides examples of how to integrate the feature flags module
 */

// Example 1: Mounting the routes
const express = require('express');
const { flagsRouter } = require('./index');

const app = express();

// Mount the flags routes at /api
app.use('/api', flagsRouter);

// Example 2: Using feature flags in route handlers
const { flagsService } = require('./index');

app.get('/some-route', async (req, res) => {
  // Check if a feature is enabled
  const isNewFeatureEnabled = await flagsService.getFlag('NEW_FEATURE');
  
  if (isNewFeatureEnabled) {
    // New feature implementation
    return res.json({ message: 'New feature is enabled!' });
  } else {
    // Old implementation
    return res.json({ message: 'Using the old implementation' });
  }
});

// Example 3: Conditionally enabling routes based on feature flags
app.use('/new-api', async (req, res, next) => {
  const isNewApiEnabled = await flagsService.getFlag('NEW_API');
  
  if (isNewApiEnabled) {
    next(); // Allow access to the route
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

// Example 4: Using feature flags in business logic
const processData = async (data) => {
  const useNewAlgorithm = await flagsService.getFlag('NEW_ALGORITHM');
  
  if (useNewAlgorithm) {
    // Process data with new algorithm
    return newAlgorithm(data);
  } else {
    // Process data with old algorithm
    return oldAlgorithm(data);
  }
};

// These are just examples and are not meant to be executed directly