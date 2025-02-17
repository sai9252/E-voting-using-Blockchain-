import { useCallback, useContext, useEffect, useState } from 'react';
import { RiArrowLeftFill } from 'react-icons/ri';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const Vote = () => {
    const { user } = useContext(AuthContext);
    const { electionId } = useParams();
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [votingMessage, setVotingMessage] = useState('');
    const [loadingBack, setLoadingBack] = useState(false);

    const fetchCandidates = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:5000/get-candidates/${electionId}`);
            if (response.ok) {
                const data = await response.json();
                setCandidates(data);
            } else {
                console.error('Failed to fetch candidates');
            }
        } catch (error) {
            console.error('Error fetching candidates:', error);
        }
    }, [electionId]);

    const checkVotingStatus = useCallback(async () => {
        if (!user) return;
        try {
            const response = await fetch(`http://localhost:5000/check-vote/${user.aadhar}/${electionId}`);
            if (response.ok) {
                const data = await response.json();
                setHasVoted(data.hasVoted);
            } else {
                console.error('Failed to check voting status');
            }
        } catch (error) {
            console.error('Error checking voting status:', error);
        }
    }, [user, electionId]);

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
                body: JSON.stringify({ candidateId: selectedCandidate, aadhar: user.aadhar, electionId }),
            });

            const data = await response.json();

            if (response.ok) {
                setHasVoted(true);
                setVotingMessage(data.message);
            } else {
                setVotingMessage(data.message);
            }
        } catch (error) {
            console.error('Error submitting vote:', error);
            setVotingMessage('Failed to submit vote');
        }
    };

    const handleBack = () => {
        setLoadingBack(true);
        setTimeout(() => {
            navigate(`/user-dashboard?id=${user.userId}`);
        }, 1000);
    };

    useEffect(() => {
        const check = async () => {
            await checkVotingStatus();
            await fetchCandidates();
        };
        if (user) check();
    }, [user]);

    useEffect(() => {
        if (hasVoted == 0) {
            setVotingMessage('You have voted successfully');
        }

    }, [hasVoted]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 w-full">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex items-center mb-4">
                    <button onClick={handleBack} disabled={loadingBack} className="mr-3">
                        <div className={`h-8 w-8 flex items-center justify-center rounded-full shadow-2xs ${loadingBack ? 'bg-gray-400' : 'bg-gray-300'}`}>
                            {loadingBack ? (
                                <span className="animate-spin border-4 border-white border-t-transparent rounded-full h-6 w-6"></span>
                            ) : (
                                <RiArrowLeftFill size={24} color="black" />
                            )}
                        </div>
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">Vote</h2>
                </div>
                {hasVoted ? (
                    <div className="text-center text-gray-500">
                        <p>{votingMessage}</p>
                    </div>
                ) : (
                    <div>
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
                                {candidates.length > 0 ? (
                                    candidates.map((candidate) => (
                                        <option key={candidate.id} value={candidate.id}>
                                            {candidate.name} ({candidate.party})
                                        </option>
                                    ))
                                ) : (
                                    <option value="">No candidates available</option>
                                )}
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default Vote;
