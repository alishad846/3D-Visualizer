import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logoutUser } from '../../api/auth';
import { useWorkspaceStore } from '../../store/workspaceStore';
import {
  LayoutDashboard,
  User,
  Heart,
  Layers,
  Settings,
  Search,
  Bell,
  HelpCircle,
  Plus,
  Menu,
  X,
  Rocket,
  LogOut,
  ChevronDown,
  UploadCloud,
  Trash2,
} from 'lucide-react';
import { fetchDeletedProjects } from '../../api/projects';
import { fetchDeletedProducts } from '../../api/products';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const {
    projects,
    activeProject,
    products,
    activeProduct,
    fetchProjects,
    setActiveProject,
    setActiveProduct
  } = useWorkspaceStore();

  const [projectSearch, setProjectSearch] = useState('');
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [trashCount, setTrashCount] = useState(0);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Fetch trash count to show badge
  useEffect(() => {
    Promise.all([fetchDeletedProjects(), fetchDeletedProducts()])
      .then(([proj, prod]) => setTrashCount(proj.length + prod.length))
      .catch(() => {}); // silent fail — badge is cosmetic
  }, []);

  const displayName = user?.name || 'User';
  const displayEmail = user?.email || '';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0b101e&color=00F0FF&bold=true&size=80`;

  const handleLogout = async () => {
    await logoutUser();
    clearAuth();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Heart, label: 'Favorites', path: '/dashboard/favorites' },
    { icon: Layers, label: 'Products', path: '/dashboard/products' },
    { icon: UploadCloud, label: 'Incomplete Models', path: '/dashboard/incomplete-models' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    { icon: Trash2, label: 'Trash', path: '/dashboard/trash', badge: trashCount },
  ];
  const isProductAnalysisActive = location.pathname === '/dashboard/analytics';

  const handleNewProject = () => {
    navigate('/add-project');
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-white font-sans flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0b101e] border-r border-[#1a253c] shrink-0 sticky top-0 h-screen justify-between p-6">
        <div>
          {/* Logo Section */}
          <div className="mb-8 flex flex-col">
            <span className="text-2xl font-black tracking-wider text-[#00F0FF] font-display">
              ScanVista
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#00F0FF]/60 font-semibold mt-0.5">
              Creator Pro
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group ${isActive
                      ? 'text-[#00F0FF] bg-[#00F0FF]/5 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {/* Active highlight line on the left */}
                  {isActive && (
                    <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-[#00F0FF] rounded-r" />
                  )}
                  <item.icon className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-[#00F0FF]' : 'text-slate-400 group-hover:text-slate-200'
                    }`} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full leading-none">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Analytics tree group */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setAnalyticsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <span>Analytics</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${analyticsOpen ? 'rotate-180' : 'rotate-0'}`}
                />
              </button>
              {analyticsOpen && (
                <div className="pl-5 mt-2 space-y-1">
                  <Link
                    to="/dashboard/analytics"
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                      isProductAnalysisActive
                        ? 'text-[#00F0FF] bg-[#00F0FF]/5 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isProductAnalysisActive && (
                      <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-[#00F0FF] rounded-r" />
                    )}
                    Product Analysis
                  </Link>
                  <Link
                    to="/dashboard/analytics/project"
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                      location.pathname === '/dashboard/analytics/project'
                        ? 'text-[#00F0FF] bg-[#00F0FF]/5 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {location.pathname === '/dashboard/analytics/project' && (
                      <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-[#00F0FF] rounded-r" />
                    )}
                    Project Analysis
                  </Link>
                </div>
              )}
            </div>

            {/* Create product tree group */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCreateProductOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <span>Create product</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${createProductOpen ? 'rotate-180' : 'rotate-0'}`}
                />
              </button>
              {createProductOpen && (
                <div className="pl-5 mt-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => navigate('/add-product')}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/5"
                  >
                    Single product
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/bulk-import')}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/5"
                  >
                    Upload from CSV or Excel file
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-3">

          {/* Upgrade Plan Card */}
          <button
            className="w-full bg-[#00F0FF] hover:bg-[#00D8E6] text-[#050b14] font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.35)] transform hover:-translate-y-0.5"
            onClick={() => alert('Upgrade to Creator Pro coming soon!')}
          >
            <Rocket className="w-4 h-4 fill-current" />
            <span className="text-xs uppercase tracking-wider">Upgrade Plan</span>
          </button>

          {/* User Profile Block */}
          <div className="flex items-center gap-3 pt-4 border-t border-[#1a253c]">
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover border border-[#00F0FF]/25 shadow-[0_0_10px_rgba(0,240,255,0.1)]"
            />
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-slate-100 truncate">{displayName}</p>
              <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative flex flex-col w-64 bg-[#0b101e] border-r border-[#1a253c] h-full p-6 justify-between animate-slide-in">
            <button
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="mb-8 flex flex-col">
                <span className="text-2xl font-black tracking-wider text-[#00F0FF] font-display">
                  ScanVista
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#00F0FF]/60 font-semibold mt-0.5">
                  Creator Pro
                </span>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group ${isActive
                          ? 'text-[#00F0FF] bg-[#00F0FF]/5 font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-[#00F0FF] rounded-r" />
                      )}
                      <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-[#00F0FF]' : 'text-slate-400'}`} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge > 0 && (
                        <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full leading-none">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setAnalyticsOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                  >
                    <span>Analytics</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${analyticsOpen ? 'rotate-180' : 'rotate-0'}`}
                    />
                  </button>
                  {analyticsOpen && (
                    <div className="pl-5 mt-2 space-y-1">
                      <Link
                        to="/dashboard/analytics"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                          isProductAnalysisActive
                            ? 'text-[#00F0FF] bg-[#00F0FF]/5 font-semibold'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {isProductAnalysisActive && (
                          <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-[#00F0FF] rounded-r" />
                        )}
                        Product Analysis
                      </Link>
                      <Link
                        to="/dashboard/analytics/project"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                          location.pathname === '/dashboard/analytics/project'
                            ? 'text-[#00F0FF] bg-[#00F0FF]/5 font-semibold'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {location.pathname === '/dashboard/analytics/project' && (
                          <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-[#00F0FF] rounded-r" />
                        )}
                        Project Analysis
                      </Link>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateProductOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                  >
                    <span>Create product</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${createProductOpen ? 'rotate-180' : 'rotate-0'}`}
                    />
                  </button>
                  {createProductOpen && (
                    <div className="pl-5 mt-2 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate('/add-product');
                        }}
                        className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/5"
                      >
                        Add Manually
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate('/bulk-import');
                        }}
                        className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/5"
                      >
                        Import from file (.csv or .xlsx)
                      </button>
                    </div>
                  )}
                </div>
              </nav>
            </div>

            <div className="space-y-6">
              <button
                className="w-full bg-[#00F0FF] text-[#050b14] font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                onClick={() => {
                  setMobileMenuOpen(false);
                  alert('Upgrade to Creator Pro coming soon!');
                }}
              >
                <Rocket className="w-4 h-4 fill-current" />
                <span className="text-xs uppercase tracking-wider">Upgrade Plan</span>
              </button>

              <div className="flex items-center gap-3 pt-4 border-t border-[#1a253c]">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover border border-[#00F0FF]/25"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-100">{displayName}</p>
                  <p className="text-xs text-slate-500">{displayEmail}</p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-20 bg-[#070b13]/80 backdrop-blur-md border-b border-[#1a253c] sticky top-0 z-40 px-6 lg:px-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Hamburger for mobile */}
            <button
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Title */}
            <h1 className="text-xl font-bold tracking-tight text-white hidden md:block shrink-0">
              {location.pathname === '/dashboard/profile' && 'Profile Settings'}
              {location.pathname === '/dashboard/favorites' && 'Favorites'}
              {location.pathname === '/dashboard/products' && 'Asset Library'}
              {location.pathname === '/dashboard/incomplete-models' && 'Incomplete Models'}
              {location.pathname === '/dashboard/project-view' && 'Deep Analysis'}
              {location.pathname === '/dashboard' && 'Creator Side'}
              {location.pathname === '/dashboard/analytics' && 'Product Analysis'}
              {location.pathname === '/dashboard/analytics/project' && 'Project Analysis'}
              {location.pathname === '/dashboard/trash' && 'Recently Deleted'}
            </h1>

            {/* WORKSPACE SWITCHER */}
            <div className="flex items-center gap-2 md:ml-4 select-none">
              {/* Project Select */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProjectDropdownOpen(!projectDropdownOpen);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#1d2d4a] hover:border-[#00F0FF]/40 bg-[#11192b]/80 hover:bg-[#1a263f]/60 transition-all text-xs font-bold text-slate-200 cursor-pointer"
                >
                  <span className="text-[#00F0FF]"></span>
                  <span className="truncate max-w-[90px] sm:max-w-[130px]">
                    {activeProject ? activeProject.name : 'Select Project'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {projectDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-[#0c1324] border border-[#1d2d4a] rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                    <div className="p-3 border-b border-[#1a2c4d]/50">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search projects..."
                          value={projectSearch}
                          onChange={(e) => setProjectSearch(e.target.value)}
                          className="w-full bg-[#11192b] border border-[#1d2d4a] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00F0FF] transition-all"
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto p-1.5 space-y-0.5">
                      {projects
                        .filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase()))
                        .map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setActiveProject(p);
                              setProjectDropdownOpen(false);
                              setProjectSearch('');
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                              activeProject?.id === p.id 
                                ? 'bg-[#1c2a44] text-[#00F0FF]' 
                                : 'text-slate-300 hover:bg-white/5'
                            }`}
                          >
                            <span className="truncate">{p.name}</span>
                            {activeProject?.id === p.id && <span className="text-[#00F0FF]">✓</span>}
                          </button>
                        ))}
                      {projects.length === 0 && (
                        <p className="text-[11px] text-slate-500 text-center py-4">No projects found</p>
                      )}
                    </div>
                    <div className="p-2 border-t border-[#1d2d4a] bg-[#11192b]/50">
                      <button
                        type="button"
                        onClick={() => {
                          setProjectDropdownOpen(false);
                          navigate('/add-project');
                        }}
                        className="w-full py-2 rounded-xl bg-[#00F0FF]/10 hover:bg-[#00F0FF]/25 text-[#00F0FF] border border-[#00F0FF]/20 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> New Project
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Product selector removed — project dashboard should not switch products */}
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-3 lg:gap-4 shrink-0">
            {/* Notifications */}
            <button className="relative bg-[#11192b] border border-[#1d2d4a] text-slate-300 hover:text-white p-2.5 rounded-full hover:bg-[#1a263f] transition-all">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 bg-[#00F0FF] w-2 h-2 rounded-full shadow-[0_0_6px_rgba(0,240,255,0.8)]" />
            </button>

            {/* Help */}
            <button className="bg-[#11192b] border border-[#1d2d4a] text-slate-300 hover:text-white p-2.5 rounded-full hover:bg-[#1a263f] transition-all">
              <HelpCircle className="w-[18px] h-[18px]" />
            </button>

            {/* + New Project Button */}
            <button
              onClick={handleNewProject}
              className="bg-[#00F0FF] hover:bg-[#00D8E6] text-[#050b14] font-black py-2.5 px-5 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              <span className="hidden sm:inline">New Project</span>
            </button>
          </div>
        </header>

        {/* Dynamic Nested Route Content */}
        <main className="flex-1 p-6 lg:p-10 max-w-[1600px] w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}