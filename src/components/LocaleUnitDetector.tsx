import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';
import { getSuggestedUnitByLocale } from '../utils/localeDetector';

export default function LocaleUnitDetector() {
  const { settings, updateSettings } = useSettings();

  useEffect(() => {
    // Only run this check once per browser session/installation
    const hasDetectedUnit = localStorage.getItem('has_detected_unit');
    
    if (!hasDetectedUnit) {
      getSuggestedUnitByLocale().then(suggestedUnit => {
        const suggestedName = suggestedUnit === 'SI' ? 'Metric' : 'Imperial';

        // If the current settings don't match the suggested unit, offer to switch
        if (settings.measurement !== suggestedUnit) {
          toast((t) => (
            <div className="flex flex-col gap-2 p-1">
              <div className="font-bold text-slate-800 text-base">Locale Detected</div>
              <div className="text-sm text-slate-600">Based on your region, we suggest using {suggestedName} units for calculations.</div>
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => {
                    updateSettings({ measurement: suggestedUnit });
                    toast.dismiss(t.id);
                    toast.success(`Switched to ${suggestedName} units`);
                  }}
                  className="flex-1 px-3 py-2 bg-indigo-600 outline-none text-white text-base font-medium rounded-full hover:bg-indigo-700 transition duration-150 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                >
                  Switch to {suggestedName}
                </button>
                <button 
                  onClick={() => toast.dismiss(t.id)}
                  className="flex-1 px-3 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 outline-none text-base font-medium rounded-full transition duration-150 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                >
                  Keep {settings.measurement === 'SI' ? 'Metric' : 'Imperial'}
                </button>
              </div>
            </div>
          ), { duration: 10000, position: 'top-center' }); // longer duration to let user read
        } else {
          // If it already matches, we can still notify them or just silently approve.
          // Let's do a quiet toast to confirm auto-configuration
          toast.success(`Unit system automatically set to ${suggestedName} based on your locale.`, {
             duration: 4000,
             position: 'bottom-center'
          });
        }
        
        localStorage.setItem('has_detected_unit', 'true');
      });
    }
  }, [settings.measurement, updateSettings]);

  return null;
}
