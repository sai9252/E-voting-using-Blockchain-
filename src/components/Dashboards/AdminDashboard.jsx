import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminDashboard() {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [error, setError] = useState('')
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('adminLoginSuccess') === 'true') {
            toast.success('Admin Login successful');
        }
        fetchCandidates();
    }, [location.search]);


    const fetchCandidates = async () => {
        setLoading(true);
        const token = localStorage.getItem("token")
        // wait for 2 seconds
        try {
            const response = await axios.get("http://localhost:5000/api/users", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            setCandidates(response.data);
        } catch (error) {
            console.error("Error fetching candidates:", error);
            setError(error?.response.data);
        }
        finally {
            // setTimeout(() => {
            setLoading(false);
            // }, 2000);
        }
    };

    const confirmVerification = (candidate) => {
        setSelectedCandidate(candidate);
        setShowModal(true);
    };

    const verifyCandidate = async () => {
        if (!selectedCandidate) return;

        try {

            await axios.put(`http://localhost:5000/api/users/${selectedCandidate.id}/verify`);
            setCandidates((prevCandidates) =>
                prevCandidates.map((c) =>
                    c.id === selectedCandidate.id ? { ...c, verified: 1 } : c
                )
            );
            toast.success("User Verified Successfully")
            setShowModal(false);
        } catch (error) {
            console.error("Error verifying candidate:", error);
        }
    };
    const rejectCandidate = async () => {
        if (!selectedCandidate) return;

        try {
            await axios.put(`http://localhost:5000/api/users/${selectedCandidate.id}/reject`);
            setCandidates((prevCandidates) =>
                prevCandidates.map((c) =>
                    c.id === selectedCandidate.id ? { ...c, verified: -1 } : c // Assuming -1 represents rejected
                )
            );
            toast.success("User Rejected Successfully");
            setShowModal(false);
        } catch (error) {
            console.error("Error rejecting candidate:", error);
            toast.error("Failed to reject user");
        }
    };

    return (
        <div className="min-h-screen flex justify-center p-10">
            <ToastContainer position="top-center" autoClose={2000} />
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-4xl">
                <h2 className="text-2xl font-bold text-center mb-4 border-b-2 text-gray-800">Voters List</h2>

                {candidates.length ? (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700">
                                <th className="py-2 px-4">Name</th>
                                <th className="py-2 px-4">Phone Number</th>
                                <th className="py-2 px-4">Actions</th>
                                <th className="py-2 px-4">Verified</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.map((candidate) => (
                                <tr key={candidate.id} className="border-b">
                                    <td className="py-2 px-4 text-center">{candidate.name}</td>
                                    <td className="py-2 px-4 text-center">{candidate.phoneNumber}</td>
                                    <td className="py-2 px-4 text-center">
                                        <button
                                            onClick={() => navigate(`/candidate-details?id=${candidate.id}`)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                                        >
                                            Show Details
                                        </button>
                                    </td>
                                    <td className="py-2 px-4 text-center">
                                        {candidate.verified === 1 ? (
                                            <span className="text-green-600 font-bold">Verified ✅</span>
                                        ) : candidate.verified === -1 ? (
                                            <span className="text-red-600 font-bold">Rejected ❌</span>
                                        ) :(
                                            <button
                                                onClick={() => confirmVerification(candidate)}
                                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                                            >
                                                Verify
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
                    : (
                        loading ? <p className="text-gray-700 flex items-center justify-center text-2xl">Loading ...</p>
                            : <p className="text-gray-700 flex items-center mt-60 justify-center text-2xl">No Candidates Registered</p>
                    )}
            </div>

            {showModal && selectedCandidate && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
                        <h3 className="text-lg font-semibold mb-4">Confirm Verification</h3>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to verify <strong>{selectedCandidate.name}</strong>?
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={verifyCandidate}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                            >
                                Verify
                            </button>
                            <button
                                onClick={rejectCandidate}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {error && <p className="text-gray-700">{error}</p>}
        </div>
    );
}

export default AdminDashboard;