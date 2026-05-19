import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AddProduct from "./pages/product/AddProduct";
import EditProduct from "./pages/product/EditProduct";
import ProductViewer from "./components/product/viewer/ProductViewer";

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
          element={<Navigate to="/add-product" replace />}
        />

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
