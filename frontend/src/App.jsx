import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import HomePage from './pages/HomePage';
import './App.css'; // Put your global CSS import here!

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main entry point (Login/Signup) */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Your newly activated routes! */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;