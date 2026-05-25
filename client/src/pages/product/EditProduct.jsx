import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import ProductForm from "../../components/product/ProductForm";
import { fetchProductById } from "../../api/products";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071018] text-white flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading product data…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#071018] text-white flex items-center justify-center px-6">
        <div className="max-w-lg rounded-3xl border border-cyan-400/10 bg-[#071018]/90 p-10 text-center">
          <p className="text-lg font-semibold text-white mb-4">Unable to load product</p>
          <p className="text-sm text-slate-400 mb-6">{error || "This product cannot be edited at the moment."}</p>
          <button
            onClick={() => navigate("/dashboard/products")}
            className="px-6 py-3 rounded-2xl bg-cyan-400 text-black font-bold hover:bg-cyan-300 transition"
          >
            Back to products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071018] text-white overflow-x-hidden">

      {/* ── BACKGROUND ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden">

        <div
          className="
            absolute top-0 left-0 w-full h-full
            bg-[radial-gradient(circle_at_top,#0f2c3d,transparent_55%)]
          "
        />

        <div
          className="
            absolute top-20 left-20 w-[420px] h-[420px]
            bg-cyan-500/10 blur-[120px] rounded-full
          "
        />

        <div
          className="
            absolute bottom-10 right-10 w-[350px] h-[350px]
            bg-cyan-400/5 blur-[120px] rounded-full
          "
        />

      </div>

      {/* ── STICKY HEADER ── */}
      <header
        className="
          sticky top-0 z-50 border-b border-cyan-400/10
          bg-[#071018]/70 backdrop-blur-2xl
        "
      >
        <div
          className="
            max-w-7xl mx-auto px-6 py-4
            flex items-center justify-between
          "
        >
          {/* LEFT */}
          <div className="flex items-center gap-4">

            <div
              className="
                w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/20
                flex items-center justify-center text-cyan-400
                text-2xl font-black
                shadow-[0_0_25px_rgba(34,211,238,0.25)]
              "
            >
              S
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                ScanVista Creator Side
              </h1>
              <p className="text-slate-400 text-sm">
                Product Management Dashboard
              </p>
            </div>

          </div>

          {/* USER BADGE */}
          <div
            className="
              px-4 py-2 rounded-2xl border border-cyan-400/20
              bg-cyan-400/10 flex items-center gap-3
            "
          >
            <div
              className="
                w-9 h-9 rounded-full bg-cyan-400 text-black
                font-bold flex items-center justify-center
              "
            >
              T
            </div>

            <div>
              <p className="text-sm font-semibold">Creator</p>
              <p className="text-xs text-slate-400">
                ScanVista Workspace
              </p>
            </div>

          </div>

        </div>

      </header>

      {/* ── MAIN ── */}
      <main
        className="
          max-w-7xl mx-auto px-6 py-8 pb-56
        "
      >
        <div className="mb-10">

          <h2 className="text-5xl font-black mb-3">
            Add / Edit Product{" "}
            <span className="text-cyan-400">
              — {product.brand} {product.name}
            </span>
          </h2>

          <p className="text-slate-400 text-lg">
            Update 3D assets, thumbnails, specifications and highlights
            for this product.
          </p>

        </div>

        {/* PASS LOADED PRODUCT + EDIT MODE TO FORM */}
        <ProductForm
          initialProduct={product}
          isEditMode={true}
        />

      </main>

    </div>
  );
}
