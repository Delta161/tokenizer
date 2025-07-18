/**
 * Integration example for the Feature Flags module
 *
 * This file shows how to integrate the Feature Flags module into the main application
 */
// In app.js, add the following imports:
// import { flagsRoutes } from './modules/flags/routes/flags.routes.js';
// Then mount the routes:
// app.use('/api', flagsRoutes);
// Example usage in any other module:
/**
 * Example of using feature flags to conditionally enable functionality
 */
import { flagsService } from './modules/flags/index.js';
async function conditionalFeature() {
    // Check if a feature flag is enabled
    const isNewFeatureEnabled = await flagsService.getFlag('NEW_FEATURE');
    if (isNewFeatureEnabled) {
        // Execute new feature code
        console.log('New feature is enabled!');
        return true;
    }
    else {
        // Execute fallback code
        console.log('New feature is disabled. Using fallback.');
        return false;
    }
}
// You can also use feature flags in route handlers
async function exampleRouteHandler(req, res) {
    try {
        const isFeatureEnabled = await flagsService.getFlag('EXAMPLE_FEATURE');
        if (isFeatureEnabled) {
            // New implementation
            return res.json({ message: 'New feature enabled!' });
        }
        else {
            // Old implementation
            return res.json({ message: 'Using legacy implementation' });
        }
    }
    catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
}
//# sourceMappingURL=integration.js.map