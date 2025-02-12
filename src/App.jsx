import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './components/Login/Login';
import Navbar from './components/Navbar/Navbar';
import Register from './components/Register/Register';
import AdminLogin from './components/Login/AdminLogin';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AddCandidate from './components/Register/AddCandidate';
import Results from './components/Results';
import Vote from './components/Vote';
import AdminDashboard from './components/Dashboards/AdminDashboard';
import CandidateDetails from './components/CandidateDetails';
import UserDashboard from './components/Dashboards/UserDashboard';


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/add-candidates" element={<AddCandidate />} />
            {/* <Route path="/Results" element={<Results />} /> */}
          </Route>
            <Route path="/vote" element={<Vote />} />
            <Route path="/Results" element={<Results />} />
            <Route path="/candidate-details" element={<CandidateDetails />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;