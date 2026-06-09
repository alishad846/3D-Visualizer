import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

import {
  fetchProductById,
  fetchProductsForComparison,
  fetchRecommendedProducts,
} from "../../api/viewer";
import ProductCanvas from "../../components/product/viewer/canvas/ProductCanvas";
import ProductAssistantOverlay from "../../components/product/viewer/ProductAssistantOverlay";

const MAX_PRODUCTS = 4;
const MIN_PRODUCTS = 2;

function formatPrice(product) {
  if (product?.price == null || product?.price === "") return "Not listed";
  const amount = Number(product.price);
  if (Number.isNaN(amount)) return String(product.price);
  return `${product.currency || ""} ${amount.toLocaleString()}`.trim();
}

function normalizeSpecs(specs) {
  if (!Array.isArray(specs)) return [];
  return specs
    .map((spec) => ({
      key: spec?.key || spec?.name || spec?.label || "",
      value: spec?.value ?? "",
    }))
    .filter((spec) => spec.key && spec.value !== "");
}

function productModelUrl(product) {
  return product?.model_url || product?.modelUrl || "";
}

function productThumbnail(product) {
  return product?.thumbnail_url || product?.thumbnailUrl || "";
}

function toAssistantProduct(product) {
  if (!product) return null;
  return {
    id: product.id,
    name: product.name || "",
    category: product.category || "",
    brand: product.brand || "",
    tagline: product.tagline || "",
    description: product.description || "",
    price: product.price ?? null,
    currency: product.currency || "",
    features: Array.isArray(product.features) ? product.features : [],
    specifications: normalizeSpecs(product.specs),
  };
}

function ProductMiniView({ product }) {
  const modelUrl = productModelUrl(product);
  const thumbnail = productThumbnail(product);

  if (modelUrl) {
    return <ProductCanvas modelUrl={modelUrl} autoRotate enableZoom={false} />;
  }

  if (thumbnail) {
    return (
      <img
        src={thumbnail}
        alt={product.name}
        className="h-full w-full object-contain"
      />
    );
  }

  return (
    <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
      No model
    </div>
  );
}

function SelectedProductCard({
  product,
  index,
  canMoveLeft,
  canMoveRight,
  onRemove,
  onMove,
  onDragStart,
  onDrop,
}) {
  return (
    <article
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDrop(index)}
      className="group flex min-h-[360px] flex-col overflow-hidden rounded-lg border border-white/10 bg-[#07111f]/86 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl"
    >
      <div className="relative h-44 border-b border-white/10 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),rgba(2,6,23,0.96)_70%)]">
        <ProductMiniView product={product} />
        <div className="absolute left-3 top-3 rounded-md border border-white/10 bg-black/45 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
          Slot {index + 1}
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md border border-white/10 bg-black/45 p-1">
          <GripVertical size={15} className="text-slate-400" />
          <button
            type="button"
            onClick={() => onMove(index, index - 1)}
            disabled={!canMoveLeft}
            className="flex h-7 w-7 items-center justify-center rounded text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Move product left"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, index + 1)}
            disabled={!canMoveRight}
            className="flex h-7 w-7 items-center justify-center rounded text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Move product right"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 min-h-[86px]">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
            {product.brand || product.category || "Product"}
          </p>
          <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-white">
            {product.name}
          </h2>
          {product.tagline ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
              {product.tagline}
            </p>
          ) : null}
        </div>

        <div className="mb-4 rounded-md border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Price
          </p>
          <p className="mt-1 text-sm font-semibold text-white">{formatPrice(product)}</p>
        </div>

        <div className="mt-auto flex items-center gap-2">
          {product.buy_url ? (
            <a
              href={product.buy_url}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
            >
              <ShoppingCart size={16} />
              Buy Now
            </a>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-md border border-white/10 px-3 py-2.5 text-sm font-semibold text-slate-500">
              No buy link
            </div>
          )}
          <button
            type="button"
            onClick={() => onRemove(product.id)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-slate-300 transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-200"
            aria-label={`Remove ${product.name}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

function RecommendationCard({ product, selected, disabled, onAdd }) {
  return (
    <button
      type="button"
      draggable={!selected && !disabled}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", String(product.id));
      }}
      onClick={() => onAdd(product.id)}
      disabled={selected || disabled}
      className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-cyan-300/40 hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-55"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-white/10 bg-slate-950">
        {productThumbnail(product) ? (
          <img
            src={productThumbnail(product)}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-slate-500">
            3D
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{product.name}</p>
        <p className="truncate text-xs text-slate-400">
          {product.brand || product.category || formatPrice(product)}
        </p>
      </div>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 text-cyan-200">
        {selected ? <Check size={16} /> : <Plus size={16} />}
      </span>
    </button>
  );
}

export default function CompareProducts() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [productsById, setProductsById] = useState({});
  const [recommended, setRecommended] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantSessionId] = useState(() => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `compare-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  });

  useEffect(() => {
    let cancelled = false;

    async function loadCompareData() {
      if (!productId) return;
      setLoading(true);
      setError("");

      try {
        const [baseProduct, recommendationsResponse] = await Promise.all([
          fetchProductById(productId),
          fetchRecommendedProducts(productId, 8).catch(() => ({ products: [] })),
        ]);

        if (cancelled) return;

        const recommendationProducts = recommendationsResponse.products || [];
        const queryIds = (searchParams.get("products") || "")
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
          .slice(0, MAX_PRODUCTS);

        const seedIds = queryIds.length > 0
          ? queryIds
          : [baseProduct.id, ...recommendationProducts.map((item) => item.id)].slice(0, MIN_PRODUCTS);

        const compareResponse = seedIds.length > 0
          ? await fetchProductsForComparison(seedIds)
          : { products: [] };

        if (cancelled) return;

        const loadedProducts = [baseProduct, ...recommendationProducts, ...(compareResponse.products || [])];
        const nextById = loadedProducts.reduce((acc, product) => {
          if (product?.id) acc[String(product.id)] = product;
          return acc;
        }, {});

        const nextSelectedIds = seedIds
          .map((id) => String(id))
          .filter((id) => nextById[id])
          .slice(0, MAX_PRODUCTS);

        setProductsById(nextById);
        setRecommended(recommendationProducts);
        setSelectedIds(nextSelectedIds);
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load comparison.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCompareData();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    if (selectedIds.length === 0) return;
    setSearchParams({ products: selectedIds.join(",") }, { replace: true });
  }, [selectedIds, setSearchParams]);

  const selectedProducts = useMemo(
    () => selectedIds.map((id) => productsById[id]).filter(Boolean),
    [productsById, selectedIds]
  );

  const comparisonRows = useMemo(() => {
    const specKeys = new Map();
    selectedProducts.forEach((product) => {
      normalizeSpecs(product.specs).forEach((spec) => {
        const normalized = spec.key.trim().toLowerCase();
        if (!specKeys.has(normalized)) specKeys.set(normalized, spec.key);
      });
    });

    const baseRows = [
      {
        label: "Brand",
        getValue: (product) => product.brand || "Not specified",
      },
      {
        label: "Category",
        getValue: (product) => product.category || "Not specified",
      },
      {
        label: "Price",
        getValue: formatPrice,
      },
      {
        label: "Key features",
        getValue: (product) =>
          Array.isArray(product.features) && product.features.length > 0
            ? product.features.filter(Boolean).slice(0, 4).join(", ")
            : "Not specified",
      },
    ];

    const specRows = [...specKeys.entries()].map(([normalizedKey, label]) => ({
      label,
      getValue: (product) => {
        const spec = normalizeSpecs(product.specs).find(
          (item) => item.key.trim().toLowerCase() === normalizedKey
        );
        return spec?.value || "Not specified";
      },
    }));

    return [...baseRows, ...specRows];
  }, [selectedProducts]);

  const addProduct = (id) => {
    const normalizedId = String(id);
    if (selectedIds.includes(normalizedId) || selectedIds.length >= MAX_PRODUCTS) return;
    setSelectedIds((current) => [...current, normalizedId]);
  };

  const removeProduct = (id) => {
    setSelectedIds((current) => current.filter((item) => item !== String(id)));
  };

  const moveProduct = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= selectedIds.length || fromIndex === toIndex) return;
    setSelectedIds((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleDropOnSelection = (targetIndex) => {
    if (dragIndex == null) return;
    moveProduct(dragIndex, targetIndex);
    setDragIndex(null);
  };

  const handleDropRecommendation = (event) => {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain");
    addProduct(id);
  };

  const canAddMore = selectedIds.length < MAX_PRODUCTS;
  const hasMinimum = selectedIds.length >= MIN_PRODUCTS;
  const currentProduct = toAssistantProduct(selectedProducts[0]);

  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05070d]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                Public Comparison
              </p>
              <h1 className="truncate text-base font-semibold sm:text-lg">
                Compare Products
              </h1>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              to={`/viewer/${encodeURIComponent(productId)}`}
              className="hidden rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 sm:inline-flex"
            >
              Product Page
            </Link>
            <button
              type="button"
              onClick={() => setAssistantOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-cyan-300 px-3 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
            >
              <Bot size={16} />
              AI Assistant
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_330px]">
        <section className="min-w-0">
          <div className="mb-5 flex flex-col justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-cyan-200">
                {selectedIds.length}/{MAX_PRODUCTS} products selected
              </p>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-400">
                Add recommended products, remove any item, or drag cards to reorder the comparison.
              </p>
            </div>
            {!hasMinimum ? (
              <p className="rounded-md border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100">
                Add at least {MIN_PRODUCTS} products to compare.
              </p>
            ) : null}
          </div>

          {loading ? (
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-8 text-center text-sm text-slate-400">
              Loading comparison...
            </div>
          ) : error ? (
            <div className="rounded-lg border border-rose-400/25 bg-rose-500/10 p-8 text-center text-sm text-rose-100">
              {error}
            </div>
          ) : (
            <>
              <div
                className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDropRecommendation}
              >
                {selectedProducts.map((product, index) => (
                  <SelectedProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    canMoveLeft={index > 0}
                    canMoveRight={index < selectedProducts.length - 1}
                    onRemove={removeProduct}
                    onMove={moveProduct}
                    onDragStart={setDragIndex}
                    onDrop={handleDropOnSelection}
                  />
                ))}

                {canAddMore ? (
                  <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-6 text-center">
                    <div>
                      <Plus className="mx-auto mb-3 text-cyan-300" size={26} />
                      <p className="text-sm font-semibold text-white">Add another product</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        Choose from recommendations or drag one here.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <section className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-[#07111f]/86">
                <div className="border-b border-white/10 p-4">
                  <h2 className="text-lg font-semibold">Comparison Details</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Values are pulled from public product metadata and specifications.
                  </p>
                </div>

                {hasMinimum ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.035]">
                          <th className="w-48 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Metric
                          </th>
                          {selectedProducts.map((product) => (
                            <th key={product.id} className="px-4 py-3 text-left text-white">
                              <span className="line-clamp-1">{product.name}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonRows.map((row) => (
                          <tr key={row.label} className="border-b border-white/[0.06] last:border-b-0">
                            <td className="px-4 py-3 font-semibold text-slate-300">{row.label}</td>
                            {selectedProducts.map((product) => (
                              <td key={product.id} className="max-w-[260px] px-4 py-3 leading-relaxed text-slate-200">
                                {row.getValue(product)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-slate-400">
                    Select one more product to unlock the comparison table.
                  </div>
                )}
              </section>
            </>
          )}
        </section>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-lg border border-white/10 bg-[#07111f]/86 p-4 backdrop-blur-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Recommended Products</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Add up to {MAX_PRODUCTS} products for comparison.
                </p>
              </div>
              <span className="rounded-md border border-cyan-300/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
                Public
              </span>
            </div>

            <div className="space-y-2">
              {recommended.length > 0 ? (
                recommended.map((product) => (
                  <RecommendationCard
                    key={product.id}
                    product={product}
                    selected={selectedIds.includes(String(product.id))}
                    disabled={!canAddMore}
                    onAdd={addProduct}
                  />
                ))
              ) : (
                <div className="rounded-md border border-white/10 bg-white/[0.035] p-4 text-sm text-slate-400">
                  No recommendations are available for this product yet.
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>

      {assistantOpen ? (
        <div className="fixed inset-0 z-[70] flex justify-end bg-black/45 p-2 sm:p-4 backdrop-blur-sm">
          <div className="relative h-full w-full max-w-[420px]">
            {currentProduct ? (
              <ProductAssistantOverlay
                open={assistantOpen}
                onClose={() => setAssistantOpen(false)}
                product={currentProduct}
                sessionId={assistantSessionId}
              />
            ) : (
              <div className="flex h-full flex-col rounded-lg border border-white/10 bg-[#07111f] p-4 text-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-base font-semibold">AI Assistant</h2>
                  <button
                    type="button"
                    onClick={() => setAssistantOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-slate-300 transition hover:bg-white/10"
                    aria-label="Close AI assistant"
                  >
                    <X size={17} />
                  </button>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">
                  Add a product first, then ask the assistant about it.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
