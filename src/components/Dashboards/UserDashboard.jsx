import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import moment from "moment";
import "moment-timezone";

const convertToIndianTime = (datetime) => {
    return moment(datetime).tz('Asia/Kolkata').format('DD-MM-YYYY -- HH:mm A');
};



function UserDashboard() {
    const [searchParams] = useSearchParams();
    const userId = searchParams.get("id");
    const [users, setUsers] = useState(null);
    const [error, setError] = useState("");
    const [elections, setElections] = useState([]);
    const [loadingElectionId, setLoadingElectionId] = useState(null); // Track loading state for elections
    const [successMessage, setSuccessMessage] = useState(""); // New state for edit success message
    const profileUpdated = searchParams.get("profileUpdated"); // Check if edit was successful
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('loginSuccess') === 'true') {
            toast.success('Login successful');
        }
        if (queryParams.get('profileUpdated') === 'true') {
            setSuccessMessage("Profile edited successfully. Await verification.");
            setError("")
        }
        fetchUserDetails();
        fetchElections();
    }, [location.search, profileUpdated]);


    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString("en-IN");
    };

    const fetchUserDetails = async () => {
        const token = localStorage.getItem("token");
        try {
            if (userId) {
                const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setUsers({ ...response.data });
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
            setUsers({});
            setError(error?.response?.data);
        }
    };

    const fetchElections = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/get-electionsInfo`);
            setElections(response.data);
        } catch (error) {
            console.error("Error fetching elections:", error);
        }
    };

    // 🔹 Handle Vote Button Click
    const makeVote = (electionId) => {
        if (users && users.verified) {
            setLoadingElectionId(electionId); // Show loading for clicked election
            setTimeout(() => {
                navigate(`/vote/${electionId}`);
            }, 500); // 1-second delay for better UI
        } else {
            toast.warning("You must be verified to vote.");
        }
    };

    // 🔹 Handle Results Button Click
    const checkResults = (electionId) => {
        if (users && users.verified) {
            setLoadingElectionId(electionId); // Show loading for clicked election
            setTimeout(() => {
                navigate(`/results/${electionId}`);
            }, 500); // 1-second delay for better UI
        } else {
            toast.warning("You must be verified to vote.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <ToastContainer position="top-center" autoClose={2000} />
            {users ? (
                <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl flex flex-col">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                        Voter Dashboard
                    </h2>

                    {/* Election Details */}
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Elections</h3>
                        {elections.length > 0 ? (
                            <table className="w-full border-collapse border border-gray-300 shadow-md">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-gray-300 px-6 py-3 text-center">ID</th>
                                        <th className="border border-gray-300 px-6 py-3 text-center">Election Name</th>
                                        <th className="border border-gray-300 px-6 py-3 text-center">Start Date_time</th>
                                        <th className="border border-gray-300 px-6 py-3 text-center">End Date_time</th>
                                        <th className="border border-gray-300 px-6 py-3 text-center">Action</th>
                                        <th className="border border-gray-300 px-6 py-3 text-center">Results</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {elections.map((election, index) => (
                                        <tr key={election.id} className="border border-gray-300">
                                            <td className="border border-gray-300 px-6 py-2 text-center">{index + 1}</td>
                                            <td className="border border-gray-300 px-6 py-2 text-center">{election.electionName}</td>
                                            <td className="border border-gray-300 px-6 py-2 text-center">
                                                {convertToIndianTime(election.start_datetime)}
                                            </td>
                                            <td className="border border-gray-300 px-6 py-2 text-center">
                                                {convertToIndianTime(Math.floor((new Date(election.start_datetime).getTime() / 1000) + (3 * 60)) * 1000)}
                                            </td>
                                            <td className="border border-gray-300 px-6 py-2 text-center">
                                                {/* {console.log(convertToIndianTime(election.start_datetime)<convertToIndianTime(new Date().getTime()))} */}
                                                <button
                                                    disabled={!users.verified || loadingElectionId === election.id || convertToIndianTime(election.start_datetime) > convertToIndianTime(new Date().getTime())}
                                                    onClick={() => makeVote(election.id)}
                                                    className={`bg-green-500 text-white px-6 py-2 rounded-lg transition duration-200 ease-in-out ${!users.verified || loadingElectionId === election.id || convertToIndianTime(election.start_datetime) > convertToIndianTime(new Date().getTime())
                                                        ? 'cursor-not-allowed opacity-50'
                                                        : 'hover:bg-green-600 cursor-pointer'
                                                        }`}
                                                >
                                                    {loadingElectionId === election.id ? "Loading..." : "Vote"}
                                                </button>
                                            </td>
                                            <td className="border border-gray-300 px-6 py-2 text-center">
                                                <button
                                                    disabled={!users.verified || loadingElectionId === election.id || convertToIndianTime(election.start_datetime) > convertToIndianTime(new Date().getTime())}
                                                    onClick={() => checkResults(election.id)}
                                                    className={`bg-blue-500 text-white px-4 py-2 rounded-lg transition duration-200 ease-in-out ${!users.verified || loadingElectionId === election.id || convertToIndianTime(election.start_datetime) > convertToIndianTime(new Date().getTime())
                                                        ? 'cursor-not-allowed opacity-50'
                                                        : 'hover:bg-blue-600 cursor-pointer'
                                                        }`}
                                                >
                                                    {loadingElectionId === election.id ? "Loading..." : "Results"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-600">There were no elections.</p>
                        )}
                    </div>

                    {/* User Info */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">User Details</h3>
                        {successMessage ? (
                            <p className="text-green-600 font-bold text-center mb-4">{successMessage}</p>
                        ) : users.verified === -1 ? (
                            <p className="text-red-600 font-bold mb-4">
                                Your application has been rejected. Please update your profile with correct details for re-verification.
                            </p>
                        ) : null}
                        <div className="flex flex-col space-y-3 text-gray-700">
                            <p><strong>Name:</strong> {users.name}</p>
                            <p><strong>Email:</strong> {users.email}</p>
                            <p><strong>Phone:</strong> {users.phoneNumber}</p>
                            <p><strong>Aadhar Number:</strong> {users.aadhar}</p>
                            <p><strong>Date of Birth:</strong> {formatDate(users.dateOfBirth)}</p>
                            <p className="text-green-600 font-bold">
                                {users ? (users.verified === 1 ? "Verified ✅" : users.verified === -1 && !profileUpdated  ? "Rejected ❌" : "Not Verified ❌") : "Loading..."}
                            </p>

                        </div>
                        {users && users.verified === -1 && !profileUpdated && (
                            <button
                                onClick={() => navigate(`/edit-profile?id=${users.id}`)}
                                className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg transition duration-200 ease-in-out hover:bg-blue-600"
                            >
                                Edit Profile
                            </button>
                        )}

                    </div>
                </div >
            ) : (
                !error && <p className="text-gray-700">Loading user details...</p>
            )
            }
            {error && <p className="text-gray-700">{error}</p>}
        </div >
    );
}

export default UserDashboard;