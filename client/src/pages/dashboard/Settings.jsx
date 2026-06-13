import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { 
  User, 
  Shield, 
  Settings as SettingsIcon,
  LogOut,
  Key,
  Monitor,
  Smartphone,
  Laptop,
  Check,
  Edit2,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  changePassword, 
  updateTwoFactor, 
  getSessions, 
  logoutAllSessions, 
  logoutSession,
  updateProfile
} from '../../api/auth';

// Custom Toggle Component
const Toggle = ({ enabled, onChange }) => (
  <button 
    onClick={() => onChange(!enabled)}
    className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${
      enabled ? 'bg-[#00F0FF]' : 'bg-slate-700'
    }`}
  >
    <div 
      className={`w-4 h-4 rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-0'
      }`} 
    />
  </button>
);

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Profile');
  const [toastMessage, setToastMessage] = useState('');

  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const profileAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Creator')}&background=0b101e&color=00F0FF&bold=true&size=200`;

  // --- Profile State ---
  const [profileData, setProfileData] = useState({
    fullName: user?.name || 'Creator',
    email: user?.email || '',
    avatar: profileAvatar
  });
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.name || 'Creator',
        email: user.email || '',
        avatar: user.avatar || profileAvatar
      });
    }
  }, [user, profileAvatar]);

  const handleProfileSave = async () => {
    try {
      const data = await updateProfile({
        name: profileData.fullName,
        email: profileData.email,
        avatar: profileData.avatar
      });
      
      if (accessToken && typeof setAuth === 'function') {
        setAuth(accessToken, data.user);
      }
      showToast('Profile updated permanently in database!');
    } catch (err) {
      showToast(err.message || 'Failed to update profile');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData({ ...profileData, avatar: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Security State ---
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactor, setTwoFactor] = useState(() => {
    return localStorage.getItem('scanvista-settings-2fa') === 'true';
  });

  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (activeTab === 'Security') {
      getSessions()
        .then(setSessions)
        .catch(err => console.error('Failed to load sessions:', err));
    }
  }, [activeTab]);

  const handlePasswordUpdate = async () => {
    if (!passwords.current) {
      showToast('Please enter your current password');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      showToast('New passwords do not match!');
      return;
    }
    if (passwords.new.length < 8) {
      showToast('Password must be at least 8 characters!');
      return;
    }
    try {
      await changePassword(passwords.current, passwords.new);
      showToast('Password updated successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      showToast(err.message || 'Failed to update password');
    }
  };

  const handleTwoFactorToggle = async (val) => {
    try {
      await updateTwoFactor(val);
      setTwoFactor(val);
      localStorage.setItem('scanvista-settings-2fa', val);
      showToast(`Two-Factor Auth ${val ? 'Enabled' : 'Disabled'}`);
    } catch (err) {
      showToast(err.message || 'Failed to update 2FA');
    }
  };

  const logoutOtherSessions = async () => {
    try {
      await logoutAllSessions();
      setSessions(sessions.filter(s => s.active));
      showToast('Logged out of all other sessions');
    } catch (err) {
      showToast(err.message || 'Failed to logout sessions');
    }
  };

  const removeSession = async (id) => {
    try {
      await logoutSession(id);
      setSessions(sessions.filter(s => s.id !== id));
      showToast('Session revoked');
    } catch (err) {
      showToast(err.message || 'Failed to revoke session');
    }
  };

  // --- Preferences State ---
  const preferences = useSettingsStore((s) => s.preferences);
  const updatePref = useSettingsStore((s) => s.updatePreference);


  // --- Render Tabs ---
  const renderProfileTab = () => (
    <div className="animate-fade-in space-y-12">
      <div>
        <h2 className="text-3xl font-black text-white font-display flex items-center gap-3">
          <User className="text-[#00F0FF] w-6 h-6" /> Profile
        </h2>
      </div>

      <div className="bg-[#0b101e] border border-white/5 rounded-2xl p-8 max-w-4xl">
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              <img 
                src={profileData.avatar} 
                alt="Profile" 
                className="w-40 h-40 rounded-full object-cover border-4 border-[#00F0FF]/20 shadow-[0_0_20px_rgba(0,240,255,0.15)] group-hover:border-[#00F0FF] transition-colors"
              />
              <div className="absolute bottom-2 right-2 bg-[#00F0FF] p-2 rounded-full text-black shadow-lg">
                <Edit2 className="w-4 h-4" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
            <p className="text-xs text-slate-500 mt-4 font-semibold uppercase tracking-wider">Recommended: 400x400px</p>
          </div>

          {/* Form Section */}
          <div className="flex-1 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input 
                type="text" 
                value={profileData.fullName}
                onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                className="w-full bg-white text-black font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#00F0FF] shadow-inner"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input 
                type="email" 
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                className="w-full bg-white text-black font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#00F0FF] shadow-inner"
              />
            </div>
            <button 
              onClick={handleProfileSave}
              className="bg-[#a8f0f0] hover:bg-[#8eeaea] text-[#0f2c3d] font-black py-3 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(168,240,240,0.3)] mt-2"
            >
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="animate-fade-in space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white font-display mb-2">Security</h2>
        <p className="text-slate-400">Manage your account security, passwords, and active sessions.</p>
      </div>

      {/* Change Password Block */}
      <div className="bg-[#121622] border border-white/5 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <Key className="text-[#00F0FF] w-5 h-5" />
          <h3 className="text-xl font-bold text-white font-display">Change Password</h3>
        </div>

        <div className="space-y-6 max-w-4xl">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">Current Password</label>
            <div className="relative">
              <input 
                type={showCurrentPassword ? "text" : "password"} 
                value={passwords.current}
                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                className="w-full bg-[#0b0e14] border border-[#1a2235] text-white rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:border-[#00F0FF]"
                placeholder="••••••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">New Password</label>
              <div className="relative">
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  className="w-full bg-[#0b0e14] border border-[#1a2235] text-white rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:border-[#00F0FF]"
                  placeholder="••••••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Confirm New Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  className="w-full bg-[#0b0e14] border border-[#1a2235] text-white rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:border-[#00F0FF]"
                  placeholder="••••••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
            <p className="text-sm text-slate-400 max-w-sm">
              Use at least 8 characters with a mix of letters, numbers & symbols for maximum security.
            </p>
            <button 
              onClick={handlePasswordUpdate}
              className="bg-[#00F0FF] hover:bg-[#00D8E6] text-black font-black py-3 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] shrink-0"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* Two-Factor Auth Block */}
      <div className="bg-[#121622] border border-white/5 rounded-3xl p-8 shadow-sm flex items-start justify-between">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-[#1a2235] rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-slate-300" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-display mb-2">Two-Factor Authentication</h3>
            <p className="text-sm text-slate-400 max-w-lg">
              Add an extra layer of security to your account. To help keep your account safe, we'll verify your identity during sign-ins.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Toggle enabled={twoFactor} onChange={handleTwoFactorToggle} />
          <span className="text-xs font-semibold text-slate-400 uppercase w-16 text-right">
            {twoFactor ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>

      {/* Active Sessions Block */}
      <div className="bg-[#121622] border border-white/5 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Monitor className="text-[#00F0FF] w-5 h-5" />
            <h3 className="text-xl font-bold text-white font-display">Active Sessions</h3>
          </div>
          <button 
            onClick={logoutOtherSessions}
            className="text-xs font-bold text-[#00F0FF] hover:text-[#00D8E6] transition-colors"
          >
            Log out of all other sessions
          </button>
        </div>

        <div className="space-y-4">
          {sessions.map(session => (
            <div key={session.id} className="flex items-center justify-between p-5 bg-[#1a202f] rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                {session.type === 'laptop' && <Laptop className="text-slate-400 w-6 h-6" />}
                {session.type === 'phone' && <Smartphone className="text-slate-400 w-6 h-6" />}
                {session.type === 'desktop' && <Monitor className="text-slate-400 w-6 h-6" />}
                <div>
                  <h4 className="text-sm font-bold text-white">{session.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{session.browser} • {session.ip_address} • {new Date(session.created_at).toLocaleString()}</p>
                </div>
              </div>
              {session.active ? (
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 bg-slate-600/40 px-3 py-1 rounded-full">
                  Active
                </span>
              ) : (
                <button 
                  onClick={() => removeSession(session.id)}
                  className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Cards */}
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="animate-fade-in space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white font-display flex items-center gap-3">
          <SettingsIcon className="text-[#00F0FF] w-6 h-6" /> Preferences
        </h2>
      </div>

      <div className="bg-[#121622] border border-white/5 rounded-3xl p-8 max-w-4xl shadow-sm">
        
        {/* Language Block */}
        <div className="flex items-start justify-between border-b border-white/5 pb-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Voice Assistant Default Language</h3>
            <p className="text-sm text-slate-400">Set the primary language for audio feedback during scans.</p>
          </div>
          <select 
            value={preferences.language}
            onChange={(e) => updatePref('language', e.target.value)}
            className="bg-[#0b0e14] border border-[#1a2235] text-white text-sm font-semibold rounded-xl px-4 py-3 min-w-[200px] focus:outline-none focus:border-[#00F0FF] cursor-pointer"
          >
            <option value="English (US)">English (US)</option>
            <option value="English (UK)">English (UK)</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
          </select>
        </div>

        {/* Toggles Block */}
        <div>
          <h3 className="text-lg font-bold text-white mb-6">Notification Toggles</h3>
          
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Critical Scan Alerts</p>
                <p className="text-xs text-slate-400 mt-1">Immediate notifications for hardware errors or safety warnings.</p>
              </div>
              <Toggle enabled={preferences.alerts} onChange={(v) => updatePref('alerts', v)} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Processing Completion</p>
                <p className="text-xs text-slate-400 mt-1">Notify when a high-resolution scan has finished rendering.</p>
              </div>
              <Toggle enabled={preferences.completion} onChange={(v) => updatePref('completion', v)} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Newsletter & Tips</p>
                <p className="text-xs text-slate-400 mt-1">Weekly digest of creator features and community highlights.</p>
              </div>
              <Toggle enabled={preferences.newsletter} onChange={(v) => updatePref('newsletter', v)} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );


  // --- Main Layout ---
  return (
    <div className="flex flex-col lg:flex-row gap-10">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#00F0FF] text-black font-bold px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] animate-slide-in flex items-center gap-2">
          <Check className="w-5 h-5" />
          {toastMessage}
        </div>
      )}

      {/* Settings Left Sidebar */}
      <div className="w-full lg:w-64 shrink-0 border-r border-white/5 pr-6 h-auto min-h-[calc(100vh-140px)]">
        <h1 className="text-xl font-bold text-white font-display mb-1">Account Settings</h1>
        <p className="text-xs text-slate-500 mb-8">Manage your account, security, and preferences.</p>
        
        <nav className="space-y-2 mb-10">
          <button 
            onClick={() => setActiveTab('Profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'Profile' ? 'bg-[#212c41] text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" /> Profile
          </button>
          
          <button 
            onClick={() => setActiveTab('Security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'Security' ? 'bg-[#212c41] text-[#00F0FF]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4" /> Security
          </button>
          
          <button 
            onClick={() => setActiveTab('Preferences')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'Preferences' ? 'bg-[#212c41] text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <SettingsIcon className="w-4 h-4" /> Preferences
          </button>
        </nav>
        
        <div className="border-t border-white/5 pt-6">
          <button 
            onClick={() => navigate('/login')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </div>

      {/* Settings Main Content Area */}
      <div className="flex-1 max-w-5xl">
        {activeTab === 'Profile' && renderProfileTab()}
        {activeTab === 'Security' && renderSecurityTab()}
        {activeTab === 'Preferences' && renderPreferencesTab()}
      </div>

    </div>
  );
}
