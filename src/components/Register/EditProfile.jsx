import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

function EditProfile() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const userId = queryParams.get("id");
    const [user, setUser] = useState({
        name: "",
        email: "",
        aadhar: "",
        dateOfBirth: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [aadharDocs, setAadharDocs] = useState(null);
    const [voterId, setVoterId] = useState(null);

    useEffect(() => {
        
        fetchUserDetails();
    }, [userId]);
    
    const token = localStorage.getItem("token");
    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user details:", error);
            setError(error?.response?.data?.message || "Failed to fetch user details");
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({
            ...prevUser,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'aadharDocs') {
            setAadharDocs(files[0]);
        } else if (name === 'voterId') {
            setVoterId(files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append('name', user.name);
        formData.append('email', user.email);
        formData.append('aadhar', user.aadhar);
        formData.append('dateOfBirth', new Date(user.dateOfBirth).toISOString().split('T')[0]);
        if (aadharDocs) formData.append('aadharDocs', aadharDocs);
        if (voterId) formData.append('voterId', voterId);

        // Reset verification status to pending (0)
        formData.append('verified', 0);
    
        // Log the request body
        for (let key of formData.entries()) {
            console.log(key[0] + ': ' + key[1]);
        }
    
        try {
            await axios.put(`http://localhost:5000/api/users/update/${userId}`, formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                }
            });
            toast.success("Profile updated successfully, awaiting verification");
            navigate(`/user-dashboard?id=${userId}&profileUpdated=true`);

        } catch (error) {
            console.error("Error updating profile:", error);
            setError(error?.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
        
    };

    if (!user) return <p>Loading...</p>;

    return (
        <div className="min-h-screen flex items-center justify-center">
            <ToastContainer position="top-center" autoClose={2000} />
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                    Edit Profile
                </h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="name"
                            type="text"
                            name="name"
                            value={user.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="email"
                            type="email"
                            name="email"
                            value={user.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="aadhar">
                            Aadhar Number
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="aadhar"
                            type="text"
                            name="aadhar"
                            value={user.aadhar}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateOfBirth">
                            Date of Birth
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="dateOfBirth"
                            type="date"
                            name="dateOfBirth"
                            value={user.dateOfBirth.split('T')[0]}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="aadharDocs">
                            Aadhar Document
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="aadharDocs"
                            type="file"
                            name="aadharDocs"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="voterId">
                            Voter ID Document
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="voterId"
                            type="file"
                            name="voterId"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="flex items-center justify-center">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-6 py-2 rounded transition duration-200 ease-in-out hover:bg-blue-600"
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update Profile"}
                        </button>
                    </div>
                </form>
            </div>
            {error && <p className="text-gray-700">{error}</p>}
        </div>
    );
}

export default EditProfile;