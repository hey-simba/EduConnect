import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import HomePage from './pages/HomePage';
import TuitionHub from './pages/TuitionHub'; // <-- NEW: Imported Tuition Hub

// Import your global Header and Footer (adjust the path if they are saved elsewhere!)
import Header from './components/Header'; 
import Footer from './components/Footer'; 

import './App.css'; // Global CSS

// This Layout wraps any page that needs the Header and Footer
function MainLayout() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Outlet /> {/* This is where the page content (like HomePage or TuitionHub) will render */}
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main entry point (Login/Signup) - NO HEADER/FOOTER HERE */}
        <Route path="/" element={<LandingPage />} />
        
        {/* All routes inside this block WILL have the Header and Footer */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} /> 
          <Route path="/tuition-hub" element={<TuitionHub />} /> {/* <-- NEW: Tuition Hub Route */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;