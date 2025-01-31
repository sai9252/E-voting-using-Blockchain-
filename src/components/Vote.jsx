import { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const Vote = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [votingMessage, setVotingMessage] = useState('');

    useEffect(() => {
        fetchCandidates();
        checkVotingStatus();
    }, []);

    const fetchCandidates = async () => {
        try {
            const response = await fetch('http://localhost:5000/get-candidates');
            if (response.ok) {
                const data = await response.json();
                setCandidates(data);
            } else {
                console.error('Failed to fetch candidates');
            }
        } catch (error) {
            console.error('Error fetching candidates:', error);
        }
    };

    const checkVotingStatus = async () => {
        if (!user) return;

        try {
            const response = await fetch(`http://localhost:5000/check-vote/${user.aadhar}`);
            if (response.ok) {
                const data = await response.json();
                setHasVoted(data.hasVoted);
            } else {
                console.error('Failed to check voting status');
            }
        } catch (error) {
            console.error('Error checking voting status:', error);
        }
    };

    const handleVote = async () => {
        if (!selectedCandidate) {
            alert('Please select a candidate');
            return;
        }

        if (hasVoted) {
            setVotingMessage('You have already voted');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidateId: selectedCandidate, aadhar: user.aadhar }),
            });

            const data = await response.json();

            if (response.ok) {
                setHasVoted(true);
                setVotingMessage(data.message);
                fetchCandidates(); // Refresh candidates to update votes
            } else {
                setVotingMessage(data.message);
            }
        } catch (error) {
            console.error('Error submitting vote:', error);
            setVotingMessage('Failed to submit vote');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-pink-500 to-orange-500 w-full">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Vote</h2>
                {hasVoted ? (
                    <div className="text-center text-gray-500">
                        <p>{votingMessage}</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <label htmlFor="candidate" className="block text-gray-700 font-bold mb-2">
                                Select a Candidate
                            </label>
                            <select
                                id="candidate"
                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                value={selectedCandidate}
                                onChange={(e) => setSelectedCandidate(e.target.value)}
                            >
                                <option value="">Select a candidate</option>
                                {candidates.map((candidate) => (
                                    <option key={candidate.id} value={candidate.id}>
                                        {candidate.name} ({candidate.party})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            className="w-full p-3 bg-green-500 text-white font-bold rounded hover:bg-green-600"
                            onClick={handleVote}
                        >
                            Vote
                        </button>
                        {votingMessage && <p className="mt-4 text-center text-gray-500">{votingMessage}</p>}
                    </>
                )}
            </div>
        </div>
    );
};

export default Vote;