import express from 'express';
import app from '../../app';

// Print all registered routes
console.log('\n--- Testing App Routes ---');
console.log('All registered routes in the main application:');

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
      let routePath = '';
      if (layer.regexp) {
        const match = layer.regexp.toString().match(/\^\\\/?(.+?)(?:\\\/?\$|\$)/i);
        if (match && match[1]) {
          routePath = '/' + match[1].replace(/\\\//g, '/').replace(/\\\./g, '.');
        }
      }
      console.log(`Router at: ${routePath || 'unknown path'}`);
      
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

// Check specifically for investment routes
console.log('\nChecking for investment routes:');
let investmentRoutesFound = false;

if (router && router.stack) {
  router.stack.forEach((layer: any) => {
    if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      // Check all routes in this router
      layer.handle.stack.forEach((routeLayer: any) => {
        if (routeLayer.route) {
          const path = routeLayer.route.path;
          if (path && (path.includes('investments') || path.startsWith('/investments'))) {
            if (!investmentRoutesFound) {
              investmentRoutesFound = true;
              console.log('Found investment routes:');
            }
            
            const methods = Object.keys(routeLayer.route.methods)
              .filter((method: string) => routeLayer.route.methods[method])
              .map((method: string) => method.toUpperCase())
              .join(', ');
            console.log(`  ${methods} ${path}`);
          }
        }
      });
    }
  });
}

// Also check for routes that start with /investments
if (router && router.stack) {
  router.stack.forEach((layer: any) => {
    if (layer.route && layer.route.path && 
        (layer.route.path.includes('investments') || layer.route.path.startsWith('/investments'))) {
      if (!investmentRoutesFound) {
        investmentRoutesFound = true;
        console.log('Found investment routes:');
      }
      
      const methods = Object.keys(layer.route.methods)
        .filter((method: string) => layer.route.methods[method])
        .map((method: string) => method.toUpperCase())
        .join(', ');
      console.log(`  ${methods} ${layer.route.path}`);
    }
  });
}

if (!investmentRoutesFound) {
  console.log('❌ No investment routes found in the main application');
  console.log('Make sure the investment routes are properly registered in app.ts');
} else {
  console.log('✅ Investment routes successfully registered in the main application');
}