import express from 'express';

const app = express();

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple test route
app.get('/', (req, res) => {
  console.log('Root endpoint accessed');
  res.json({ message: 'API is running' });
});



// Test route to get documents
app.get('/api/documents', (req, res) => {
  console.log('Documents endpoint accessed');
  
  // Return mock data since Document model doesn't exist
  const mockDocuments = [
    { id: '1', title: 'Mock Document 1', content: 'This is a mock document', createdAt: new Date() },
    { id: '2', title: 'Mock Document 2', content: 'This is another mock document', createdAt: new Date() }
  ];
  
  console.log('Returning mock documents since Document model is not available');
  
  res.json({
    success: true,
    message: 'Mock documents returned since Document model is not available in the schema',
    data: mockDocuments
  });
});

// Test route to get soft-deleted documents
app.get('/api/documents/deleted', (req, res) => {
  console.log('Deleted documents endpoint accessed');
  
  // Return mock deleted documents since Document model doesn't exist
  const mockDeletedDocuments = [
    { id: '3', title: 'Deleted Document 1', content: 'This is a deleted mock document', createdAt: new Date(), deletedAt: new Date() },
    { id: '4', title: 'Deleted Document 2', content: 'This is another deleted mock document', createdAt: new Date(), deletedAt: new Date() }
  ];
  
  console.log('Returning mock deleted documents since Document model is not available');
  
  res.json({
    success: true,
    message: 'Mock deleted documents returned since Document model is not available in the schema',
    data: mockDeletedDocuments
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Simple test server running on port ${PORT}`);
});