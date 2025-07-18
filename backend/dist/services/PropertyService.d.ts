export class PropertyService {
    /**
     * Create a new property in the database
     * @param {Object} propertyData - The property data to create
     * @returns {Promise<Object>} The created property
     */
    static createProperty(propertyData: Object): Promise<Object>;
    /**
     * Check if a token symbol already exists
     * @param {string} tokenSymbol - The token symbol to check
     * @returns {Promise<boolean>} True if symbol exists, false otherwise
     */
    static tokenSymbolExists(tokenSymbol: string): Promise<boolean>;
    /**
     * Get property by ID
     * @param {string} propertyId - The property ID
     * @returns {Promise<Object|null>} The property or null if not found
     */
    static getPropertyById(propertyId: string): Promise<Object | null>;
}
//# sourceMappingURL=PropertyService.d.ts.map