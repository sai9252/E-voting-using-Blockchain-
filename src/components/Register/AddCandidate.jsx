import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTrashAlt } from 'react-icons/fa';
import { RiArrowLeftFill } from 'react-icons/ri'; // Importing Back Arrow Icon

const AddCandidate = () => {
    const { electionId } = useParams();
    const navigate = useNavigate(); // ✅ React Router navigation hook
    const [candidates, setCandidates] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        party: '',
    });
    const [loading, setLoading] = useState(false);
    const [backLoading, setBackLoading] = useState(false); // ✅ Back button loading state

    useEffect(() => {
        fetchCandidates();
    }, [electionId]);

    const fetchCandidates = async () => {
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
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value.toUpperCase() });
    };

    const handleAddCandidate = async () => {
        if (formData.name && formData.party) {
            setLoading(true);

            try {
                const response = await fetch(`http://localhost:5000/candidates/${electionId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                if (response.ok) {
                    const newCandidate = await response.json();
                    setCandidates([...candidates, newCandidate]);
                    setFormData({ name: '', party: '' });

                    window.location.reload();
                } else {
                    console.error('Failed to add candidate');
                }
            } catch (error) {
                console.error('Error adding candidate:', error);
            } finally {
                setLoading(false);
            }
        } else {
            alert('Please fill in both fields');
        }
    };

    const handleDeleteCandidate = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/delete-candidates/${electionId}/${id}`, {
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

    const handleBackClick = () => {
        setBackLoading(true);
        setTimeout(() => {
            navigate(-1); // ✅ Go back to the previous page
        }, 500); // Delay for smooth transition
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 w-full">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                
                {/* ✅ Back Button at the Top */}
                <button
                    onClick={handleBackClick}
                    disabled={backLoading}
                    className="flex items-center gap-2 mb-4 bg-gray-300 px-3 py-2 rounded shadow hover:bg-gray-400 transition"
                >
                    {backLoading ? (
                        <span className="animate-spin border-4 border-white border-t-transparent rounded-full h-6 w-6"></span>
                    ) : (
                        <>
                            <RiArrowLeftFill size={24} color="black" />
                        </>
                    )}
                </button>

                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Add Candidates</h2>
                <form className="space-y-4">
                    <input
                        type="text"
                        id="name"
                        placeholder="Candidate Name"
                        required
                        className="w-full p-3 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        id="party"
                        placeholder="Candidate Party"
                        required
                        className="w-full p-3 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                        value={formData.party}
                        onChange={handleChange}
                    />
                    
                    {/* ✅ Loader button for Adding Candidate */}
                    <button
                        type="button"
                        className="w-full p-3 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 flex items-center justify-center gap-2"
                        onClick={handleAddCandidate}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="animate-spin border-4 border-white border-t-transparent rounded-full h-6 w-6"></span>
                        ) : (
                            "Add Candidate"
                        )}
                    </button>
                </form>

                <div className="mt-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Candidates</h3>
                    <div className="max-h-64 overflow-y-auto border rounded">
                        {candidates.length > 0 ? (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-3 bg-gray-200 text-left">ID</th>
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
