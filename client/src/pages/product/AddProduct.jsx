import { useEffect, useState } from "react";
import { Bell, HelpCircle, ChevronDown } from "lucide-react";
import ProductForm from "../../components/product/ProductForm";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useAuthStore } from "../../store/authStore";

const STEPS = [
  {
    id: "s-identity",
    label: "Identity",
    sub: "Name, brand, category",
  },
  {
    id: "s-assets",
    label: "Visual Assets",
    sub: "3D model, images",
  },
  {
    id: "s-highlights",
    label: "Highlights",
    sub: "Key features",
  },
  {
    id: "s-specs",
    label: "Specifications",
    sub: "Technical details",
  },
  {
    id: "s-commerce",
    label: "Commerce",
    sub: "Price, buy link",
  },
  {
    id: "s-qr",
    label: "QR Settings",
    sub: "Public URL and QR generation",
  },
];

export default function AddProduct() {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");

  const { activeProject, projects, fetchProjects, setActiveProject } = useWorkspaceStore();
  const user = useAuthStore((state) => state.user);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((segment) => segment[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "CV";

  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects();
    }
  }, [projects.length, fetchProjects]);

  const scrollToSection = (index) => {
    const element = document.getElementById(STEPS[index].id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setActiveStep(index);
    }
  };

  useEffect(() => {
    const observers = [];

    STEPS.forEach((step, index) => {
      const element = document.getElementById(step.id);

      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveStep(index);
          }
        },
        {
          threshold: 0.3,
          rootMargin: "-80px 0px -60% 0px",
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#070f18] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-cyan-400/10 bg-[#071018]/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-2xl font-black text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.15)]">
              S
            </div>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                  ScanVista Creator Side
                </p>
                <h1 className="text-xl font-bold">Add Product</h1>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProjectDropdownOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#071018]/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/30 hover:bg-white/10"
                >
                  <span className="truncate max-w-[140px] text-left">
                    {activeProject?.name || "Select project"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-300" />
                </button>

                {projectDropdownOpen && (
                  <div className="absolute left-0 z-50 mt-2 w-[320px] overflow-hidden rounded-3xl border border-[#1d2d4a] bg-[#070f18] shadow-[0_20px_80px_rgba(0,0,0,0.4)]">
                    <div className="border-b border-[#1d2d4a] p-3">
                      <input
                        value={projectSearch}
                        onChange={(event) => setProjectSearch(event.target.value)}
                        placeholder="Search projects..."
                        className="w-full rounded-2xl border border-[#1d2d4a] bg-[#071018]/90 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="max-h-64 space-y-1 overflow-y-auto p-2">
                      {projects.filter((project) =>
                        project.name
                          .toLowerCase()
                          .includes(projectSearch.toLowerCase())
                      ).map((project) => (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => {
                            setActiveProject(project);
                            setProjectDropdownOpen(false);
                            setProjectSearch("");
                          }}
                          className="w-full rounded-2xl px-3 py-2 text-left text-sm font-medium text-slate-100 transition hover:bg-white/5"
                        >
                          {project.name}
                        </button>
                      ))}
                      {projects.length === 0 && (
                        <p className="px-3 py-4 text-center text-sm text-slate-500">
                          No projects available.
                        </p>
                      )}
                    </div>
                    <div className="border-t border-[#1d2d4a] p-3">
                      <a
                        href="/add-project"
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                      >
                        New project
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#071018]/80 text-slate-100 transition hover:border-cyan-400/30 hover:bg-white/10">
              <Bell className="h-5 w-5" />
            </button>
            <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#071018]/80 text-slate-100 transition hover:border-cyan-400/30 hover:bg-white/10">
              <HelpCircle className="h-5 w-5" />
            </button>
            <button className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#071018]/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/30 hover:bg-white/10">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0f172a] text-sm font-bold text-cyan-300">
                {initials}
              </span>
              <span className="hidden sm:block text-left">
                <span className="block text-sm font-semibold text-white">
                  {user?.name?.split(" ")[0] || "Creator"}
                </span>
                <span className="block text-xs text-slate-400">Creator</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="px-4 py-8">
        <div className="mx-auto flex max-w-[1500px] gap-8">
          {/* Sidebar */}
          <aside className="sticky top-[88px] h-fit w-[280px] min-w-[280px] self-start rounded-3xl border border-white/10 bg-[#07121f] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Creator workflow
              </p>

              <h2 className="mt-3 text-2xl font-bold text-white">
                Product timeline
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Navigate each section and keep progress visible while building
                the product page.
              </p>
            </div>

            <div className="space-y-4">
              {STEPS.map((step, index) => {
                const isActive = activeStep === index;
                const isCompleted = completedSteps.includes(index);

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => scrollToSection(index)}
                    className={`group w-full rounded-3xl border px-4 py-4 text-left transition duration-200 ${
                      isActive
                        ? "border-cyan-400 bg-cyan-400/10 text-white shadow-[0_0_20px_rgba(34,211,238,0.12)]"
                        : isCompleted
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/30 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                        {step.label}
                      </span>

                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                          isCompleted
                            ? "bg-emerald-500 text-black"
                            : isActive
                            ? "bg-cyan-400 text-black"
                            : "bg-white/10 text-slate-400"
                        }`}
                      >
                        {isCompleted ? "✓" : index + 1}
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] leading-5 text-slate-500">
                      {step.sub}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Hero Card */}
            <div className="mb-6 rounded-3xl border border-white/10 bg-[#07121f] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                    Add Product
                  </p>

                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
                    Build a better product experience
                  </h2>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  <p className="font-semibold text-slate-100">Progress</p>

                  <p className="mt-1 text-xs text-slate-400">
                    {completedSteps.length}/{STEPS.length} sections completed
                  </p>
                </div>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
                Complete the guided sections to create a structured product
                experience and generate a live public QR destination.
              </p>
            </div>

            {/* Form Card */}
            <div className="rounded-3xl border border-white/10 bg-[#07121f] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
              <ProductForm
                onStepComplete={(stepIndex) => {
                  setCompletedSteps((prev) =>
                    prev.includes(stepIndex)
                      ? prev
                      : [...prev, stepIndex]
                  );
                }}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}