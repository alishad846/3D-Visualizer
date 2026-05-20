import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AddProduct from "./pages/product/AddProduct";
import EditProduct from "./pages/product/EditProduct";
import ProductViewer from "./components/product/viewer/ProductViewer";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import DashboardHome from "./pages/dashboard/DashboardHome";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import Products from "./pages/dashboard/Products";
import Profile from "./pages/dashboard/Profile";
import ProjectView from "./pages/dashboard/ProjectView";
import Favorites from "./pages/dashboard/Favorites";

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/register" replace />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<DashboardLayout />}
        >
          <Route index element={<DashboardHome />} />
          <Route path="products" element={<Products />} />
          <Route path="profile" element={<Profile />} />
          <Route path="project-view" element={<ProjectView />} />
          <Route path="favorites" element={<Favorites />} />
        </Route>

        <Route
          path="/add-product"
          element={<AddProduct />}
        />

        <Route
          path="/edit-product/:id"
          element={<EditProduct />}
        />

        <Route
          path="/viewer"
          element={<ProductViewer />}
        />
      </Routes>
    </BrowserRouter>
  );
}