import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RiArrowLeftFill } from 'react-icons/ri';
import { AuthContext } from '../AuthContext';
import ElectionResultsGraph from './ElectionResultsGraph';

const Results = () => {
    const { user } = useContext(AuthContext) ?? {}; // Default empty object
    const { electionId } = useParams();
    const navigate = useNavigate(); // For navigation
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isPublished, setIsPublished] = useState(false);

    useEffect(() => {
        if (electionId) {
            fetchCandidates(electionId);
            checkIfResultsPublished(electionId);
        }
    }, [electionId]);

    const fetchCandidates = async (id) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/get-results/${id}`);
            if (response.ok) {
                const data = await response.json();
                setCandidates(data);
            } else {
                console.error('Failed to fetch-election-results');
            }
        } catch (error) {
            console.error('Error fetching election results:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkIfResultsPublished = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/check-results-published/${id}`);
            if (response.ok) {
                const data = await response.json();
                setIsPublished(data.isPublished);
            } else {
                console.error('Failed to check if results are published');
            }
        } catch (error) {
            console.error('Error checking if results are published:', error);
        }
    };

    // 🔹 Handle Back Button Click
    const handleBackClick = () => {
        setLoading(true); // Show loading before navigating
        setTimeout(() => {
            navigate(`/user-dashboard?id=${user.userId}`); // Navigate after a small delay
        }, 500); // 1-second delay for visibility
    };

    return (
        <div className="flex justify-center items-center  min-h-screen w-full">
            <div className="p-8 rounded-lg bg-white shadow-lg w-[60%]">

                {/* Back Button with Loading Effect */}
                {user && user.userId && (
                    <button onClick={handleBackClick} disabled={loading} className="flex items-center gap-2 bg-gray-300 px-3 py-2 rounded shadow hover:bg-gray-400 transition">
                        {loading ? (
                            <span className="animate-spin border-4 border-white border-t-transparent rounded-full h-6 w-6"></span>
                        ) : (
                            <RiArrowLeftFill size={24} color="black" />
                        )}
                    </button>
                )}

                <h2 className="text-2xl font-bold text-center mb-6">Election Results</h2>
                <br />
                {candidates && candidates.length>0 && <h2 className="text-2xl font-bold text-center mb-6 ">The Winner is <span className='text-green-500'>
                    {candidates[0].name} 
                    </span>
                    </h2>}

                {/* Show Loading Spinner */}
                {loading ? (
                    <div className="text-center text-lg font-bold py-6">Loading...</div>
                ) : (
                    <div className="mt-6">
                        {isPublished ? (
                            <div className='flex '>
                                <div className='w-[50%] flex flex-col justify-center items-center'>
                                    <h3 className="text-2xl font-bold mb-4">Candidates</h3>
                                    <div className="max-h-64 overflow-y-auto border rounded shadow-md w-full">
                                        {candidates.length > 0 ? (
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="border-b bg-gray-200">
                                                        <th className="p-3 text-left">SR</th>
                                                        <th className="p-3 text-left">Name</th>
                                                        <th className="p-3 text-left">Party</th>
                                                        <th className="p-3 text-left">Votes</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {candidates.map((candidate, index) => (
                                                        <tr key={candidate.id} className="border-b hover:bg-gray-100">
                                                            <td className="p-3">{index + 1}</td>
                                                            <td className="p-3">{candidate.name}</td>
                                                            <td className="p-3">{candidate.party}</td>
                                                            <td className="p-3 font-bold">{candidate.votes}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="p-4 text-center text-gray-500">
                                                No candidates for this election.
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className='w-[50%]'>
                                    {candidates && <ElectionResultsGraph data={candidates} />}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-lg font-bold py-6">Results are not published yet.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Results;