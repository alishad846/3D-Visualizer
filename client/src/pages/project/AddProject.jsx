import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutGrid, CheckCircle } from 'lucide-react';
import { createProject } from '../../api/projects';

export default function AddProject() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createProject({ name: name.trim(), description: description.trim() });
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071018] text-white overflow-x-hidden relative flex flex-col justify-between">
      {/* Dynamic Aesthetic Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,#0f2c3d,transparent_55%)]" />
        <div className="absolute top-20 left-20 w-[420px] h-[420px] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-cyan-400/5 blur-[120px] rounded-full" />
      </div>

      {/* Header Bar */}
      <header className="sticky top-0 z-50 border-b border-cyan-400/10 bg-[#071018]/70 backdrop-blur-2xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white flex items-center justify-center border border-white/5"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-11 h-11 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 text-xl font-black shadow-[0_0_20px_rgba(34,211,238,0.15)]">
              P
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Create Project</h1>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">ScanVista Hub</p>
            </div>
          </div>
        </div>
      </header>

      {/* Form Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
        <div className="bg-[#0b121e]/80 border border-[#1e2e4f] rounded-2xl p-8 md:p-10 shadow-2xl backdrop-blur-md relative overflow-hidden">
          
          {success ? (
            <div className="py-8 text-center flex flex-col items-center justify-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-[#10b981]/15 text-[#10b981] rounded-full flex items-center justify-center border border-[#10b981]/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white">Project Created!</h3>
              <p className="text-slate-400 text-sm">Redirecting to your workspace dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Configure Workspace</h2>
                <p className="text-slate-400 text-sm">Create a dedicated project workspace to group and organize your assets.</p>
              </div>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold animate-shake">
                  {error}
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Project Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Summer Launch 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  maxLength={150}
                  className="w-full bg-[#0c1324] border border-[#1d2d4a] rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all disabled:opacity-50"
                  required
                />
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Description
                </label>
                <textarea
                  placeholder="Describe the scope, assets, and goals of this project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  rows={4}
                  className="w-full bg-[#0c1324] border border-[#1d2d4a] rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all disabled:opacity-50 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-[#1e2e4f]/30">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                  className="flex-1 bg-[#11192b] border border-[#1d2d4a] text-slate-300 hover:text-white font-semibold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 hover:bg-[#1a263f]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-black font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.35)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Save Project'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#1e2e4f]/10 text-center text-xs font-semibold text-slate-600">
        <p>© 2026 ScanVista Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
