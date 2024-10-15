const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();


router.post('/admindata', (req, res) => {
    const { name, password } = req.body;

    try {

        const admin = global.admindata.find(admin => admin.username === name);

        if (!admin) {
            return res.status(400).json({ success: false, message: 'Invalid username' });
        }


        if (admin.password !== password) {
            return res.status(400).json({ success: false, message: 'Invalid password' });
        }


        const payload = {
            admin: {
                id: admin._id, // Admin ID
                username: admin.username // Admin username
            }
        };

        // Generate JWT token, expires in 1 hour, using environment JWT_SECRET
        const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
        const authToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        // Return success response with token
        return res.json({ success: true, authToken });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// POST route to handle private key JWT signing
// router.post('/privatekey', (req, res) => {
//     try {
//         const userPrivateKey = req.body.privateKey; // Get private key from request
//         console.log("User Provided Private Key:", userPrivateKey); // Log the user input

//         // Fetch private key from global object (ensure this is initialized)
//         const storedPrivateKey = global.privatekey?.[0]?.key; // Safely access global private key
//         console.log("Stored Private Key:", storedPrivateKey); // Log the stored key

//         // Check if the private key is present
//         if (!storedPrivateKey) {
//             return res.status(400).json({ success: false, message: 'Private key not found in database' });
//         }

//         // Compare the keys (use trim() to avoid accidental whitespaces)
//         if (storedPrivateKey.trim() === userPrivateKey.trim()) {
//             // If private key matches, generate JWT token
//             const payload = {
//                 data: 'Some sensitive data'
//             };
//             const authToken = jwt.sign(payload, storedPrivateKey, { expiresIn: '2h' });

//             return res.json({ success: true, authToken });
//         } else {
//             // If keys do not match, return error
//             console.log("Key mismatch. User key and stored key are different."); // Log mismatch
//             return res.status(400).json({ success: false, message: 'Invalid private key' });
//         }

//     } catch (error) {
//         console.error("Error in private key route:", error.message);
//         res.status(500).send('Server error');
//     }
// });

module.exports = router;
