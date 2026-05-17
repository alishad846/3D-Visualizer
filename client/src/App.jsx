import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/ui/Navbar';
import Sidebar from './components/ui/Sidebar';
import Dashboard from './pages/dashboard/Dashboard';
import ProjectView from './pages/dashboard/ProjectView';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProductViewer from './pages/viewer/ProductViewer';
import AddProduct from './pages/product/AddProduct';
import EditProduct from './pages/product/EditProduct';

function App() {
  return (
    <Router>
      <div className="scanvista-app" style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar />
          <main style={{ flex: 1, padding: '2rem' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/project/:id" element={<ProjectView />} />
              <Route path="/product/add" element={<AddProduct />} />
              <Route path="/product/edit/:id" element={<EditProduct />} />
              <Route path="/view/:productId" element={<ProductViewer />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;