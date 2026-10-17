import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Core Components & Pages
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import GetToKnow from './pages/GetToKnow';
import ZodiacResult from './pages/ZodiacResult';
import UndertoneTest from './pages/UndertoneTest';
import UndertoneResult from './pages/UndertoneResult';
import AstroView from './pages/AstroView';
import AstroInsights from './pages/AstroInsights';
import AboutUs from './pages/AboutUs'; 

// Auth & User Dashboard Pages
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Terms from './pages/Terms';
import Dashboard from './pages/Dashboard';
import ProfileSettings from './pages/ProfileSettings';
import SecuritySettings from './pages/SecuritySettings'; // <-- Newly added Security component

// Tarot Pages
import TarotHome from './pages/tarot/TarotHome';
import SingleCardPicker from './pages/tarot/SingleCardPicker';
import FourCardPicker from './pages/tarot/FourCardPicker';
import SingleCardResult from './pages/tarot/SingleCardResult';
import FourCardResult from './pages/tarot/FourCardResult';

// Aesthetic Quiz Pages
import AestheticWelcome from './pages/quizzes/AestheticWelcome';
import AestheticQuiz from './pages/quizzes/AestheticQuiz';
import AestheticResult from './pages/quizzes/AestheticResult';

// Style & Outfit Quiz Pages
import StyleWelcome from './pages/quizzes/StyleWelcome';
import BodyTypeAnalysis from './pages/quizzes/BodyTypeAnalysis';
import StyleQuiz from './pages/quizzes/StyleQuiz';
import StyleResult from './pages/quizzes/StyleResult';

// Moodboard Page
import MoodboardResult from './pages/moodboard/MoodboardResult';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import ManageUsers from './pages/admin/ManageUsers';
import EditUser from './pages/admin/EditUser';

// Global Styles
import './styles/global.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('celesticare_token');
  return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('celesticare_token');
  const user = JSON.parse(localStorage.getItem('celesticare_user') || '{}');
  const isAdminUser = user.role === 'admin' || user.is_admin === true;
  return (token && isAdminUser) ? children : <Navigate to="/admin/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Navbar /> 
      <div className="app-content"> 
        <Routes>
          {/* Onboarding, Core & Info Pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<AboutUs />} /> 
          <Route path="/get-to-know" element={<GetToKnow />} />
          <Route path="/zodiac-result" element={<ZodiacResult />} />
          <Route path="/undertone-test" element={<UndertoneTest />} />
          <Route path="/undertone-result" element={<UndertoneResult />} />
          <Route path="/astro-view" element={<AstroView />} />
          <Route path="/astro-insights" element={<ProtectedRoute><AstroInsights /></ProtectedRoute>} />
          
          {/* Tarot Module */}
          <Route path="/tarot" element={<TarotHome />} />
          <Route path="/tarot/single" element={<SingleCardPicker />} />
          <Route path="/tarot/four" element={<FourCardPicker />} />
          <Route path="/tarot/single-result/:id" element={<SingleCardResult />} />
          <Route path="/tarot/four-result" element={<FourCardResult />} />

          {/* Aesthetic Quiz Module */}
          <Route path="/aesthetic-welcome" element={<ProtectedRoute><AestheticWelcome /></ProtectedRoute>} />
          <Route path="/aesthetic-quiz" element={<ProtectedRoute><AestheticQuiz /></ProtectedRoute>} />
          <Route path="/aesthetic-result/:resultId?" element={<ProtectedRoute><AestheticResult /></ProtectedRoute>} />

          {/* Style & Outfit Quiz Module */}
          <Route path="/style-welcome" element={<ProtectedRoute><StyleWelcome /></ProtectedRoute>} />
          <Route path="/body-type" element={<ProtectedRoute><BodyTypeAnalysis /></ProtectedRoute>} />
          <Route path="/style-quiz" element={<ProtectedRoute><StyleQuiz /></ProtectedRoute>} />
          <Route path="/style-result" element={<ProtectedRoute><StyleResult /></ProtectedRoute>} />

          {/* Moodboard Module */}
          <Route path="/moodboard" element={<ProtectedRoute><MoodboardResult /></ProtectedRoute>} />

          {/* Auth, Dashboard & Security Settings */}
          <Route path="/register" element={<Register />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
          <Route path="/security" element={<ProtectedRoute><SecuritySettings /></ProtectedRoute>} /> {/* <-- Route mapped here */}
          
          {/* Admin Module */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminRoute><ManageUsers /></AdminRoute>} />
          <Route path="/admin/user/:id" element={<AdminRoute><EditUser /></AdminRoute>} />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
