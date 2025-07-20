import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class PropertyService {
    /**
     * Create a new property in the database
     * @param {Object} propertyData - The property data to create
     * @returns {Promise<Object>} The created property
     */
    static async createProperty(propertyData) {
        const { title, location, description, tokenSymbol, totalTokens, tokenPrice, expectedYield, imageUrl, clientId } = propertyData;
        // For now, create a temporary client if it doesn't exist
        // In production, this would be handled by proper authentication
        let client;
        try {
            client = await prisma.client.findUnique({
                where: { id: clientId }
            });
            if (!client) {
                // Create a temporary client for development
                const tempUser = await prisma.user.upsert({
                    where: { email: 'temp@example.com' },
                    update: {},
                    create: {
                        email: 'temp@example.com',
                        fullName: 'Temporary Client',
                        authProvider: 'temp',
                        providerId: 'temp-provider-id'
                    }
                });
                client = await prisma.client.upsert({
                    where: { id: clientId },
                    update: {},
                    create: {
                        id: clientId,
                        userId: tempUser.id,
                        companyName: 'Temporary Company',
                        contactName: 'Temp Contact',
                        email: 'temp@example.com',
                        country: 'Unknown',
                        address: 'Temporary Address',
                        city: 'Unknown'
                    }
                });
            }
        }
        catch (error) {
            console.error('Error handling client:', error);
            throw error;
        }
        // Create the property
        const property = await prisma.property.create({
            data: {
                title,
                description,
                location,
                country: 'Unknown', // Will be extracted from location in future
                city: location, // Simplified for now
                valuation: tokenPrice * totalTokens,
                currency: 'USD',
                expectedYield: expectedYield ? expectedYield / 100 : null, // Convert percentage to decimal
                totalTokens,
                tokenPrice,
                clientId: client.id,
                status: 'DRAFT'
            }
        });
        // Create associated token
        await prisma.token.create({
            data: {
                propertyId: property.id,
                name: `${title} Token`,
                symbol: tokenSymbol,
                decimals: 18,
                totalSupply: totalTokens
            }
        });
        return property;
    }
    /**
     * Check if a token symbol already exists
     * @param {string} tokenSymbol - The token symbol to check
     * @returns {Promise<boolean>} True if symbol exists, false otherwise
     */
    static async tokenSymbolExists(tokenSymbol) {
        const existingToken = await prisma.token.findFirst({
            where: {
                symbol: tokenSymbol
            }
        });
        return !!existingToken;
    }
    /**
     * Get property by ID
     * @param {string} propertyId - The property ID
     * @returns {Promise<Object|null>} The property or null if not found
     */
    static async getPropertyById(propertyId) {
        return await prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                tokens: true,
                client: {
                    include: {
                        user: true
                    }
                }
            }
        });
    }
}
//# sourceMappingURL=PropertyService.js.map