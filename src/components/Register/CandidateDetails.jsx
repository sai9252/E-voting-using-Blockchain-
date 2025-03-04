import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { FaDownload, FaEye } from "react-icons/fa";

function UserDetails() {
    const [searchParams] = useSearchParams();
    const userId = searchParams.get("id");
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const formatDate = (date) => {
        const currentDate = new Date(date);

        const currentDayOfMonth = currentDate.getDate();
        const currentMonth = currentDate.getMonth(); // Be careful! January is 0, not 1
        const currentYear = currentDate.getFullYear();

        const dateString = currentDayOfMonth + "-" + (currentMonth + 1) + "-" + currentYear;
        // "27-11-2020"

        return dateString;
    };

    const fetchUserDetails = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            console.error('No token found');
            return;
        }
        try {
            const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    const handleDownload = async (filePath) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }
        
        try {
            // Extract the filename from the path using a more robust method
            // This will work with both forward and backward slashes
            const parts = filePath.split(/[/\\]/);
            const filename = parts[parts.length - 1];
            
            console.log("Attempting to download:", filename);
            
            const response = await axios.get(`http://localhost:5000/api/users/download/${filename}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                responseType: "blob",
            });

            // Create a download link
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            
            // Append, click, and clean up
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading file:", error);
            alert("Failed to download file. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center ">
            {user ? (
                <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg flex flex-col">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                        User Details
                    </h2>

                    {/* User Info */}
                    <div className="flex flex-col space-y-3 text-gray-700">
                        <p><strong>Name:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Phone:</strong> {user.phoneNumber}</p>
                        <p><strong>Aadhar Number:</strong> {user.aadhar}</p>
                        <p><strong>Date of Birth:</strong> {formatDate(user.dateOfBirth)}</p>
                        <p className="text-green-600 font-bold">
                                {user ? (user.verified === 1 ? "Verified ✅" : user.verified === -1 ? "Rejected ❌" : "Not Verified ❌") : "Loading..."}
                            </p>
                    </div>

                    {/* Downloadable & Viewable Documents */}
                    <div className="mt-6 flex flex-col space-y-4">
                        {user.aadharDocs && (
                            <div className="flex items-center space-x-3">
                                <span className="font-semibold">Aadhar Document:</span>
                                <button
                                    className="text-blue-500 hover:text-blue-700 flex items-center"
                                    onClick={() => handleDownload(user.aadharDocs)}
                                >
                                    <FaDownload className="mr-2" /> Download
                                </button>
                                <a
                                    href={`http://localhost:5000/${user.aadharDocs}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-500 hover:text-green-700 flex items-center"
                                >
                                    <FaEye className="mr-2" /> View
                                </a>
                            </div>
                        )}
                        {user.voterId && (
                            <div className="flex items-center space-x-3">
                                <span className="font-semibold">Voter ID:</span>
                                <button
                                    className="text-blue-500 hover:text-blue-700 flex items-center"
                                    onClick={() => handleDownload(user.voterId)}
                                >
                                    <FaDownload className="mr-2" /> Download
                                </button>
                                <a
                                    href={`http://localhost:5000/${user.voterId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-500 hover:text-green-700 flex items-center"
                                >
                                    <FaEye className="mr-2" /> View
                                </a>
                            </div>
                        )}
                    </div>

                    {/* OK Button */}
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => navigate("/admin-dashboard")}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                        >
                            OK
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-gray-700">Loading user details...</p>
            )}
        </div>
    );
}

export default UserDetails;