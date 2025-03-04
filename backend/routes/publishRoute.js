const express = require('express');
const router = express.Router();
const connectToDatabase = require('../utils/dbConnect');
const { initializeEthereum } = require("../utils/votingContract")



// check - results - published
router.get('/check-results-published/:id', async (req, res) => {
    const { votingContract } = await initializeEthereum();
    try {
        const electionId = req.params.id;
        const election = await votingContract.elections(electionId);

        res.status(200).json({ isPublished: election.isPublished });
    } catch (error) {
        console.error('Error checking if results are published:', error);
        res.status(500).json({ error: 'Failed to check publication status', details: error.message });
    }
});



// Publish results
router.post('/publish-results/:id', async (req, res) => {
    const db = await connectToDatabase();
    const { votingContract } = await initializeEthereum();

    try {
        const electionId = req.params.id;
        const currentTime = Math.floor(new Date().getTime() / 1000);

        const tx = await votingContract.publishResults(electionId,currentTime);

        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt.transactionHash);



        const [rows] = await db.query('SELECT * FROM elections WHERE id = ?', [electionId]);

        if (rows.length === 0) {
            res.status(500).json({ error: 'election id not found' });
            return
        } else {
            await db.query('UPDATE elections SET isPublished = ? WHERE id = ?', [true, electionId]);
        }

        res.status(200).json({ message: 'Results published successfully' });
    } catch (err) {
        console.error('Error publishing results:', err);
        res.status(500).json({ error: 'Failed to publish results', details: err.message });
    }
});


// GET candidates and their votes for a specific election
router.get('/get-results/:electionId', async (req, res) => {
    const db = await connectToDatabase();
    const { votingContract } = await initializeEthereum();

    const { electionId } = req.params;

    try {
        // Get candidates from database
        const [candidates] = await db.query(
            'SELECT id,name, party FROM candidates WHERE election_id = ?',
            [electionId]
        );

        // Get vote counts from blockchain
        const partyVotes = {};
        for (const candidate of candidates) {
            const votes = await votingContract.getVoteCount(electionId, candidate.id);
            partyVotes[candidate.party] = (partyVotes[candidate.party] || 0) + Number(votes);
        }

        
        // Get total registered users from database
        // const [totalRegisteredUsersResult] = await db.query(
        //     'SELECT COUNT(*) as totalRegisteredUsers FROM users'
        // );
        // const totalRegisteredUsers = totalRegisteredUsersResult[0].totalRegisteredUsers;

        // // Format results
        // const formattedPartyVotes = Object.entries(partyVotes).map(([party, totalVotes]) => ({
        //     party,
        //     totalVotes
        // }));

        const result = []
        
        for (const candidate of candidates) {
        
            let c_party = candidate.party;
            let obj = {
                id:candidate.id,
                name:candidate.name,
                party:c_party,
                votes: partyVotes[c_party]
            }

            result.push(obj)
        }

        const sorted_result = result.sort((a,b)=>b.votes-a.votes)

        res.status(200).json(sorted_result);
    } catch (err) {
        console.error('Error fetching election results:', err);
        res.status(500).json({ message: 'Failed to fetch election results', error: err.message });
    }
});

router.get("/admin-elections-results/:electionId", async (request,response) => {
    const db = await connectToDatabase();

    const {electionId} = request.params;
    try {
        
        const [candidates] = await db.query(
            'SELECT id,name,party FROM candidates WHERE election_id = ?',
            [electionId]
        );

        // Get vote counts from blockchain
        const partyVotes = {};
        for (const candidate of candidates) {

            const [votes] = await db.query(
                "SELECT COUNT(*) as count from votes where election_id = ? and candidate_id = ?",
                [electionId,candidate.id]
            ) 
            // [{"count":<value>}]
            partyVotes[candidate.party] = (partyVotes[candidate.party] || 0) + Number(votes[0].count);
        }

        // partyVotes = {"TDP":3,"YCP":3,...}

        // // Get vote counts from blockchain
        // const partyVotes = {};
        // for (const candidate of candidates) {
            //     const [votes] = await db.query(
                //         "SELECT * from votes where election_id = ? and candidate_id = ?"
        //     ) // [{},{},{}]
        //     partyVotes[candidate.party] = (partyVotes[candidate.party] || 0) + Number(votes.length);
        // }
        
        const res = []
        
        for (const candidate of candidates) {
        
            let c_party = candidate.party;
            let obj = {
                id:candidate.id,
                name:candidate.name,
                party:c_party,
                votes: partyVotes[c_party]
            }

            res.push(obj)
        }

        return response.json(res)

        /**
         [
        {
        name:"",
        id:"",
        party:"",
        votes:0 
        }
         ] 
         */


    } catch (error) {
        console.error(error)
        response.status(500).json({message:error?.message})
    }
})

module.exports = router;