const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const connectToDatabase = require('../utils/dbConnect');

const JWT_SECRET = 'a'

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

// Get all users data
router.get('/users', authenticateJWT, async (req, res) => {
    const db = await connectToDatabase();

    try {
        const [rows] = await db.query('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user by id
router.get('/users/:id', authenticateJWT, async (req, res) => {
    const db = await connectToDatabase();

    // console.log(req.user)
    if (req.user.id !== req.params.id) {
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
router.put('/users/:id/verify', async (req, res) => {
    const db = await connectToDatabase();

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

module.exports = router;