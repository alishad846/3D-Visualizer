import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import HighlightsEditor   from "./editor/HighlightsEditor";
import SpecificationsEditor from "./editor/SpecificationsEditor";
import StickyActionBar    from "./editor/StickyActionBar";
import MobileHandoffModal from "./editor/MobileHandoffModal";
import VerificationModal  from "./VerificationModal";
import QRSuccessModal     from "./QRSuccessModal";

import { useWorkspaceStore }                        from "../../store/workspaceStore";
import { createProduct, updateProduct, publishProduct, uploadAsset } from "../../api/products";

// ─── helpers ────────────────────────────────────────────────────────────────

const toSlug = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const BLANK = {
  name:           "",
  tagline:        "",
  description:    "",
  brand:          "",
  sku:            "",
  category:       "",
  slug:           "",
  // assets
  thumbnailFile:  null,
  thumbnailUrl:   "",
  rawModelFile:   null,
  modelUrl:       "",
  galleryFiles:   [],
  galleryUrls:    [],
  // structured
  highlights:     [],
  specifications: [],
  // commerce
  price:          "",
  currency:       "INR",
  buyUrl:         "",
  // qr
  qrLabel:        "",
};

function normalizeProductData(product) {
  if (!product) return null;
  return {
    ...product,
    thumbnailUrl: product.thumbnail_url ?? product.thumbnailUrl ?? "",
    modelUrl: product.model_url ?? product.modelUrl ?? "",
    galleryUrls: Array.isArray(product.gallery_urls)
      ? product.gallery_urls
      : Array.isArray(product.galleryUrls)
        ? product.galleryUrls
        : [],
    buyUrl: product.buy_url ?? product.buyUrl ?? "",
    qrLabel: product.qr_label ?? product.qrLabel ?? "",
    features: Array.isArray(product.features) ? product.features : [],
    specs: Array.isArray(product.specs) ? product.specs : [],
  };
}

const CATEGORIES = [
  "Electronics / Audio",
  "Electronics / Mobile",
  "Electronics / Laptop",
  "Electronics / Camera",
  "Furniture",
  "Fashion",
  "Automobile",
  "Gaming",
  "Industrial",
  "Medical",
  "Sports",
  "Consumer Goods",
  "Other",
];

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD"];

// ─── shared input class ─────────────────────────────────────────────────────

const inputCls = (hasErr) =>
  `w-full bg-[#0b1622] border rounded-lg px-4 py-[10px] text-sm text-white outline-none transition-colors
  ${hasErr
    ? "border-red-500/50 focus:border-red-500"
    : "border-white/10 focus:border-cyan-400/60"}`;

// ─── section wrapper ────────────────────────────────────────────────────────

function Section({ id, label, optional = false, children }) {
  return (
    <section id={id} className="mb-10 scroll-mt-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.1em] whitespace-nowrap">
          {label}
          {optional && (
            <span className="ml-1.5 text-slate-600 normal-case tracking-normal font-normal">
              — optional
            </span>
          )}
        </span>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>
      {children}
    </section>
  );
}

// ─── field label ────────────────────────────────────────────────────────────

function Label({ children, required }) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-[6px]">
      {required && (
        <span className="w-[5px] h-[5px] rounded-full bg-cyan-400 flex-shrink-0" />
      )}
      {children}
    </label>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export default function ProductForm({ initialProduct = null, isEditMode = false, onStepComplete, rollbackSignal }) {
  const navigate = useNavigate();
  const { activeProject, projects, fetchProjects } = useWorkspaceStore();

  const baselineRef = useRef(null);
  const [p, setP]           = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [slugEdited, setSlugEdited] = useState(false);

  // upload / modal states
  const [uploading, setUploading]         = useState(false);
  const [uploadMsg, setUploadMsg]         = useState("");
  const [handoffSession, setHandoffSession] = useState(null);
  const [verifyOpen, setVerifyOpen]       = useState(false);
  const [successOpen, setSuccessOpen]     = useState(false);
  const [savedProduct, setSavedProduct]   = useState(null);
  const [savedQr, setSavedQr]             = useState(null);
  const [isPublishing, setIsPublishing]   = useState(false);

  // fetch projects if needed
  useEffect(() => {
    if (projects.length === 0) fetchProjects();
  }, [projects, fetchProjects]);

  const getBaseline = (product) => ({
    ...BLANK,
    name: product?.name || "",
    tagline: product?.tagline || "",
    description: product?.description || "",
    brand: product?.brand || "",
    sku: product?.sku || "",
    category: product?.category || "",
    slug: product?.slug || "",
    thumbnailUrl: product?.thumbnail_url || product?.thumbnailUrl || "",
    modelUrl: product?.model_url || product?.modelUrl || "",
    galleryUrls: Array.isArray(product?.gallery_urls)
      ? product.gallery_urls
      : Array.isArray(product?.galleryUrls)
        ? product.galleryUrls
        : [],
    highlights: Array.isArray(product?.features) ? product.features : [],
    specifications: Array.isArray(product?.specs) ? product.specs : [],
    price: product?.price != null ? String(product.price) : "",
    currency: product?.currency || "INR",
    buyUrl: product?.buy_url || product?.buyUrl || "",
    qrLabel: product?.qr_label || product?.qrLabel || "",
  });

  // initialize edit mode values and baseline snapshot
  useEffect(() => {
    const snapshot = initialProduct ? getBaseline(initialProduct) : BLANK;
    baselineRef.current = snapshot;
    setP(snapshot);
    setSlugEdited(Boolean(initialProduct?.slug) && initialProduct.slug !== toSlug(initialProduct.name || ""));
  }, [initialProduct]);

  // mobile handoff polling
  useEffect(() => {
    if (!handoffSession) return;
    const iv = setInterval(() => {
      const url = localStorage.getItem(`handoff_${handoffSession}`);
      if (url) {
        set("modelUrl", url);
        localStorage.removeItem(`handoff_${handoffSession}`);
        setHandoffSession(null);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [handoffSession]);

  useEffect(() => {
    if (rollbackSignal == null) return;
    setP(baselineRef.current || BLANK);
    setErrors({});
    setSlugEdited(false);
  }, [rollbackSignal]);

  // ── field helpers ──────────────────────────────────────────────────────

  const set = useCallback((field, value) => {
    setP((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  }, []);

  // auto-generate slug from name unless user has manually edited it
  const handleNameChange = (val) => {
    set("name", val);
    if (!slugEdited) set("slug", toSlug(val));
  };

  const handleSlugChange = (val) => {
    // enforce slug charset: lowercase, digits, hyphens only
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    set("slug", clean);
    setSlugEdited(clean.length > 0);
  };

  // gallery helpers
  const addGalleryFiles = (files) => {
    const arr   = Array.from(files).slice(0, 5 - p.galleryFiles.length);
    const newFiles   = [...p.galleryFiles, ...arr];
    const newPreviews = newFiles.map((f) =>
      typeof f === "string" ? f : URL.createObjectURL(f)
    );
    setP((prev) => ({ ...prev, galleryFiles: newFiles, galleryUrls: newPreviews }));
  };

  const removeGallery = (index) => {
    const files = p.galleryFiles.filter((_, i) => i !== index);
    const urls  = p.galleryUrls.filter((_,  i) => i !== index);
    setP((prev) => ({ ...prev, galleryFiles: files, galleryUrls: urls }));
  };

  // ── validation ─────────────────────────────────────────────────────────

  const validate = () => {
    const e = {
      name:     !p.name.trim(),
      category: !p.category,
      slug:     !p.slug.trim(),
      modelUrl: !p.modelUrl,
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  // ── save flow ──────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setUploading(true);

      // upload GLB
      setUploadMsg("Uploading 3D model...");
      let finalModelUrl = p.modelUrl;
      if (p.rawModelFile) {
        const res = await uploadAsset(p.rawModelFile);
        finalModelUrl = res.url;
      }

      // upload thumbnail
      setUploadMsg("Uploading thumbnail...");
      let finalThumbUrl = p.thumbnailUrl;
      if (p.thumbnailFile) {
        const res = await uploadAsset(p.thumbnailFile);
        finalThumbUrl = res.url;
      }

      // upload gallery
      setUploadMsg("Uploading gallery images...");
      const finalGallery = [];
      for (const file of p.galleryFiles) {
        if (typeof file === "string") {
          finalGallery.push(file);
        } else {
          const res = await uploadAsset(file);
          finalGallery.push(res.url);
        }
      }

      setUploadMsg("Saving product...");

      const payload = {
        projectId:    activeProject?.id || initialProduct?.project_id,
        name:         p.name.trim(),
        tagline:      p.tagline.trim()     || null,
        description:  p.description.trim() || null,
        brand:        p.brand.trim()       || null,
        sku:          p.sku.trim()         || null,
        category:     p.category,
        slug:         p.slug.trim(),
        modelUrl:     finalModelUrl,
        thumbnailUrl: finalThumbUrl        || null,
        galleryUrls:  finalGallery,
        features:     p.highlights,
        specs:        p.specifications,
        price:        p.price              ? parseFloat(p.price) : null,
        currency:     p.currency,
        buyUrl:       p.buyUrl.trim()      || null,
        qrLabel:      p.qrLabel.trim()     || null,
      };

      const newProduct = isEditMode
        ? await updateProduct(initialProduct.id, payload)
        : await createProduct(payload);
      setSavedProduct(normalizeProductData(newProduct));
      setUploading(false);
      setUploadMsg("");
      setVerifyOpen(true);
    } catch (err) {
      console.error(err);
      setUploading(false);
      setUploadMsg("");
      alert(err.message || "Failed to create product. Please try again.");
    }
  };

  // ── publish / QR ───────────────────────────────────────────────────────

  const handleGenerateQR = async () => {
    if (!savedProduct) return;
    try {
      setIsPublishing(true);
      const { product: pub, qrCode } = await publishProduct(savedProduct.id);
      setSavedProduct(normalizeProductData(pub));
      setSavedQr(qrCode);
      setIsPublishing(false);
      setVerifyOpen(false);
      setSuccessOpen(true);
    } catch (err) {
      console.error(err);
      setIsPublishing(false);
      alert(err.message || "Failed to generate QR Code.");
    }
  };

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════

  return (
    <div className="relative pb-24">

      {/* ── UPLOAD OVERLAY ── */}
      {uploading && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 rounded-full border-[3px] border-slate-700 border-t-cyan-400 animate-spin" />
          <p className="text-sm font-semibold text-white tracking-wide">{uploadMsg}</p>
        </div>
      )}

      <div className="max-w-[1100px] mx-auto px-8 pt-8">

        {/* ══════════════════════════════════════════
            1. IDENTITY
        ══════════════════════════════════════════ */}
        <Section id="s-identity" label="Identity">

          {/* Product Name */}
          <div className="mb-3">
            <Label required>Product Name</Label>
            <input
              className={inputCls(errors.name)}
              value={p.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
            />
            {errors.name && (
              <p className="text-red-400 text-[11px] mt-1">Product name is required</p>
            )}
          </div>

          {/* Tagline */}
          <div className="mb-3">
            <Label>Tagline</Label>
            <input
              className={inputCls(false)}
              value={p.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              placeholder="One line that captures what this product does"
              maxLength={300}
            />
          </div>

          {/* Description */}
          <div className="mb-3">
            <Label>Description</Label>
            <textarea
              className={`${inputCls(false)} resize-none`}
              rows={3}
              value={p.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the product — what it is, who it's for, what makes it special..."
            />
          </div>

          {/* Brand / SKU / Category */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <Label>Brand</Label>
              <input
                className={inputCls(false)}
                value={p.brand}
                onChange={(e) => set("brand", e.target.value)}
                placeholder="e.g. Sony"
              />
            </div>
            <div>
              <Label>SKU</Label>
              <input
                className={inputCls(false)}
                value={p.sku}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="e.g. WH-1000XM5"
              />
            </div>
            <div>
              <Label required>Category</Label>
              <select
                className={`${inputCls(errors.category)} appearance-none cursor-pointer`}
                value={p.category}
                onChange={(e) => set("category", e.target.value)}
              >
                <option value="" disabled>Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-400 text-[11px] mt-1">Category is required</p>
              )}
            </div>
          </div>

          {/* Slug — bottom of identity */}
          <div>
            <Label required>Public URL Slug</Label>
            <div
              className={`
                flex items-center bg-[#0b1622] border rounded-lg overflow-hidden
                transition-colors
                ${errors.slug ? "border-red-500/50" : "border-white/10 focus-within:border-cyan-400/60"}
              `}
            >
              <span className="pl-4 pr-1 text-sm text-slate-500 whitespace-nowrap select-none">
                scanvista.com/p/
              </span>
              <input
                className="flex-1 bg-transparent py-[10px] pr-4 text-sm text-white outline-none"
                value={p.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="your-product-slug"
              />
            </div>
            <p className="text-[10px] text-slate-600 mt-1.5">
              Lowercase letters, numbers, and hyphens only. Auto-filled from product name — edit if needed. Must be unique within your project.
            </p>
            {errors.slug && (
              <p className="text-red-400 text-[11px] mt-1">Slug is required</p>
            )}
          </div>

        </Section>

        {/* ══════════════════════════════════════════
            2. VISUAL ASSETS
        ══════════════════════════════════════════ */}
        <Section id="s-assets" label="Visual Assets">

          {/* Thumbnail — full width row */}
          <div className="mb-4">
            <Label required>Product Thumbnail</Label>
            <div
              className={`
                flex items-center gap-4 border rounded-xl p-4 cursor-pointer
                transition-colors group
                ${p.thumbnailUrl
                  ? "border-white/10 bg-white/[0.02]"
                  : "border-dashed border-cyan-400/20 bg-cyan-400/[0.02] hover:border-cyan-400/40 hover:bg-cyan-400/[0.04]"}
              `}
              onClick={() => document.getElementById("thumb-input").click()}
            >
              {p.thumbnailUrl ? (
                <img
                  src={p.thumbnailUrl}
                  alt="thumbnail"
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0 text-xl">
                  🖼
                </div>
              )}
              <div className="flex-1">
                <p className="text-[12px] font-semibold text-slate-300">
                  {p.thumbnailUrl ? "Thumbnail uploaded" : "Product thumbnail"}
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  PNG or JPG · max 5MB · shown as placeholder before 3D model loads
                </p>
              </div>
              <div className="px-4 py-2 border border-cyan-400/20 rounded-lg text-[11px] text-cyan-400 flex-shrink-0 group-hover:bg-cyan-400/10 transition-colors">
                {p.thumbnailUrl ? "Replace" : "Browse"}
              </div>
              <input
                id="thumb-input"
                type="file"
                hidden
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    set("thumbnailFile", file);
                    set("thumbnailUrl", URL.createObjectURL(file));
                  }
                }}
              />
            </div>
          </div>

          {/* GLB + Gallery two-column */}
          <div className="grid gap-4 md:grid-cols-2">

            {/* LEFT — 3D Model */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-4 pb-0">
                <span className="text-[12px] font-semibold text-slate-300">3D GLB Model</span>
                <span className="text-[9px] font-bold uppercase tracking-wide bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded">
                  Required
                </span>
              </div>

              <div
                className={`
                  m-3 rounded-xl border-[1.5px] border-dashed p-6 text-center
                  cursor-pointer transition-all
                  ${errors.modelUrl
                    ? "border-red-500/40 bg-red-500/5"
                    : p.modelUrl
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-cyan-400/20 bg-cyan-400/[0.02] hover:border-cyan-400/40 hover:bg-cyan-400/[0.04]"}
                `}
                onClick={() =>
                  !p.modelUrl && document.getElementById("glb-input").click()
                }
              >
                {p.modelUrl ? (
                  <>
                    <div className="text-2xl mb-2">✅</div>
                    <p className="text-[12px] font-semibold text-emerald-400 mb-1">
                      Model uploaded
                    </p>
                    <p className="text-[10px] text-slate-500 mb-3 truncate px-2">
                      {p.rawModelFile?.name || p.modelUrl.split("/").pop()}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        set("modelUrl", "");
                        set("rawModelFile", null);
                      }}
                      className="text-[11px] text-cyan-400 border border-cyan-400/30 px-3 py-1.5 rounded-lg hover:bg-cyan-400/10 transition-colors"
                    >
                      Replace
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-3xl mb-3 opacity-50">⬡</div>
                    <p className="text-[12px] font-semibold text-slate-400 mb-1">
                      Drop your .glb file here
                    </p>
                    <p className="text-[10px] text-slate-600">
                      or{" "}
                      <span className="text-cyan-400 cursor-pointer">browse files</span>
                    </p>
                    <p className="text-[10px] text-slate-600 mt-2">GLB only · max 50MB</p>
                  </>
                )}
                <input
                  id="glb-input"
                  type="file"
                  hidden
                  accept=".glb"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      set("rawModelFile", file);
                      set("modelUrl", URL.createObjectURL(file));
                    }
                  }}
                />
              </div>

              {errors.modelUrl && (
                <p className="text-red-400 text-[11px] px-4 pb-3">
                  A 3D GLB model is required
                </p>
              )}

              {/* Mobile upload option */}
              <div className="px-3 pb-3">
                <button
                  onClick={() =>
                    setHandoffSession(Math.random().toString(36).substring(2, 10))
                  }
                  className="w-full py-2 border border-white/[0.08] rounded-lg text-[11px] text-slate-500 hover:text-slate-300 hover:border-white/20 transition-colors"
                >
                  📱 Upload from mobile
                </button>
              </div>
            </div>

            {/* RIGHT — Gallery */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-4 pb-0">
                <span className="text-[12px] font-semibold text-slate-300">Gallery Images</span>
                <span className="text-[9px] font-bold uppercase tracking-wide bg-white/[0.06] text-slate-500 px-2 py-0.5 rounded">
                  Optional · up to 5
                </span>
              </div>

              <div className="p-3">
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const url = p.galleryUrls[i];
                    return url ? (
                      <div
                        key={i}
                        className="aspect-square rounded-lg overflow-hidden relative group border border-white/10"
                      >
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeGallery(i)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div
                        key={i}
                        className="aspect-square rounded-lg border border-dashed border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-slate-600 text-base cursor-pointer hover:border-cyan-400/30 hover:text-cyan-400/60 transition-colors"
                        onClick={() =>
                          p.galleryUrls.length < 5 &&
                          document.getElementById("gallery-input").click()
                        }
                      >
                        +
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-600 text-center">PNG, JPG · max 5MB each</p>
                <input
                  id="gallery-input"
                  type="file"
                  hidden
                  multiple
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => addGalleryFiles(e.target.files)}
                />
              </div>
            </div>

          </div>
        </Section>

        {/* ══════════════════════════════════════════
            3. HIGHLIGHTS + SPECIFICATIONS
        ══════════════════════════════════════════ */}
        <div className="grid gap-8 xl:grid-cols-2">
          <Section id="s-highlights" label="Highlights">
            <HighlightsEditor
              highlights={p.highlights}
              onChange={(h) => set("highlights", h)}
            />
          </Section>

          <Section id="s-specs" label="Specifications">
            <SpecificationsEditor
              specs={p.specifications}
              onChange={(s) => set("specifications", s)}
            />
          </Section>
        </div>

        {/* ══════════════════════════════════════════
            5. COMMERCE + QR
        ══════════════════════════════════════════ */}
        <div className="grid gap-8 xl:grid-cols-2">
          <Section id="s-commerce" label="Commerce" optional>
          <div className="grid grid-cols-3 gap-3 mb-2">
            <div>
              <Label>Price</Label>
              <input
                className={inputCls(false)}
                type="number"
                min="0"
                step="0.01"
                value={p.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Currency</Label>
              <select
                className={`${inputCls(false)} appearance-none cursor-pointer`}
                value={p.currency}
                onChange={(e) => set("currency", e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Buy URL</Label>
              <input
                className={inputCls(false)}
                value={p.buyUrl}
                onChange={(e) => set("buyUrl", e.target.value)}
                placeholder="https://your-store.com/product"
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-600">
            Leave price empty if this product is for display only — no Buy Now button will appear on the viewer page.
          </p>
        </Section>

          <Section id="s-qr" label="QR Settings" optional>
            <div>
              <Label>QR Label</Label>
              <input
                className={inputCls(false)}
                value={p.qrLabel}
                onChange={(e) => set("qrLabel", e.target.value)}
                placeholder="e.g. Scan to explore in 3D"
                maxLength={100}
              />
              <p className="text-[10px] text-slate-600 mt-1.5">
                Short text printed below the QR code on packaging or displays. Leave blank for no label.
              </p>
            </div>
            {/* bottom breathing room above sticky bar */}
            <div className="h-8" />
          </Section>
        </div>

      </div>

      {/* ── STICKY ACTION BAR ── */}
      <StickyActionBar
        onSave={handleSave}
        onCancel={() => {
          setP(baselineRef.current || BLANK);
          setErrors({});
          setSlugEdited(false);
          navigate(-1);
        }}
      />

      {/* ── MODALS ── */}
      <MobileHandoffModal
        isOpen={!!handoffSession}
        sessionId={handoffSession}
        onClose={() => setHandoffSession(null)}
      />

      <VerificationModal
        isOpen={verifyOpen}
        product={savedProduct}
        onEdit={() => setVerifyOpen(false)}
        onGenerateQR={handleGenerateQR}
        isPublishing={isPublishing}
      />

      <QRSuccessModal
        isOpen={successOpen}
        product={savedProduct}
        qrCode={savedQr}
        onClose={() => setSuccessOpen(false)}
        onCreateAnother={() => {
          setSuccessOpen(false);
          setP(BLANK);
          setSavedProduct(null);
          setSavedQr(null);
        }}
        onViewLibrary={() => {
          setSuccessOpen(false);
          navigate("/dashboard/products");
        }}
      />
    </div>
  );
}