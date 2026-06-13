import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import AddProduct from "./pages/product/AddProduct";
import BulkImportProduct from "./pages/product/BulkImportProduct";
import EditProduct from "./pages/product/EditProduct";
import ProductViewer from "./components/product/viewer/ProductViewer";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import DashboardHome from "./pages/dashboard/DashboardHome";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import Products from "./pages/dashboard/Products";
import IncompleteProducts from "./pages/dashboard/IncompleteProducts";
import Settings from "./pages/dashboard/Settings";
import ProjectView from "./pages/dashboard/ProjectView";
import Favorites from "./pages/dashboard/Favorites";
import Analytics from "./pages/dashboard/Analytics";
import ProjectAnalytics from "./pages/dashboard/ProjectAnalytics";
import Trash from "./pages/dashboard/Trash";
import Landing from "./pages/LandingHome";
import ProductSuccess from "./pages/product/ProductSuccess";
import ScannedProductUI from "./pages/product/ScannedProductUI";
import MobileUpload from "./pages/product/MobileUpload";
import AddProject from "./pages/project/AddProject";
import QRRedirector from "./pages/product/QRRedirector";
import CompareProducts from "./pages/product/CompareProducts";

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>

        {/* ── PUBLIC ROUTES ── */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/showcase" element={<Navigate to="/#examples" replace />} />
        <Route path="/scan" element={<Navigate to="/#scan" replace />} />
        <Route path="/scanned-result" element={<Navigate to="/#scan" replace />} />
        <Route path="/mobile-upload/:sessionId" element={<MobileUpload />} />
        <Route path="/product-success" element={<ProductSuccess />} />

        {/* ── PUBLIC VIEWER ROUTES — no auth needed ── */}
        <Route path="/viewer" element={<ProductViewer />} />
        <Route path="/viewer/:productId" element={<ProductViewer />} />
        <Route path="/p/:productId" element={<ProductViewer />} />
        <Route path="/compare/:productId" element={<CompareProducts />} />
        <Route path="/s/:token" element={<QRRedirector />} />

        {/* ── PROTECTED ROUTES ── */}
        <Route element={<ProtectedRoute />}>

          {/* Dashboard — has its own layout with global navbar/sidebar */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="products" element={<Products />} />
            <Route path="incomplete-models" element={<IncompleteProducts />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="analytics/project" element={<ProjectAnalytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="project-view" element={<ProjectView />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="trash" element={<Trash />} />
          </Route>

          {/* These pages have their OWN full-page layout (sidebar + form)
              but still require auth. They do NOT use DashboardLayout
              because they have a different visual structure.
              The global navbar IS rendered inside AddProduct/EditProduct directly. */}
          <Route path="/add-project" element={<AddProject />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/bulk-import" element={<BulkImportProduct />} />
          <Route path="/edit-product/:id" element={<EditProduct />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}
