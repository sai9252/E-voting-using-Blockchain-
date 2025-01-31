import express from 'express';
import mysql from 'mysql2/promise'; // Use mysql2/promise for async/await support
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Import jsonwebtoken

const app = express();
const port = 5000;

const JWT_SECRET = 'a'; // Replace with a strong secret key

// Middleware
app.use(cors());
app.use(bodyParser.json());

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

// Register Endpoint
app.post('/register', async (req, res) => {
    const { name, email, aadhar, password } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users (name, email, aadhar, password) VALUES (?, ?, ?, ?)';
        await db.query(query, [name, email, aadhar, hashedPassword]);

        res.status(201).json({ message: 'User registered successfully' });
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
            expiresIn: '1h', // Token expires in 1 hour
        });

        res.status(200).json({ message: 'Login successful', token,user: { name: user.name, email: user.email, role: 'VOTER', aadhar: user.aadhar } });
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

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});