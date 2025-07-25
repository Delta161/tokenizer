/**
 * Example of using Feature Flags in a real-world scenario
 */

import { Router } from 'express';
import { Request, Response } from 'express';
import { AnalyticsFlagsService } from '../analytics/index.js';
import { authGuard } from '../../middleware/auth.middleware';

const router = Router();

// Initialize the flags service
const flagsService = new AnalyticsFlagsService();

// Example route that uses feature flags to conditionally enable functionality
router.get('/example-feature', authGuard, async (req: Request, res: Response) => {
  try {
    // Check if the feature flag is enabled
    const isNewFeatureEnabled = await flagsService.getFlag('NEW_EXAMPLE_FEATURE');
    
    if (isNewFeatureEnabled) {
      // New implementation with enhanced functionality
      return res.json({
        message: 'You are using the new enhanced feature!',
        data: {
          enhancedField1: 'This field is only available in the new version',
          enhancedField2: 'Another new field',
          timestamp: new Date().toISOString(),
        }
      });
    } else {
      // Legacy implementation
      return res.json({
        message: 'You are using the legacy feature',
        data: {
          timestamp: new Date().toISOString(),
        }
      });
    }
  } catch (error) {
    console.error('Error in example feature:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Example of using feature flags for A/B testing
router.get('/ab-test', authGuard, async (req: Request, res: Response) => {
  try {
    // Check which variant the user should see
    const showVariantB = await flagsService.getFlag('AB_TEST_VARIANT_B');
    
    if (showVariantB) {
      // Variant B (new design or functionality)
      return res.json({
        variant: 'B',
        message: 'You are seeing variant B of this feature',
        data: {
          // Variant B specific data
          newDesign: true,
          enhancedFeatures: ['feature1', 'feature2'],
        }
      });
    } else {
      // Variant A (control group)
      return res.json({
        variant: 'A',
        message: 'You are seeing variant A of this feature',
        data: {
          // Variant A specific data
          standardFeatures: ['feature1'],
        }
      });
    }
  } catch (error) {
    console.error('Error in A/B test:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Example of using feature flags for gradual rollout
router.get('/gradual-rollout', authGuard, async (req: Request, res: Response) => {
  try {
    // The user ID from the authenticated request
    const userId = req.user.id;
    
    // Check if this user should see the new feature
    // In a real implementation, you might have multiple flags for different user segments
    const enableForUserSegment = await flagsService.getFlag('ROLLOUT_USER_SEGMENT_' + (userId % 10));
    
    if (enableForUserSegment) {
      return res.json({
        message: 'You have access to the gradually rolled out feature',
        access: true,
        rolloutGroup: userId % 10,
      });
    } else {
      return res.json({
        message: 'This feature is not yet available for your account',
        access: false,
        rolloutGroup: userId % 10,
      });
    }
  } catch (error) {
    console.error('Error in gradual rollout:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
