// backend/server.js
const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
// This file starts the backend server for the Tokenizer application.
// It imports the Express app from app.js and listens on a specified port.           
// The port is either the value of the PORT environment variable or 3001.