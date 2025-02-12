import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

function UserDashboard() {
    const [searchParams] = useSearchParams();
    const userId = searchParams.get("id");
    const [users, setUsers] = useState(null);
    const [error, setError] = useState("");
    const [elections, setElections] = useState([]);

    useEffect(() => {
        fetchUserDetails();
        fetchElections();
    }, []);

    const formatDate = (date) => {
        if (!date) return "N/A";
        const currentDate = new Date(date);

        return currentDate.toLocaleString("en-IN")
    };

    const fetchUserDetails = async () => {
        const token = localStorage.getItem("token")
        try {
            console.log(userId)
            if (userId) {
                const response = await axios.get(`http://localhost:5000/users/${userId}`,{
                    headers:{
                        "Authorization":`Bearer ${token}`
                    }
                });
                console.log("Fetched User Data:", response); // Log user data
                setUsers({ ...response.data });
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
            setError(error?.response.data);
        }
    };
    

    const fetchElections = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/get-electionsInfo`);
            console.log(response.data);
            setElections(response.data);
        } catch (error) {
            console.error("Error fetching elections:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            {users ? (
                <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl flex flex-col">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                        User Dashboard
                    </h2>

                    {/* Election Details */}
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Elections</h3>
                        {elections.length > 0 ? (
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-gray-300 px-4 py-2">ID</th>
                                        <th className="border border-gray-300 px-4 py-2">Election Name</th>
                                        <th className="border border-gray-300 px-4 py-2">Start Date</th>
                                        <th className="border border-gray-300 px-4 py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {elections.map((election, index) => (
                                        <tr key={election.id} className="border border-gray-300">
                                            <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                                            <td className="border border-gray-300 px-4 py-2">{election.electionName}</td>
                                            <td className="border border-gray-300 px-4 py-2">{formatDate(election.start_datetime)}</td>
                                            <td className="border border-gray-300 px-4 py-2">
                                                <button
                                                    disabled={!users.verified}
                                                    onClick={() => console.log("Right to vote clicked for", election.electionName)}
                                                    className={`bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700 transition ${!users.verified ? 'cursor-not-allowed opacity-50' : ''}`}
                                                >
                                                    Click to Vote
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
                        <div className="flex flex-col space-y-3 text-gray-700">
                            <p><strong>Name:</strong> {users.name}</p>
                            <p><strong>Email:</strong> {users.email}</p>
                            <p><strong>Phone:</strong> {users.phoneNumber}</p>
                            <p><strong>Aadhar Number:</strong> {users.aadhar}</p>
                            <p><strong>Date of Birth:</strong> {formatDate(users.dateOfBirth)}</p>
                            <p className="text-green-600 font-bold">
                                {users.verified ? "Verified ✅" : "Not Verified ❌"}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                !error && <p className="text-gray-700">Loading user details...</p>
            )}
            {error && <p className="text-gray-700">{error}</p>}
        </div>
    );
}

export default UserDashboard;
