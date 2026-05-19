import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ProductIdentity from "../../components/product/editor/ProductIdentity";
import ThumbnailUploader from "../../components/product/editor/ThumbnailUploader";
import HighlightsEditor from "../../components/product/editor/HighlightsEditor";
import SpecificationsEditor from "../../components/product/editor/SpecificationsEditor";
import StickyActionBar from "../../components/product/editor/StickyActionBar";

// ---------------------------------------------------------------
// Default blank product state
// ---------------------------------------------------------------
const BLANK_PRODUCT = {
  name: "",
  brand: "",
  model: "",
  category: "Electronics / Audio",
  description: "",
  modelUrl: "",
  thumbnails: [],
  highlights: [],
  specifications: [],
};

// ---------------------------------------------------------------
// Sample product stored in localStorage
// ---------------------------------------------------------------
function loadSampleProduct() {
  try {
    const raw = localStorage.getItem("scanvista-product");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function ProductForm({ initialProduct: propInitial, isEditMode = false }) {

  const navigate = useNavigate();
  const { id } = useParams();

  // ---------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------
  const [product, setProduct] = useState(
    propInitial || BLANK_PRODUCT
  );

  // When navigating from EditProduct with loading, sync state
  useEffect(() => {
    if (propInitial) {
      setProduct({ ...BLANK_PRODUCT, ...propInitial });
    } else if (isEditMode) {
      const saved = loadSampleProduct();
      if (saved) setProduct({ ...BLANK_PRODUCT, ...saved });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---------------------------------------------------------------
  // SUB-FIELD UPDATERS
  // ---------------------------------------------------------------
  const updateIdentity = useCallback((patch) => {
    setProduct((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateThumbnails = useCallback((thumbnails) => {
    setProduct((prev) => ({ ...prev, thumbnails }));
  }, []);

  const updateHighlights = useCallback((highlights) => {
    setProduct((prev) => ({ ...prev, highlights }));
  }, []);

  const updateSpecifications = useCallback((specifications) => {
    setProduct((prev) => ({ ...prev, specifications }));
  }, []);

  // Model URL handler (receives object URL from file upload)
  const setModelUrl = useCallback((url) => {
    setProduct((prev) => ({ ...prev, modelUrl: url }));
  }, []);

  // ---------------------------------------------------------------
  // SAVE
  // ---------------------------------------------------------------
  const handleSave = useCallback(() => {
    localStorage.setItem("scanvista-product", JSON.stringify(product));
    navigate("/viewer");
  }, [product, navigate]);

  const handleCancel = useCallback(() => {
    navigate("/add-product");
  }, [navigate]);

  // ---------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------
  return (
    <div
      className="
        relative rounded-[36px] border border-cyan-400/10
        bg-white/[0.03] backdrop-blur-2xl overflow-hidden
        shadow-[0_0_100px_rgba(0,0,0,0.45)]
      "
    >

      {/* AMBIENT GLOW */}
      <div
        className="
          absolute top-0 right-0 w-[500px] h-[500px
          bg-cyan-400/10 blur-[160px] rounded-full
        "
      />

      <div className="relative z-10 p-8 lg:p-10">

        {/* PAGE TITLE */}
        <div className="mb-10">
          <h2 className="text-5xl font-black">
            Add / Edit Product:
            <span className="text-cyan-400">
              {" "}
              {product.brand
                ? `${product.brand} ${product.name}`
                : "New Product"}
            </span>
          </h2>
          <p className="text-slate-400 mt-4 text-lg">
            {isEditMode
              ? "Update 3D assets, thumbnails, specifications and highlights."
              : "Upload 3D assets, thumbnails, specifications and highlights."}
          </p>
        </div>

        {/* ═══════════════════════════════ */}
        {/*  IDENTITY                     */}
        {/* ═══════════════════════════════ */}
        <div className="rounded-[30px] border border-cyan-400/10 bg-black/20 backdrop-blur-xl p-8 mb-8">
          <ProductIdentity
            name={product.name}
            brand={product.brand}
            model={product.model}
            category={product.category}
            description={product.description}
            onChange={updateIdentity}
          />
        </div>

        {/* ═══════════════════════════════ */}
        {/*  MODEL + THUMBNAILS           */}
        {/* ═══════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* MODEL UPLOAD */}
          <div className="rounded-[30px] border border-cyan-400/10 bg-black/20 p-8">
            <h3 className="text-3xl font-bold mb-8">Visual Assets</h3>

            <div
              className="
                min-h-[320px] rounded-[28px] border border-dashed
                border-cyan-400/20 bg-gradient-to-b from-cyan-400/10 to-transparent
                flex flex-col items-center justify-center p-6
              "
            >
              <div className="text-7xl mb-4">📦</div>
              <h4 className="text-2xl font-bold">3D GLB Model</h4>
              <p className="text-slate-400 mt-2">
                {product.modelUrl ? product.modelUrl.split("/").pop() : "No model uploaded"}
              </p>

              <div className="flex gap-4 mt-8">
                <label
                  className="
                    px-7 py-3 rounded-2xl bg-cyan-400 text-black font-bold
                    cursor-pointer hover:scale-105 transition
                  "
                >
                  Upload Model
                  <input
                    type="file"
                    hidden
                    accept=".glb,.gltf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setModelUrl(URL.createObjectURL(file));
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* THUMBNAILS */}
          <ThumbnailUploader
            images={product.thumbnails}
            onImagesChange={updateThumbnails}
          />
        </div>

        {/* ═══════════════════════════════ */}
        {/*  HIGHLIGHTS + SPECS           */}
        {/* ═══════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <HighlightsEditor
            highlights={product.highlights}
            onChange={updateHighlights}
          />

          <SpecificationsEditor
            specs={product.specifications}
            onChange={updateSpecifications}
          />

        </div>

      </div>

      {/* STICKY ACTION BAR */}
      <StickyActionBar
        onSave={handleSave}
        onCancel={isEditMode ? handleCancel : undefined}
      />

    </div>
  );
}
