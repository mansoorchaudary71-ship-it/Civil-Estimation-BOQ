import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, User, Camera, Loader2, Moon, Sun, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSettings({ isOpen, onClose }: ProfileSettingsProps) {
  const { user, updateUserDisplayName, updateUserProfilePhoto } = useAuth();
  const { settings, updateSettings } = useSettings();
  
  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg('');
    
    try {
      if (name !== user?.displayName) {
        await updateUserDisplayName(name);
      }
      if (photoURL !== user?.photoURL) {
        await updateUserProfilePhoto(photoURL);
      }
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const isDarkMode = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const isHighContrast = settings.theme === 'high-contrast';

  const toggleTheme = () => {
    if (settings.theme === 'light') updateSettings({ theme: 'dark' });
    else if (settings.theme === 'dark') updateSettings({ theme: 'high-contrast' });
    else updateSettings({ theme: 'light' });
  };

  const getThemeIcon = () => {
    if (settings.theme === 'high-contrast') return <Eye className="w-5 h-5 text-yellow-500" />;
    if (settings.theme === 'dark') return <Moon className="w-5 h-5 text-indigo-500" />;
    return <Sun className="w-5 h-5 text-amber-500" />;
  };

  const getThemeLabel = () => {
    if (settings.theme === 'high-contrast') return 'High Contrast';
    if (settings.theme === 'dark') return 'Dark Mode';
    if (settings.theme === 'system') return 'System Mode';
    return 'Light Mode';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#F5F5F7] backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md overflow-hidden bg-bg-card rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-slate-900 dark:text-white text-xl font-semibold text-slate-900 tracking-tight mb-4">Profile Settings</h2>
            <button onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-full relative w-24 h-24 rounded-full overflow-hidden bg-white border-4 border-white shadow-sm flex items-center justify-center group">
                {photoURL ? (
                  <img src={photoURL} alt="User Profile Details Settings Photo" title="Profile Avatar" loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-700" />
                )}
                <div className="absolute inset-0 bg-slate-50/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-slate-900" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-1.5 uppercase tracking-wider text-sm font-medium text-slate-700 mb-1">Display Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-5 h-5 text-slate-700" />
                  <><label htmlFor="a11y-input-14" className="sr-only">Input</label>
<input id="a11y-input-14"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 transition-all"
                  /></>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 uppercase tracking-wider text-sm font-medium text-slate-700 mb-1">Photo URL</label>
                <div className="relative flex items-center">
                  <Camera className="absolute left-3.5 w-5 h-5 text-slate-700" />
                  <><label htmlFor="a11y-input-15" className="sr-only">https://example.com/avatar.png</label>
<input id="a11y-input-15"
                     type="url"
                     value={photoURL}
                     onChange={(e) => setPhotoURL(e.target.value)}
                     placeholder="https://example.com/avatar.png"
                     className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 transition-all"
                  /></>
                </div>
              </div>

              {/* Theme Toggle */}
              <div>
                <label className="block mb-2 uppercase tracking-wider text-sm font-medium text-slate-700 mb-1">Appearance</label>
                <button type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 transition-colors text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    {getThemeIcon()}
                    <span className="text-base font-medium text-slate-900 dark:text-white">
                      {getThemeLabel()}
                    </span>
                  </div>
                  <div className={`w-10 h-6 rounded-full p-1 relative transition-colors ${settings.theme === 'high-contrast' ? 'bg-yellow-500' : isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${settings.theme === 'high-contrast' || isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </button>
              </div>
            </div>

            {successMsg && (
              <div className="p-3 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-[24px] text-center font-medium overflow-hidden">
                {successMsg}
              </div>
            )}

            <button type="submit"
               disabled={isLoading}
               className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/50 flex justify-center items-center h-12 text-base font-semibold active:scale-95 hover:-translate-y-0.5"
            >
               {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
