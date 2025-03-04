// App.js
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import CandidateDetails from './components/Register/CandidateDetails';
import AdminDashboard from './components/Dashboards/AdminDashboard';
import UserDashboard from './components/Dashboards/UserDashboard';
import ElectionDetails from './components/Elections/ElectionDetails';
import Vote from './components/Elections/Vote';
import AdminLogin from './components/Login/AdminLogin';
import Login from './components/Login/Login';
import Navbar from './components/Navbar/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AddCandidate from './components/Register/AddCandidate';
import Register from './components/Register/Register';
import Results from './components/Results/Results';
// import AdminResults from './components/Results/AdminResults';
import AdminResultsView from './components/Results/AdminResultsView';
import ElectionResultsGraph from './components/Results/ElectionResultsGraph';
import EditProfile from './components/Register/EditProfile';


const App = () => {
  return (
    <AuthProvider>
      <Router>
      <div className='bg-custom'>
        <Navbar />
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/add-candidates/:electionId"element={<AddCandidate />} />
            <Route path="/candidate-details" element={<CandidateDetails />} />
          </Route>

      
            {/* <Route path="/results" element={<Results />} /> */}
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/election-dashboard" element={<ElectionDetails />} />
            <Route path="/vote/:electionId" element={<Vote />} />
            <Route path="/results/:electionId" element={<Results />} />
            {/* <Route path="/admin-results" element={<AdminResults />} /> */}
            <Route path="/admin-results-view/:electionId" element={<AdminResultsView />} />
            <Route path="/candidate-details" element={<CandidateDetails />} />
            <Route path='/result-graph/:electionId' element={<ElectionResultsGraph/>}/>

        </Routes>
      </div>
      </Router>
    </AuthProvider>
  );
};

export default App;