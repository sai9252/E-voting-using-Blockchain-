import { useState, useEffect } from 'react';
import { FaTrashAlt } from 'react-icons/fa'; // Import the trash icon from react-icons

const AddCandidate = () => {
    const [candidates, setCandidates] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        party: '',
    });

    useEffect(() => {
        fetchCandidates();
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleAddCandidate = async () => {
        if (formData.name && formData.party) {
            try {
                const response = await fetch('http://localhost:5000/candidates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                if (response.ok) {
                    const newCandidate = await response.json();
                    setCandidates([...candidates, newCandidate]);
                    setFormData({ name: '', party: '' });
                } else {
                    console.error('Failed to add candidate');
                }
            } catch (error) {
                console.error('Error adding candidate:', error);
            }
        } else {
            alert('Please fill in both fields');
        }
    };

    const handleDeleteCandidate = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/delete-candidates/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                const updatedCandidates = candidates.filter(candidate => candidate.id !== id);
                setCandidates(updatedCandidates);
            } else {
                console.error('Failed to delete candidate');
            }
        } catch (error) {
            console.error('Error deleting candidate:', error);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-pink-500 to-orange-500 w-full">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Add Candidate</h2>
                <form className="space-y-4">
                    <input
                        type="text"
                        id="name"
                        placeholder="Candidate Name"
                        required
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        id="party"
                        placeholder="Candidate Party"
                        required
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        value={formData.party}
                        onChange={handleChange}
                    />
                    <button
                        type="button"
                        className="w-full p-3 bg-pink-500 text-white font-bold rounded hover:bg-pink-600"
                        onClick={handleAddCandidate}
                    >
                        Add Candidate
                    </button>
                </form>
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
                                        <th className="p-3 bg-gray-200 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidates.map((candidate, index) => (
                                        <tr key={candidate.id} className="border-b">
                                            <td className="p-3">{index + 1}</td>
                                            <td className="p-3">{candidate.name}</td>
                                            <td className="p-3">{candidate.party}</td>
                                            <td className="p-3 text-red-500 cursor-pointer">
                                                <FaTrashAlt onClick={() => handleDeleteCandidate(candidate.id)} />
                                            </td>
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

export default AddCandidate;