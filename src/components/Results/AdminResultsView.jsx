import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RiArrowLeftFill } from 'react-icons/ri';
import ElectionResultsGraph from './ElectionResultsGraph';

const AdminResultsView = () => {
    const { electionId } = useParams();
    const navigate = useNavigate(); // For navigation
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isPublished, setIsPublished] = useState(false);
    const [backLoading, setBackLoading] = useState(false); // Back button loading state


    useEffect(() => {
        if (electionId) {
            fetchCandidates(electionId);
            checkIfResultsPublished(electionId);
        }
    }, [electionId]);

    const fetchCandidates = async (id) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/admin-elections-results/${id}`);
            if (response.ok) {
                const data = await response.json();
                setCandidates(data);
            } else {
                console.error('Failed to fetch election results');
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

    const handlePublishResults = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/publish-results/${electionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isPublished: true }),
            });
            if (response.ok) {
                setIsPublished(true);
                navigate(`/admin-results-view/${electionId}`);
            } else {
                console.error('Failed to publish results');
            }
        } catch (error) {
            console.error('Error publishing results:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = () => {
        setBackLoading(true);
        setTimeout(() => {
            navigate(-1); // Navigate back
        }, 500);
    };

    return (
        <div className="flex justify-center items-center  min-h-screen w-full">
            <div className="p-8 rounded-lg bg-white shadow-lg w-full max-w-md">
                {/* Back Button with Loading Effect */}
                <button
                    onClick={handleBackClick}
                    disabled={backLoading}
                    className="flex items-center gap-2 bg-gray-300 px-3 py-2 rounded shadow hover:bg-gray-400 transition mb-4"
                >
                    {backLoading ? (
                        <span className="animate-spin border-4 border-white border-t-transparent rounded-full h-6 w-6"></span>
                    ) : (
                        <>
                            <RiArrowLeftFill size={24} color="black" />
                        </>
                    )}
                </button>

                <h2 className="text-2xl font-bold text-center mb-6">Election Results</h2>

                {/* Show Loading Spinner */}
                {loading ? (
                    <div className="text-center text-lg font-bold py-6">Loading...</div>
                ) : (
                    <div className="mt-6">
                        <h3 className="text-xl font-bold mb-4">Candidates</h3>
                        <div className="max-h-64 overflow-y-auto border rounded shadow-md">
                            {candidates.length > 0 ? (
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b bg-gray-200">
                                            <th className="p-3 text-left">#</th>
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
                )}

                {/* Publish Results Button */}
                {!isPublished && (
                    <button onClick={handlePublishResults} disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 transition mt-4">
                        {loading ? (
                            <span className="animate-spin border-4 border-white border-t-transparent rounded-full h-6 w-6"></span>
                        ) : (
                            'Publish Results'
                        )}
                    </button>
                )}

                {isPublished ? (
                    <p className="text-green-500 font-bold mt-4">Results have been published.</p>
                ):('')}
            </div>
            <div>
                {candidates && <ElectionResultsGraph data={candidates}/>}
            </div>
        </div>
    );
};

export default AdminResultsView;