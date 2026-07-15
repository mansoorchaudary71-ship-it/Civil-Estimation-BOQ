import { MeasurementSystem } from '../context/SettingsContext';

export async function getSuggestedUnitByLocale(): Promise<MeasurementSystem> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const country = data.country_code;
    
    // US, Liberia, Myanmar are the primary countries not using the metric system
    const imperialRegions = ['US', 'LR', 'MM'];
    if (country && imperialRegions.includes(country)) {
      return 'FPS';
    }
  } catch (e) {
    console.error("Error detecting geolocation", e);
    // Fallback to navigator
    const lang = navigator.language || (navigator.languages && navigator.languages[0]);
    if (lang) {
      const imperialRegions = ['US', 'LR', 'MM'];
      for (const region of imperialRegions) {
        if (lang.includes(`-${region}`) || lang.toUpperCase() === region) {
          return 'FPS';
        }
      }
    }
  }
  
  // Default to Metric (SI) for the rest of the world
  return 'SI';
}
