
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../utils/dbConnect');


// check - results - published
router.get('/check-results-published/:id', async (req, res) => {
    const db = await connectToDatabase();

    try {
        console.log(`Checking results for electionId: ${req.params.id}`);

        const sql = 'SELECT isPublished FROM elections WHERE id = ?';
        const [rows] = await db.query(sql, [req.params.id]);

        if (rows.length === 0) {
            console.log(`No election found for ID: ${req.params.id}`);
            return res.json({ isPublished: false });
        }

        console.log(`Election found: ${rows[0]}`);
        res.status(200).json({ isPublished: rows[0].isPublished });
    } catch (error) {
        console.error('Error checking if results are published:', error);
        res.status(500).json({ error: 'Failed to check publication status', details: error.message });
    }
});



// Publish results
router.post('/publish-results/:id', async (req, res) => {
    const db = await connectToDatabase();

    try {
        const { isPublished } = req.body;

        const [rows] = await db.query('SELECT * FROM elections WHERE id = ?', [req.params.id]);

        if (rows.length === 0) {
            res.status(500).json({ error: 'election id not found'});
            return
        } else {
            await db.query('UPDATE elections SET isPublished = ? WHERE id = ?', [isPublished, req.params.id]);
        }

        res.status(200).json({ message: 'Results published successfully' });
    } catch (err) {
        console.error('Error publishing results:', err);
        res.status(500).json({ error: 'Failed to publish results', details: err.message });
    }
});


// GET candidates and their votes for a specific election
router.get('/get-results/:electionId', async (req, res) => {
    const { electionId } = req.params;
    const db = await connectToDatabase();


    try {
        const query = 'SELECT id, name, party, votes FROM candidates WHERE election_id = ?';
        const [results] = await db.query(query, [electionId]);

        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching election results:', err);
        res.status(500).json({ message: 'Failed to fetch election results', error: err.message });
    }
});


module.exports = router;