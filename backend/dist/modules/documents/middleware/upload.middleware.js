import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
// Define the upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'documents');
// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
// Configure storage
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        // Generate a secure random filename with original extension
        const fileExtension = path.extname(file.originalname);
        const randomName = crypto.randomBytes(16).toString('hex');
        cb(null, `${randomName}${fileExtension}`);
    },
});
// File filter to restrict file types
const fileFilter = (_req, file, cb) => {
    // Accept only PDF and image files
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'));
    }
};
// Configure multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
/**
 * Middleware for handling single file uploads
 * @param fieldName - The name of the form field containing the file
 * @returns Multer middleware for single file upload
 */
export const singleFile = (fieldName) => upload.single(fieldName);
/**
 * Get the absolute path to an uploaded file
 * @param filename - The filename stored in the database
 * @returns The absolute path to the file
 */
export const getFilePath = (filename) => {
    return path.join(UPLOAD_DIR, filename);
};
/**
 * Sanitize a filename to prevent path traversal attacks
 * @param filename - The filename to sanitize
 * @returns Sanitized filename
 */
export const sanitizeFilename = (filename) => {
    return path.basename(filename);
};
//# sourceMappingURL=upload.middleware.js.map