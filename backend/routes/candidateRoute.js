const express = require('express');
const router = express.Router();
const connectToDatabase = require('../utils/dbConnect');



// Candidate Routes
router.post('/candidates/:electionId', async (req, res) => {
    const { name, party } = req.body;
    const { electionId } = req.params;
    const db = await connectToDatabase();

    try {
        const query = 'INSERT INTO candidates (name, party, election_id) VALUES (?, ?, ?)';
        const [result] = await db.query(query, [name, party, electionId]);

        res.status(201).json({
            id: result.insertId,
            name,
            party,
            election_id: electionId
        });
    } catch (err) {
        console.error('Error adding candidate:', err);
        res.status(500).json({ message: 'Failed to add candidate', error: err.message });
    }
});


// GET all candidates for a specific election
router.get('/get-candidates/:electionId', async (req, res) => {
    const { electionId } = req.params;
    const db = await connectToDatabase();


    try {
        const query = 'SELECT * FROM candidates WHERE election_id = ?';
        const [results] = await db.query(query, [electionId]);
        // const electionCandidates = candidates.filter(candidate => candidate.electionId === electionId);
        // res.json(electionCandidates);

        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching candidates:', err);
        res.status(500).json({ message: 'Failed to fetch candidates', error: err.message });
    }
});

//delete a candidate from a election
router.delete('/delete-candidates/:electionId/:id', async (req, res) => {
    const { electionId, id } = req.params;
    const db = await connectToDatabase();


    try {
        const query = 'DELETE FROM candidates WHERE id = ? AND election_id = ?';
        const [result] = await db.query(query, [id, electionId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Candidate not found' });
        }
        res.status(200).json({ message: 'Candidate deleted successfully' });
    } catch (err) {
        console.error('Error deleting candidate:', err);
        res.status(500).json({ message: 'Failed to delete candidate', error: err.message });
    }
});


module.exports = router;