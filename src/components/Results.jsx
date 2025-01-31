import { useState, useEffect } from 'react';

const Results = () => {
    const [candidates, setCandidates] = useState([]);

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const response = await fetch('http://localhost:5000/get-result-candidates');
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

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-pink-500 to-orange-500 w-full">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Candidate Results</h2>
                <div className="mt-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Candidates</h3>
                    <div className="max-h-64 overflow-y-auto border rounded">
                        {candidates.length > 0 ? (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-3 bg-gray-200 text-left">#</th>
                                        <th className="p-3 bg-gray-200 text-left">Name</th>
                                        <th className="p-3 bg-gray-200 text-left">Party</th>
                                        <th className="p-3 bg-gray-200 text-left">Votes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidates.map((candidate, index) => (
                                        <tr key={candidate.id} className="border-b">
                                            <td className="p-3">{index + 1}</td>
                                            <td className="p-3">{candidate.name}</td>
                                            <td className="p-3">{candidate.party}</td>
                                            <td className="p-3">{candidate.votes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                No candidates yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Results;