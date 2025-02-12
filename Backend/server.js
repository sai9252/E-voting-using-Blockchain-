import express from 'express';
import mysql from 'mysql2/promise'; // Use mysql2/promise for async/await support
import bodyParser from 'body-parser';
import cors from 'cors';
import twilio from 'twilio';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Import jsonwebtoken
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import mime from 'mime-types'; // Ensure you install it: npm install mime-types
import fs from 'fs';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = 5000;

const JWT_SECRET = 'a'; // Replace with a strong secret key

// Twilio Configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// const twilioClient = twilio(accountSid, authToken);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use('/uploads', express.static('uploads'));


// write jwt middleware
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};



// MySQL Connection
const connectToDatabase = async () => {
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root', // Replace with your MySQL username
            password: '0000', // Replace with your MySQL password
            database: 'e_voting',
        });
        
        console.log('Connected to MySQL database');
        await db.connect();
        return db;
    } catch (err) {
        console.error('Error connecting to MySQL:', err);
        throw err;
    }
};

const db = await connectToDatabase();

// Storage for uploaded files
const uploadDir = path.join(__dirname, "uploads");


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
app.post('/register', upload.fields([{ name: 'aadharDocs' }, { name: 'voterId' }]), async (req, res) => {
    const { name, email, aadhar, phoneNumber, password, dateOfBirth } = req.body;

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
app.post('/login', async (req, res) => {
    const { aadhar, password } = req.body;

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
app.post('/adminlogin', async (req, res) => {
    const { email, password } = req.body;

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
            expiresIn: '1h', // Token expires in 1 hour
        });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { name: admin.name, email: admin.email, role: 'ADMIN' },
        });

    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
});

// Candidate Routes

// POST a new candidate
app.post('/candidates', async (req, res) => {
    const { name, party } = req.body;

    try {
        const query = 'INSERT INTO candidates (name, party) VALUES (?, ?)';
        const [result] = await db.query(query, [name, party]);
        const newCandidate = {
            id: result.insertId,
            name,
            party,
        };
        res.status(201).json(newCandidate);
    } catch (err) {
        console.error('Error adding candidate:', err);
        res.status(500).json({ message: 'Failed to add candidate', error: err.message });
    }
});

// GET all candidates
app.get('/get-candidates', async (req, res) => {
    try {
        const query = 'SELECT * FROM candidates';
        const [results] = await db.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching candidates:', err);
        res.status(500).json({ message: 'Failed to fetch candidates', error: err.message });
    }
});


// DELETE a candidate by ID
app.delete('/delete-candidates/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM candidates WHERE id = ?';
        const [result] = await db.query(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Candidate not found' });
        }
        res.status(200).json({ message: 'Candidate deleted successfully' });
    } catch (err) {
        console.error('Error deleting candidate:', err);
        res.status(500).json({ message: 'Failed to delete candidate', error: err.message });
    }
});


// GET all candidates with votes
app.get('/get-result-candidates', async (req, res) => {
    try {
        const query = 'SELECT id, name, party, votes FROM candidates';
        const [results] = await db.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching candidates:', err);
        res.status(500).json({ message: 'Failed to fetch candidates', error: err.message });
    }
});

// POST a vote
app.post('/vote', async (req, res) => {
    const { candidateId, aadhar } = req.body;

    try {
        // Check if the user has already voted
        const checkVoteQuery = 'SELECT * FROM votes WHERE aadhar = ?';
        const [existingVotes] = await db.query(checkVoteQuery, [aadhar]);

        if (existingVotes.length > 0) {
            return res.status(400).json({ message: 'You have already voted' });
        }

        // Increment the candidate's votes
        const updateVotesQuery = 'UPDATE candidates SET votes = votes + 1 WHERE id = ?';
        const [updateResult] = await db.query(updateVotesQuery, [candidateId]);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        // Record the user's vote
        const insertVoteQuery = 'INSERT INTO votes (aadhar, candidate_id) VALUES (?, ?)';
        const [insertResult] = await db.query(insertVoteQuery, [aadhar, candidateId]);

        res.status(200).json({ message: 'Vote submitted successfully', insertResult });
    } catch (err) {
        console.error('Error submitting vote:', err);
        res.status(500).json({ message: 'Failed to submit vote', error: err.message });
    }
});

// GET check if a user has voted
app.get('/check-vote/:aadhar', async (req, res) => {
    const { aadhar } = req.params;

    try {
        const query = 'SELECT * FROM votes WHERE aadhar = ?';
        const [results] = await db.query(query, [aadhar]);

        const hasVoted = results.length > 0;
        res.status(200).json({ hasVoted });
    } catch (err) {
        console.error('Error checking voting status:', err);
        res.status(500).json({ message: 'Failed to check voting status', error: err.message });
    }
});

// OTP generation and verification
app.post('/send-otp', async (req, res) => {
    const { phoneNumber } = req.body;

    // Validate phoneNumber
    if (!phoneNumber) {
        return res.status(400).send({ message: 'Phone number is required' });
    }

    try {
        const [phoneRows] = await db.execute(
            'SELECT * FROM users WHERE phoneNumber = ?',
            [phoneNumber]
        );

        if (phoneRows.length > 0) {
            return res.status(400).send({ message: 'Phone number already registered' });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        await db.execute(
            'INSERT INTO otps (phone_number, otp) VALUES (?, ?)',
            [phoneNumber, otp]
        );

        // Send SMS
        await twilio(accountSid, authToken).messages.create({
            body: `Your OTP is ${otp}`,
            to: phoneNumber,
            from: twilioPhoneNumber,
        });

        res.status(200).send({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
    }
});

app.post('/verify-otp', async (req, res) => {
    const { phoneNumber, otp } = req.body;

    // Validate phoneNumber and otp
    if (!phoneNumber) {
        return res.status(400).send({ message: 'Phone number is required' });
    }
    if (!otp) {
        return res.status(400).send({ message: 'OTP is required' });
    }

    try {

        const [rows] = await db.execute(
            'SELECT otp FROM otps WHERE phone_number = ? ORDER BY created_at DESC LIMIT 1',
            [phoneNumber]
        );

        if (rows.length === 0) {
            return res.status(401).send({ message: 'No OTP found for this phone number' });
        }

        const storedOTP = rows[0].otp;

        if (otp === storedOTP) {
            res.status(200).send({ message: 'OTP verified successfully' });
        } else {
            res.status(401).send({ message: 'Invalid OTP' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
    }
});


// Get all users data
app.get('/users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user by id
app.get('/users/:id', authenticateJWT, async (req, res) => {
    // console.log(req.user)
    if(req.user.id != req.params.id){
        return res.status(403).send('Unauthorized');
    }
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).send('User not found');
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error.message);
        res.status(500).send('Error fetching user');
    }
});

// Verify a user
app.put('/users/:id/verify', async (req, res) => {
    try {
        const [result] = await db.query('UPDATE users SET verified = 1 WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Candidate not found' });
        }
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        res.json(rows[0]); // Return updated user data
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Route to list all files with secure download links
app.get('/files', async (req, res) => {
    console.log("Fetching file list...");

    if (!db.existsSync(uploadDir)) {
        return res.status(404).json({ message: "Uploads directory not found" });
    }

    const fileNames = await db.readdirSync(uploadDir);
    const files = fileNames.map(fileName => ({
        name: fileName,
        size: db.statSync(path.join(uploadDir, fileName)).size,
        downloadUrl: `${req.protocol}://${req.get('host')}/users/download/${encodeURIComponent(fileName)}`
    }));

    res.status(200).json(files);
});

// Route to download a file correctly
app.get('/users/download/:filename', (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(uploadDir, fileName);

    console.log(`Downloading file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
    }

    // Set correct content-type based on file extension
    const contentType = mime.lookup(filePath) || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Stream file to client
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
});

// Route to view files
// app.get("/users/view/:filename", (req, res) => {
//     console.log("Fetching file list...");

//     if (!fs.existsSync(uploadDir)) {
//         return res.status(404).json({ message: "Uploads directory not found" });
//     }

//     const fileNames = fs.readdirSync(uploadDir);
//     const files = fileNames.map(fileName => ({
//         name: fileName,
//         url: `${req.protocol}://${req.get('host')}/uploads/${fileName}`
//     }));

//     res.status(200).json(files);
// });

// API to get all elections
app.get('/get-electionsInfo', async (req, res) => {
    try {
        const sql = 'SELECT * FROM elections';
        const [results] = await db.query(sql);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching elections:', error);
        res.status(500).json({ message: error.message });
    }
});

// API to add a new election
app.post('/add-elections', async (req, res) => {
    try {
        const { electionName, start_datetime } = req.body;
        const sql = 'INSERT INTO elections (electionName, start_datetime) VALUES (?, ?)';
        const result = await db.query(sql, [electionName, start_datetime]);
        res.status(200).json({ message: 'Election added successfully', id: result.insertId });
    } catch (error) {
        console.error('Error adding election:', error);
        res.status(500).json({ message: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});