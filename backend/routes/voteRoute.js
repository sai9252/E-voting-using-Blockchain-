const express = require('express');
const router = express.Router();
const connectToDatabase = require('../utils/dbConnect');




router.post('/vote', async (req, res) => {
    const { candidateId, aadhar, electionId } = req.body;
    const db = await connectToDatabase();


    try {
        // Check if the user has already voted
        // await connection.beginTransaction();
        const checkVoteQuery = 'SELECT * FROM votes WHERE aadhar = ? AND election_id = ?';
        const [existingVotes] = await db.query(checkVoteQuery, [aadhar, electionId]);

        if (existingVotes.length > 0) {
            // await electionId.rollback();
            return res.status(400).json({ message: 'You have already voted' });
        }

        // Increment the candidate's votes
        const updateVotesQuery = 'UPDATE candidates SET votes = votes + 1 WHERE id = ?';
        const [updateResult] = await db.query(updateVotesQuery, [candidateId]);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        // Record the user's vote
        const insertVoteQuery = 'INSERT INTO votes (aadhar, candidate_id, election_id) VALUES (?,?,?)';
        const [insertResult] = await db.query(insertVoteQuery, [aadhar, candidateId, electionId]);

        res.status(200).json({ message: 'Vote submitted successfully', insertResult });
    } catch (err) {
        console.error('Error submitting vote:', err);
        res.status(500).json({ message: 'Failed to submit vote', error: err.message });
    }
});

// GET check if a user has voted
router.get('/check-vote/:aadhar/:electionId', async (req, res) => {
    const db = await connectToDatabase();
    const { aadhar, electionId } = req.params;

    try {
        const query = 'SELECT * FROM votes WHERE aadhar = ? AND election_id = ?';
        const [results] = await db.query(query, [aadhar, electionId]);

        const hasVoted = results.length > 0;
        res.status(200).json({ hasVoted });
    } catch (err) {
        console.error('Error checking voting status:', err);
        res.status(500).json({ message: 'Failed to check voting status', error: err.message });
    }
});

module.exports = router;