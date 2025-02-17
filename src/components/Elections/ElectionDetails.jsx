import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import moment from 'moment';
import 'moment-timezone';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react'; // Lucide icon for a modern look

// Convert datetime to Indian timezone
const convertToIndianTime = (datetime) => {
    return moment(datetime).tz('Asia/Kolkata').format('DD-MM-YYYY -- HH:mm A');
};

const ElectionDetails = () => {
    const [elections, setElections] = useState([]);
    const [electionName, setElectionName] = useState('');
    const [startDatetime, setStartDatetime] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchElections = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/get-electionsInfo`);
            setElections(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching elections:", error);
            setError(error.message);
            setLoading(false);
        }
    };

    const navigate = useNavigate();

    const handleViewResults = (electionId) => {
        navigate(`/admin-results-view/${electionId}`);
    };

    const addElection = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`http://localhost:5000/add-elections`, {
                electionName,
                start_datetime: startDatetime
            });
            const newElection = {
                id: response.data.id,
                electionName,
                start_datetime: startDatetime
            };
            setElections([...elections, newElection]);
            setElectionName('');
            setStartDatetime('');
        } catch (error) {
            console.error("Error adding election:", error);
            setError(error.message);
        }
    };

    const deleteElection = async (id) => {
        if (!id) {
            console.error("Election ID is missing");
            return;
        }
        console.log("Deleting election with ID:", id);
        try {
            const response = await axios.delete(`http://localhost:5000/delete-election/${id}`);
            if (response.status === 200) {
                const updatedElections = elections.filter((election) => election.id !== id);
                setElections(updatedElections);
                alert("Election deleted successfully!");
                // Refresh or navigate away if needed
            }

        } catch (error) {
            console.error("Error deleting election:", error);
            if (error.response) {
                console.error("Server Response:", error.response.data);
            }
        }
    };

    useEffect(() => {
        fetchElections();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="max-w-4xl w-full p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold mb-6">Election Details</h1>
                {loading ? (
                    <p className="text-gray-600">Loading...</p>
                ) : error ? (
                    <p className="text-red-500">Error: {error}</p>
                ) : (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Current Elections</h2>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-3 text-left">ID</th>
                                    <th className="p-3 text-left">Election Name</th>
                                    <th className="p-3 text-left">Start Date and Time</th>
                                    <th className="p-3 text-left">Actions</th>
                                    <th className="p-3 text-left">Results</th>
                                </tr>
                            </thead>
                            <tbody>
                                {elections.map((election, index) => (
                                    <tr key={election.id} className="border-b border-gray-200">
                                        <td className="p-3">{index + 1}</td>
                                        <td className="p-3">{election.electionName}</td>
                                        <td className="p-3">{convertToIndianTime(election.start_datetime)}</td>
                                        <td className="p-3 flex items-center space-x-2">
                                            <Link
                                                to={`/add-candidates/${election.id}`}
                                                className="text-blue-500 hover:text-blue-700 focus:outline-none"
                                            >
                                                Add Candidates
                                            </Link>
                                            <button
                                                className="text-red-500 hover:text-red-700 focus:outline-none"
                                                onClick={() => deleteElection(election.id)}
                                            >
                                                <Trash2 size={20} /> {/* Modern trash icon */}
                                            </button>
                                        </td>
                                        <td><button onClick={()=>handleViewResults(election.id)} disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition">
                                                View Results
                                            </button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">Add New Election</h2>
                        <form onSubmit={addElection} className="space-y-4">
                            <div>
                                <label htmlFor="electionName" className="block text-sm font-medium text-gray-700">
                                    Election Name:
                                </label>
                                <input
                                    type="text"
                                    id="electionName"
                                    value={electionName}
                                    onChange={(e) => setElectionName(e.target.value)}
                                    required
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="startDatetime" className="block text-sm font-medium text-gray-700">
                                    Start Date and Time:
                                </label>
                                <input
                                    type="datetime-local"
                                    id="startDatetime"
                                    value={startDatetime}
                                    onChange={(e) => setStartDatetime(e.target.value)}
                                    required
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Add Election
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ElectionDetails;