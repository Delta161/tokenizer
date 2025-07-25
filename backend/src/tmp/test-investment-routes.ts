import express from 'express';
import { initInvestmentModule } from '../modules/investment';
import { PrismaClient } from '@prisma/client';

// Create a test Express app
const app = express();
app.use(express.json());

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize investment module and mount routes
const investmentModule = initInvestmentModule(prisma);
app.use('/api/v1/investments', investmentModule.routes);

// Start the server
const PORT = 3001;
const server = app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('Available routes:');
  
  // Print all registered routes
  console.log('Investment module routes:');
  // Express 5 uses app.router instead of app._router
  const router = app.router || app._router;
  
  if (router && router.stack) {
    router.stack.forEach((layer: any) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods)
          .filter((method: string) => layer.route.methods[method])
          .map((method: string) => method.toUpperCase())
          .join(', ');
        console.log(`${methods} ${layer.route.path}`);
      } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        console.log(`Router at: ${layer.regexp}`);
        layer.handle.stack.forEach((routeLayer: any) => {
          if (routeLayer.route) {
            const methods = Object.keys(routeLayer.route.methods)
              .filter((method: string) => routeLayer.route.methods[method])
              .map((method: string) => method.toUpperCase())
              .join(', ');
            console.log(`  ${methods} ${routeLayer.route.path}`);
          }
        });
      }
    });
  } else {
    console.log('No routes found or router structure is different');
  }
  
  // Shutdown after 5 seconds
  setTimeout(() => {
    console.log('Shutting down test server...');
    server.close(() => {
      console.log('Test server closed');
      process.exit(0);
    });
  }, 5000);
});