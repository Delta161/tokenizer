/**
 * Middleware to validate request body against a Zod schema
 */
export const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.body);
            req.body = validatedData;
            next();
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error
            });
        }
    };
};
/**
 * Middleware to validate request parameters against a Zod schema
 */
export const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.params);
            req.params = validatedData;
            next();
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error
            });
        }
    };
};
//# sourceMappingURL=flags.validation.js.map