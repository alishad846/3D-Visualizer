import EditProduct from "./pages/product/EditProduct";

export default function ProductRoutes() {
  return (
    <Route path="/edit-product/:id" element={<EditProduct />} />
  );
}
