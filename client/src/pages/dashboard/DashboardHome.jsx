import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/workspaceStore';
import {
  FolderSync,
  Plus,
  Layers,
  ChevronRight,
  Cpu,
  Package,
  CheckCircle2
} from 'lucide-react';

function relativeTime(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Created today';
  if (days === 1) return 'Created yesterday';
  return `Created ${days} days ago`;
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const {
    projects,
    loadingProjects,
    products,
    activeProject,
    setActiveProject,
    error
  } = useWorkspaceStore();

  // Real derived stats
  const publishedProducts = products.filter(p => p.is_published).length;
  const draftProducts = products.filter(p => !p.is_published).length;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loadingProjects) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full border-[3px] border-slate-700 border-b-[#00F0FF] w-10 h-10" />
        <p className="mt-4 text-slate-400 text-sm font-medium">Loading workspace...</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-[#11192b]/50 border border-red-500/20 rounded-2xl p-8 text-center max-w-xl mx-auto">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Dashboard</h2>
        <p className="text-slate-400 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-[#00F0FF] text-[#050b14] font-black py-2.5 px-6 rounded-xl hover:bg-[#00D8E6] transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative pb-16">

      {/* Stats Summary row — all real data */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

        {/* Total Projects */}
        <div className="bg-[#0c1324] border border-[#00F0FF]/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(0,240,255,0.06)] relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#00F0FF]/10 text-[#00F0FF] rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            {projects.length > 0 && (
              <span className="text-xs font-semibold text-[#10b981] bg-[#10b981]/15 px-2.5 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">Total Projects</p>
          <h3 className="text-3xl font-black text-white">{projects.length}</h3>
        </div>

        {/* Products in active project */}
        <div className="bg-[#0c1324] border border-[#1e2e4f] hover:border-[#00F0FF]/20 rounded-2xl p-6 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
            {activeProject ? `Products in "${activeProject.name}"` : 'Products'}
          </p>
          <h3 className="text-3xl font-black text-white">
            {activeProject ? products.length : '—'}
          </h3>
          {activeProject && (
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">
              {publishedProducts} published · {draftProducts} draft
            </p>
          )}
        </div>

        {/* Published products */}
        <div className="bg-[#0c1324] border border-[#1e2e4f] hover:border-[#00F0FF]/20 rounded-2xl p-6 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#10b981]/10 text-[#10b981] rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">Published Products</p>
          <h3 className="text-3xl font-black text-[#10b981]">
            {activeProject ? publishedProducts : '—'}
          </h3>
          {!activeProject && (
            <p className="text-[10px] text-slate-600 mt-1 font-semibold">Select a project to view</p>
          )}
        </div>

        {/* System Status */}
        <div className="bg-[#0c1324] border border-[#1e2e4f] hover:border-[#00F0FF]/20 rounded-2xl p-6 transition-all flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">System Status</span>
              <div className="p-2 bg-[#00F0FF]/5 text-[#00F0FF] rounded-lg">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <h3 className="text-sm font-bold text-slate-100">Database Connected</h3>
            </div>
          </div>
          <div className="w-full bg-[#16223b] h-1 rounded-full overflow-hidden">
            <div className="w-full bg-gradient-to-r from-[#00F0FF] to-[#0055FF] h-full rounded-full shadow-[0_0_10px_rgba(0,240,255,0.6)]" />
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-100">My Projects</h2>
            <p className="text-xs text-slate-400 mt-1">
              Click a project to switch to it and manage its products.
            </p>
          </div>
          <button
            onClick={() => navigate('/add-project')}
            className="bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/20 font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#0a101d]/60 rounded-2xl border border-dashed border-[#1e2e4f]/75 max-w-md mx-auto my-4">
            <FolderSync className="w-12 h-12 text-slate-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-white mb-1">No Projects Found</h3>
            <p className="text-slate-400 text-xs mb-6 max-w-xs mx-auto leading-relaxed">
              You haven't created any workspaces yet. Create a project to start grouping and organizing your products.
            </p>
            <button
              onClick={() => navigate('/add-project')}
              className="bg-[#00F0FF] hover:bg-[#00D8E6] text-[#050b14] font-black py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            >
              Create First Project
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1a253c] text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pt-1">Project</th>
                  <th className="pb-3 pt-1 hidden md:table-cell">Description</th>
                  <th className="pb-3 pt-1">Created</th>
                  <th className="pb-3 pt-1 w-10" />
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const isActive = activeProject?.id === project.id;
                  return (
                    <tr
                      key={project.id}
                      onClick={() => {
                        setActiveProject(project);
                        navigate('/dashboard/products');
                      }}
                      className={`border-b border-[#16223b]/50 text-slate-300 transition-all duration-150 group cursor-pointer ${
                        isActive ? 'bg-[#0f1a2e]' : 'hover:bg-[#11192b]/40'
                      }`}
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 border rounded-xl flex items-center justify-center transition-all ${
                            isActive
                              ? 'bg-[#00F0FF]/10 border-[#00F0FF]/30 text-[#00F0FF]'
                              : 'bg-[#11192b] border-[#1d2d4a] text-slate-400 group-hover:border-[#00F0FF]/20'
                          }`}>
                            <FolderSync className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white leading-tight">
                              {project.name}
                            </p>
                            {isActive && (
                              <span className="text-[9px] font-black text-[#00F0FF] uppercase tracking-wider">
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-semibold text-slate-400 max-w-xs truncate hidden md:table-cell">
                        {project.description || (
                          <span className="text-slate-600 italic">No description</span>
                        )}
                      </td>
                      <td className="py-4 text-xs text-slate-500 font-semibold">
                        {relativeTime(project.created_at)}
                      </td>
                      <td className="py-4 text-center">
                        <ChevronRight className={`w-4 h-4 mx-auto transition-colors ${
                          isActive ? 'text-[#00F0FF]' : 'text-slate-600 group-hover:text-slate-400'
                        }`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}