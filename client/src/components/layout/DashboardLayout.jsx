import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { View, LayoutDashboard, Plus, Box, Settings, LogOut, ChevronLeft, Bell, Search, User } from 'lucide-react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Plus, label: 'New Model', path: '/dashboard/new' },
    { icon: Box, label: 'My Models', path: '/dashboard/models' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <div className="h-screen w-screen bg-[#020202] text-white flex overflow-hidden font-sans">

      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="h-full bg-[#050505] border-r border-white/5 flex flex-col shrink-0 relative z-10"
      >
        {/* Logo */}
        <div className="p-5 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F0FF] to-[#0055FF] flex items-center justify-center shrink-0">
            <View className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-lg font-display font-bold tracking-wider whitespace-nowrap">
                SCAN<span className="text-[#00F0FF]">VISTA</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${isActive
                    ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20'
                    : 'text-[#888] hover:text-white hover:bg-white/5'
                  }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#00F0FF]' : ''}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 space-y-1.5 border-t border-white/5">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#888] hover:text-white hover:bg-white/5 transition-all text-sm"
          >
            <ChevronLeft className={`w-5 h-5 shrink-0 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && <span>Collapse</span>}
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#888] hover:text-red-400 hover:bg-red-500/5 transition-all text-sm"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <header className="h-16 border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl flex items-center justify-between px-8 shrink-0">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
            <input
              type="text"
              placeholder="Search models, projects..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
              <Bell className="w-4 h-4 text-[#888]" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00F0FF] rounded-full" />
            </button>
            <div className="flex items-center gap-3 px-3 py-2 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#0055FF] flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-[#ccc]">User</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto hidden-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
