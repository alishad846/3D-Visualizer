import { useEffect, useRef } from "react";
import { useState } from "react";
import ProductForm from "../../components/product/ProductForm";

const STEPS = [
  { id: "s-identity",    label: "Identity",       sub: "Name, brand, category" },
  { id: "s-assets",      label: "Visual Assets",  sub: "3D model, images"      },
  { id: "s-highlights",  label: "Highlights",     sub: "Key features"          },
  { id: "s-specs",       label: "Specifications", sub: "Technical details"     },
  { id: "s-commerce",    label: "Commerce",       sub: "Price, buy link"       },
  { id: "s-qr",          label: "QR Settings",    sub: "Label, public URL"     },
];

export default function AddProduct() {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const scrollToSection = (index) => {
    const el = document.getElementById(STEPS[index].id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveStep(index);
    }
  };

  // Track which section is in view using IntersectionObserver
  useEffect(() => {
    const observers = [];
    STEPS.forEach((step, index) => {
      const el = document.getElementById(step.id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveStep(index);
        },
        { threshold: 0.3, rootMargin: "-80px 0px -60% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className="flex min-h-screen bg-[#070f18]">

      {/* ── LEFT STEP SIDEBAR ── */}
      <aside className="w-[200px] min-w-[200px] sticky top-0 h-screen overflow-y-auto px-5 pt-8 pb-8 border-r border-white/[0.06]">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-white leading-tight">Add Product</h1>
          <p className="text-[11px] text-slate-500 mt-1">Complete all sections</p>
        </div>

        <div className="flex flex-col">
          {STEPS.map((step, index) => {
            const isActive    = activeStep === index;
            const isDone      = completedSteps.includes(index);
            const isLast      = index === STEPS.length - 1;

            return (
              <div
                key={step.id}
                className="flex gap-3 cursor-pointer group"
                onClick={() => scrollToSection(index)}
              >
                {/* Track */}
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center
                      flex-shrink-0 mt-[2px] transition-all duration-200 text-[8px] font-bold
                      ${isDone
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : isActive
                          ? "border-cyan-400 bg-cyan-400 text-black"
                          : "border-white/10 bg-[#070f18] text-transparent"
                      }
                    `}
                  >
                    {isDone ? "✓" : ""}
                  </div>
                  {!isLast && (
                    <div
                      className={`
                        w-[1.5px] my-[3px] flex-1 min-h-[26px] transition-colors duration-200
                        ${isDone ? "bg-emerald-500/40" : isActive ? "bg-cyan-400/30" : "bg-white/[0.07]"}
                      `}
                    />
                  )}
                </div>

                {/* Label */}
                <div className="pb-[2px] pt-[1px] mb-1">
                  <div
                    className={`
                      text-[12px] font-medium leading-tight transition-colors duration-150
                      ${isDone ? "text-emerald-400"
                        : isActive ? "text-cyan-400 font-semibold"
                        : "text-slate-500 group-hover:text-slate-300"}
                    `}
                  >
                    {step.label}
                  </div>
                  <div className="text-[10px] text-slate-600 mt-[2px]">{step.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── MAIN FORM ── */}
      <main className="flex-1 overflow-y-auto">
        <ProductForm
          onStepComplete={(stepIndex) =>
            setCompletedSteps((prev) =>
              prev.includes(stepIndex) ? prev : [...prev, stepIndex]
            )
          }
        />
      </main>

    </div>
  );
}