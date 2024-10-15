const express = require('express');
const { User, UploadImage } = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = 'qwertyuiopasdfghjklzxcvbnbnm'; 
const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Update the file size limit to 10 MB
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Increase to 10 MB
});

// Serve static files from the uploads directory
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Create User route
router.post('/createuser', [
    body('username')
        .isAlphanumeric().withMessage('Username must be alphanumeric')
        .isLength({ min: 2 }).withMessage('Username must be at least 2 characters long'),
    body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    }).optional({ checkFalsy: true }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let user = await User.findOne({ username: req.body.username });
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'Username already exists' }] });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        user = await User.create({
            username: req.body.username,
            password: hashedPassword
        });

        const data = { user: { id: user.id } };
        const authToken = jwt.sign(data, JWT_SECRET);

        res.json({ success: true, authToken: authToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Upload image route
router.post('/uploadimage', upload.array('images', 10), async (req, res) => {
    const { name, socialMediaUrl } = req.body;

    if (!name || name.length < 1) {
        return res.status(400).json({ error: 'Name must contain at least 1 character.' });
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No images were uploaded.' });
    }

    try {
        const imagePaths = req.files.map(file => file.path);

        const uploadImage = new UploadImage({
            name,
            socialMediaUrl,
            images: imagePaths,
        });

        await uploadImage.save();
        res.json({ success: true, message: 'Images uploaded successfully!', images: imagePaths });
    } catch (error) {
        console.error("Error uploading images:", error);
        res.status(500).json({ error: 'An error occurred while uploading images.' });
    }
});

// Get uploaded images route
router.get('/getimages', async (req, res) => {
    try {
        const uploadedImages = await UploadImage.find();
        const imagesData = uploadedImages.map(image => ({
            name: image.name,
            socialMediaUrl: image.socialMediaUrl,
            images: image.images // Assuming images is an array of paths
        }));
        res.json({ success: true, data: imagesData });
    } catch (error) {
        console.error("Error retrieving images:", error);
        res.status(500).json({ error: 'An error occurred while retrieving images.' });
    }
});

module.exports = { router };
