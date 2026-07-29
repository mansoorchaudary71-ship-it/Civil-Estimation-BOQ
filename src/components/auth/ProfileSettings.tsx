import { Button } from '../ui/Button';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, User, Camera, Loader2, Moon, Sun, Eye, Settings } from 'lucide-react';
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
    const themes: ('light' | 'dark' | 'system' | 'high-contrast' | 'modern' | 'engineering-blueprint')[] = ['light', 'dark', 'system', 'high-contrast', 'modern', 'engineering-blueprint'];
    const nextTheme = themes[(themes.indexOf(settings.theme) + 1) % themes.length];
    updateSettings({ theme: nextTheme });
  };

  const getThemeIcon = () => {
    if (settings.theme === 'high-contrast') return <Eye className="w-5 h-5 text-yellow-500" />;
    if (settings.theme === 'dark') return <Moon className="w-5 h-5 text-indigo-500" />;
    if (settings.theme === 'modern') return <Sun className="w-5 h-5 text-zinc-500" />;
    if (settings.theme === 'engineering-blueprint') return <Settings className="w-5 h-5 text-blue-500" />;
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
          className="relative w-full max-w-md overflow-hidden bg-bg-card rounded-2xl shadow-2xl border border-ui-borderSubtle dark:border-slate-700"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-ui-borderSubtle dark:border-slate-700">
            <h2 className="text-txt-primary dark:text-white text-xl font-semibold text-txt-primary tracking-tight mb-4">Profile Settings</h2>
            <Button onClick={onClose}
              className="p-2 text-txt-tertiary hover:text-txt-secondary rounded-full hover:bg-slate-100 transition-colors text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-sm flex items-center justify-center group">
                {photoURL ? (
                  <img src={photoURL} alt="User Profile Details Settings Photo" title="Profile Avatar" loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5 flex flex-col">
                <label htmlFor="profile-name" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Display Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <input id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-txt-primary placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label htmlFor="profile-photo" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Photo URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Camera className="w-5 h-5 text-slate-400" />
                  </div>
                  <input id="profile-photo"
                    type="url"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-txt-primary placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
              loadingText="Saving..."
              className="mt-6 shadow-[0_4px_14px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.3)] bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white"
            >
              Save Changes
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
