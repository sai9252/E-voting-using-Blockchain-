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


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/register" element={<Register />} />
            <Route path="/add-candidates" element={<AddCandidate />} />
          </Route>
            <Route path="/vote" element={<Vote />} />
            <Route path="/Results" element={<Results />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;