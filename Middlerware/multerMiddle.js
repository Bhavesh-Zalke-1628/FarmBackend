import path from 'path';
import multer from 'multer';

// Set up storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Make sure this folder exists
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

// File filter for specific types
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".mp4"];

    if (!allowedExtensions.includes(ext)) {
        return cb(new Error("Unsupported file type"), false);
    }
    cb(null, true);
};

// Initialize multer upload
const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    },
    fileFilter,
});

export default upload;
