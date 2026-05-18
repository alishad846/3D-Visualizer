import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import ProductViewer from './pages/viewer/ProductViewer';
import QRScanner from './components/qr/QRScanner';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import AddProduct from './pages/product/AddProduct';

function App() {
  return (
    <Router>
      <div className="w-screen h-screen bg-background text-textMain overflow-hidden">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/view/:productId" element={<ProductViewer />} />
          <Route path="/scan" element={<QRScanner />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard Routes (Post-Login) */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="new" element={<AddProduct />} />
            <Route path="models" element={<DashboardHome />} />
            <Route path="settings" element={<DashboardHome />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;