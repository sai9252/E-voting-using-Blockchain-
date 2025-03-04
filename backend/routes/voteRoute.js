const express = require('express');
const router = express.Router();
const connectToDatabase = require('../utils/dbConnect');
const { initializeEthereum } = require("../utils/votingContract")


router.post('/vote', async (req, res) => {
    const { candidateId, aadhar, electionId } = req.body;
    const { votingContract } = await initializeEthereum();
    const db = await connectToDatabase();
    
    
    try {

        // Check if user has already voted on blockchain
        const hasVoted = await votingContract.checkVotingStatus(aadhar, electionId);
        if (hasVoted) {
            return res.status(400).json({ message: 'You have already voted' });
        }
        
        const currentTime = Math.floor(new Date().getTime() / 1000);

        // Submit vote to blockchain
        const tx = await votingContract.vote(electionId, candidateId, aadhar, currentTime);
        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt.transactionHash);

        
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
    const { votingContract } = await initializeEthereum();
    const { aadhar, electionId } = req.params;

    try {

        const hasVoted = await votingContract.checkVotingStatus(aadhar, electionId);
        if (hasVoted) {
            return res.status(400).json({ message: 'You have already voted' });
        }

        // res.status(200).json({ hasVoted });
        res.status(200).json({ "hasVoted":hasVoted });

    } catch (err) {
        console.error('Error checking voting status:', err);
        res.status(500).json({ message: 'Failed to check voting status', error: err.message });
    }
});

module.exports = router;