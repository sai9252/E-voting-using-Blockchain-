
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../utils/dbConnect');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');



const JWT_SECRET = 'a';


// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Store files in "uploads" directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
        if (allowedExtensions.includes(path.extname(file.originalname).toLowerCase())) {
            cb(null, true);
        } else {
            cb(new Error('Only .pdf, .jpg, .jpeg, .png files are allowed!'));
        }
    }
});


// Register Endpoint
router.post('/register', upload.fields([{ name: 'aadharDocs' }, { name: 'voterId' }]), async (req, res) => {
    const { name, email, aadhar, phoneNumber, password, dateOfBirth } = req.body;
    const db = await connectToDatabase();


    // console.log('req.files:', req.files);
    // File paths from multer
    const aadharDocs = req.files['aadharDocs'] ? req.files['aadharDocs'][0].path : null;
    console.log(aadharDocs)
    const voterId = req.files['voterId'] ? req.files['voterId'][0].path : null;

    if (!name || !email || !aadhar || !password || !dateOfBirth || !phoneNumber || !aadharDocs || !voterId) {
        return res.status(400).send({ message: 'All fields are required' });
    }

    try {

        // Check if email already exists
        const [emailRows] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        console.log("hello", emailRows);

        if (emailRows.length > 0) {
            return res.status(400).send({ message: 'Email already registered' });
        }

        //Check if phone number already exists
        const [phoneNumberRows] = await db.execute(
            'SELECT * FROM users WHERE phoneNumber = ?',
            [phoneNumber]
        );

        if (phoneNumberRows.length > 0) {
            return res.status(400).send({ message: 'Phone number already registered' });
        }

        // Check if Aadhar number already exists
        const [aadharRows] = await db.execute(
            'SELECT * FROM users WHERE aadhar = ?',
            [aadhar]
        );

        if (aadharRows.length > 0) {
            return res.status(400).send({ message: 'Aadhar number already registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `INSERT INTO users (name, email, aadhar, phoneNumber, password, dateOfBirth, aadharDocs, voterId) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        await db.query(query, [name, email, aadhar, phoneNumber, hashedPassword, dateOfBirth, aadharDocs, voterId]);

        res.status(200).json({ message: 'User registered successfully' });
        } catch (err) {
            console.error('Error registering user:', err);
            res.status(500).json({ message: 'Registration failed', error: err.message });
        }
    });


// Login Endpoint
router.post('/login', async (req, res) => {
    const { aadhar, password } = req.body;
    const db = await connectToDatabase();


    try {
        const query = 'SELECT * FROM users WHERE aadhar = ?';
        const [results] = await db.query(query, [aadhar]);

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid Aadhar or password' });
        }

        const user = results[0];

        // Compare hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid Aadhar or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, role: 'VOTER' }, JWT_SECRET, {
            expiresIn: '7d', // Token expires in 1 hour
        });

        res.status(200).json({ message: 'Login successful', token, user: { userId: user.id, name: user.name, email: user.email, role: 'VOTER', aadhar: user.aadhar } });
        } catch (err) {
            console.error('Error logging in:', err);
            res.status(500).json({ message: 'Login failed', error: err.message });
        }
    });

// Admin Login Endpoint
router.post('/adminlogin', async (req, res) => {
    const { email, password } = req.body;
    const db = await connectToDatabase();


    try {
        const query = 'SELECT * FROM admin WHERE email = ?';
        const [results] = await db.query(query, [email]);

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid Email or password' });
        }

        const admin = results[0];
        // console.log('Admin hashpassword type:', typeof admin.hashpassword);
        // console.log('Admin :', admin.hashpassword);

        // Compare hashed password
        const isPasswordValid = await bcrypt.compare(password, admin.hashpassword);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid Email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: admin.id, role: 'ADMIN' }, JWT_SECRET, {
            expiresIn: '7d', // Token expires in 7 days
        });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { adminId: admin.id, name: admin.name, email: admin.email, role: 'ADMIN' },
        });

    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
});

module.exports = router;