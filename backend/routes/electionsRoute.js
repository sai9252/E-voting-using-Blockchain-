
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../utils/dbConnect');

const { initializeEthereum } = require("../utils/votingContract")

router.get('/get-electionsInfo', async (req, res) => {
    const db = await connectToDatabase();
    try {
        const sql = 'SELECT * FROM elections';
        const [results] = await db.query(sql);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching elections:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});


// API to add a new election
router.post('/add-elections', async (req, res) => {
    const db = await connectToDatabase();

    try {
        const { electionName, start_datetime } = req.body;

        if (!electionName || !start_datetime) {
            return res.status(400).json({ message: 'Both electionName and start_datetime are required' });
        }
        const startTime = Math.floor(new Date(start_datetime).getTime() / 1000);
        const endTime = startTime + ( 3 * 60); // 7 days duration
        
        const sql = 'INSERT INTO elections (electionName, start_datetime) VALUES (?, ?)';
        const [result] = await db.query(sql, [electionName, start_datetime]);
        const electionId = result.insertId;


        // Initialize Ethereum connection
        const { votingContract } = await initializeEthereum();

        // Create election on blockchain
        console.log(`Creating election with ID: ${electionId}, Start: ${startTime}, End: ${endTime}`);
        const tx = await votingContract.createElection(
            electionId,
            startTime,
            endTime
        );

        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt.transactionHash);

        res.status(201).json({
            message: 'Election added successfully',
            id: electionId,
            transactionHash: receipt.transactionHash
        });
    } catch (error) {
        console.error('Error adding election:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// API to delete an election
router.delete('/delete-election/:id', async (req, res) => {
    const db = await connectToDatabase();

    const { id } = req.params;

    try {
        const query = 'DELETE FROM elections WHERE id = ?';
        const [result] = await db.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Election not found' });
        }

        res.status(200).json({ message: 'Election deleted successfully' });
    } catch (err) {
        console.error('Error deleting election:', err);
        res.status(500).json({ message: 'Failed to delete election', error: err.message });
    }
});




module.exports = router;