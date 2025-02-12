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
        try {
            const response = await axios.get(`http://localhost:5000/users/${userId}`);
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    const handleDownload = async (filename) => {
        console.log(filename.split("\\")[1])
        filename = filename.split("\\")[1]
        try {
            const response = await axios.get(`http://localhost:5000/users/download/${filename}`, {
                responseType: "blob",
            });

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
                            {user.verified ? "Verified ✅" : "Not Verified ❌"}
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