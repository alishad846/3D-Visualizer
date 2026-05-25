import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import AddProduct from "./pages/product/AddProduct";
import EditProduct from "./pages/product/EditProduct";
import ProductViewer from "./components/product/viewer/ProductViewer";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import DashboardHome from "./pages/dashboard/DashboardHome";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import Products from "./pages/dashboard/Products";
import Settings from "./pages/dashboard/Settings";
import ProjectView from "./pages/dashboard/ProjectView";
import Favorites from "./pages/dashboard/Favorites";
import Landing from "./pages/Landing";
import Showcase from "./pages/Showcase";
import Scan from "./pages/Scan";
import ProductSuccess from "./pages/product/ProductSuccess";
import ScannedProductUI from "./pages/product/ScannedProductUI";
import MobileUpload from "./pages/product/MobileUpload";
import AddProject from "./pages/project/AddProject";
import QRRedirector from "./pages/product/QRRedirector";


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
          element={<Landing />}
        />

        <Route
          path="/scanned-result"
          element={<ScannedProductUI />}
        />

        <Route
          path="/showcase"
          element={<Showcase />}
        />

        <Route
          path="/scan"
          element={<Scan />}
        />

        <Route
          path="/mobile-upload/:sessionId"
          element={<MobileUpload />}
        />

        <Route
          path="/product-success"
          element={<ProductSuccess />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<DashboardLayout />}
          >
            <Route index element={<DashboardHome />} />
            <Route path="products" element={<Products />} />
            <Route path="settings" element={<Settings />} />
            <Route path="project-view" element={<ProjectView />} />
            <Route path="favorites" element={<Favorites />} />
          </Route>
          <Route
            path="/add-project"
            element={<AddProject />}
          />
        </Route>

        <Route
          path="/add-product"
          element={<AddProduct />}
        />

        <Route
          path="/edit-product/:id"
          element={<EditProduct />}
        />

        <Route path="/viewer" element={<ProductViewer />} />
        <Route path="/viewer/:productId" element={<ProductViewer />} />
        <Route path="/p/:productId" element={<ProductViewer />} />
        <Route path="/s/:token" element={<QRRedirector />} />
      </Routes>
    </BrowserRouter>
  );
}