import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Home    from './pages/Home';
import Browse  from './pages/Browse';
import Login   from './pages/Login';
import Register from './pages/Register';
import Donate  from './pages/Donate';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import Dashboard from './pages/Dashboard';
import Admin   from './pages/Admin';
import Submit  from './pages/Submit';

function PrivateRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}><div className="spinner spinner-lg" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/"                element={<Home />} />
        <Route path="/browse"          element={<Browse />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/donate/:id"      element={<Donate />} />
        <Route path="/payment/:campaignId" element={<PrivateRoute><Payment /></PrivateRoute>} />
        <Route path="/payment-success" element={<PrivateRoute><PaymentSuccess /></PrivateRoute>} />
        <Route path="/dashboard"       element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/submit"          element={<PrivateRoute><Submit /></PrivateRoute>} />
        <Route path="/admin"           element={<PrivateRoute adminOnly><Admin /></PrivateRoute>} />
        <Route path="*"                element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}