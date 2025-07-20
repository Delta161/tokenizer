import { PropertyService } from '../services/PropertyService.js';
/**
 * Create a new property
 * POST /api/properties/create
 */
export async function createProperty(req, res) {
    try {
        // Extract and validate request body
        const { projectTitle, location, description, tokenSymbol, totalTokens, pricePerToken, expectedYield, projectImage } = req.body;
        // Basic validation
        const errors = {};
        if (!projectTitle?.trim()) {
            errors.projectTitle = ['Project title is required'];
        }
        if (!location?.trim()) {
            errors.location = ['Location is required'];
        }
        if (!description?.trim()) {
            errors.description = ['Description is required'];
        }
        if (!tokenSymbol?.trim()) {
            errors.tokenSymbol = ['Token symbol is required'];
        }
        else if (!/^[A-Z]{2,10}$/.test(tokenSymbol)) {
            errors.tokenSymbol = ['Token symbol must be 2-10 uppercase letters'];
        }
        if (!totalTokens || totalTokens <= 0) {
            errors.totalTokens = ['Total tokens must be greater than 0'];
        }
        if (!pricePerToken || pricePerToken <= 0) {
            errors.pricePerToken = ['Price per token must be greater than 0'];
        }
        if (expectedYield !== undefined && (expectedYield < 0 || expectedYield > 100)) {
            errors.expectedYield = ['Expected yield must be between 0 and 100'];
        }
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }
        // For now, use a hardcoded clientId (will be replaced with auth later)
        const clientId = 'temp-client-id';
        // Prepare data for service
        const propertyData = {
            title: projectTitle,
            location,
            description,
            tokenSymbol,
            totalTokens: parseInt(totalTokens),
            tokenPrice: parseFloat(pricePerToken),
            expectedYield: expectedYield ? parseFloat(expectedYield) : null,
            imageUrl: projectImage || null,
            clientId
        };
        // Create property via service
        const property = await PropertyService.createProperty(propertyData);
        res.status(201).json({
            success: true,
            data: {
                id: property.id,
                title: property.title,
                location: property.location,
                tokenSymbol: property.tokenSymbol || tokenSymbol,
                status: property.status
            },
            message: 'Property created successfully'
        });
    }
    catch (error) {
        console.error('Error creating property:', error);
        // Handle unique constraint violations (e.g., duplicate token symbol)
        if (error.code === 'P2002') {
            return res.status(409).json({
                success: false,
                message: 'Token symbol already exists',
                errors: {
                    tokenSymbol: ['This token symbol is already in use']
                }
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errors: {
                general: ['An unexpected error occurred']
            }
        });
    }
}
//# sourceMappingURL=propertyController.js.map