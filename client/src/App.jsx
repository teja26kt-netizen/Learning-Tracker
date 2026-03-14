import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CourseCatalog from './pages/CourseCatalog';
import CourseRoadmap from './pages/CourseRoadmap';
import CourseDetail from './pages/CourseDetail';
import TopicContent from './pages/TopicContent';
import Progress from './pages/Progress';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import Notes from './pages/Notes';
import DevChatSection from './pages/DevChatSection';
import Bookmarks from './pages/Bookmarks';

// Layout
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div>Loading...</div>;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div>Loading...</div>;
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// Define all dashboard routes in a separate array or component to keep App clean
const dashboardRoutes = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/courses", element: <CourseCatalog /> },
  { path: "/roadmap/:id", element: <CourseRoadmap /> },
  { path: "/roadmap/:courseId/:stepIdx", element: <CourseDetail /> },
  { path: "/roadmap/:courseId/:stepIdx/:topicIdx", element: <TopicContent /> },
  { path: "/progress", element: <Progress /> },
  { path: "/analytics", element: <Insights /> },
  { path: "/chat", element: <DevChatSection /> },
  { path: "/notes", element: <Notes /> },
  { path: "/bookmarks", element: <Bookmarks /> },
  { path: "/settings", element: <Settings /> },
];

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        
        {/* Wrap all dashboard routes in the layout and protection once */}
        {dashboardRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute>
                <DashboardLayout>{element}</DashboardLayout>
              </ProtectedRoute>
            }
          />
        ))}

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
