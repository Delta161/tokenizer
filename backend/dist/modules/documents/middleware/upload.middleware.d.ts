/**
 * Middleware for handling single file uploads
 * @param fieldName - The name of the form field containing the file
 * @returns Multer middleware for single file upload
 */
export declare const singleFile: (fieldName: string) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Get the absolute path to an uploaded file
 * @param filename - The filename stored in the database
 * @returns The absolute path to the file
 */
export declare const getFilePath: (filename: string) => string;
/**
 * Sanitize a filename to prevent path traversal attacks
 * @param filename - The filename to sanitize
 * @returns Sanitized filename
 */
export declare const sanitizeFilename: (filename: string) => string;
//# sourceMappingURL=upload.middleware.d.ts.map