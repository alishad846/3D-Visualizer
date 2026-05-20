import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Heart, 
  Layers, 
  BarChart3, 
  Star, 
  Settings, 
  Search, 
  Bell, 
  HelpCircle, 
  Plus,
  Menu,
  X,
  Rocket
} from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: User, label: 'Profile', path: '/dashboard/profile' },
    { icon: Heart, label: 'Favorites', path: '/dashboard/favorites' },
    { icon: Layers, label: 'Contents', path: '/dashboard/products' }, // Maps to products
    { icon: BarChart3, label: 'Analysis', path: '/dashboard/project-view' }, // Maps to project-view / analytics
    { icon: Star, label: 'Stars', path: '/dashboard/stars' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  const handleNewProject = () => {
    navigate('/add-product');
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
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group ${
                    isActive 
                      ? 'text-[#00F0FF] bg-[#00F0FF]/5 font-semibold' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {/* Active highlight line on the left */}
                  {isActive && (
                    <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-[#00F0FF] rounded-r" />
                  )}
                  <item.icon className={`w-[18px] h-[18px] transition-colors ${
                    isActive ? 'text-[#00F0FF]' : 'text-slate-400 group-hover:text-slate-200'
                  }`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-6">
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
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80" 
              alt="Alex Chen" 
              className="w-10 h-10 rounded-full object-cover border border-[#00F0FF]/25 shadow-[0_0_10px_rgba(0,240,255,0.1)]"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-100 truncate">Alex Chen</p>
              <p className="text-xs text-slate-500 truncate">alex.c@scanvista.io</p>
            </div>
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

              <nav className="space-y-1" onClick={() => setMobileMenuOpen(false)}>
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group ${
                        isActive 
                          ? 'text-[#00F0FF] bg-[#00F0FF]/5 font-semibold' 
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-[#00F0FF] rounded-r" />
                      )}
                      <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-[#00F0FF]' : 'text-slate-400'}`} />
                      {item.label}
                    </Link>
                  );
                })}
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
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80" 
                  alt="Alex Chen" 
                  className="w-10 h-10 rounded-full object-cover border border-[#00F0FF]/25"
                />
                <div>
                  <p className="text-sm font-bold text-slate-100">Alex Chen</p>
                  <p className="text-xs text-slate-500">alex.c@scanvista.io</p>
                </div>
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
              {location.pathname === '/dashboard/project-view' && 'Deep Analysis'}
              {location.pathname === '/dashboard' && 'Creator Side'}
            </h1>

            {/* Search Pill Input */}
            <div className="relative max-w-md w-full md:ml-4">
              <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="w-full bg-[#11192b] border border-[#1d2d4a] rounded-full pl-11 pr-5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all"
              />
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