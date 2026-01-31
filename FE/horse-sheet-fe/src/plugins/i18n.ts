import { createI18n } from 'vue-i18n';
import messages from '@/locales';

// Get initial language from localStorage or browser
function getInitialLanguage(): 'pl' | 'en' {
  try {
    const stored = localStorage.getItem('horseSheet.language');
    if (stored === 'pl' || stored === 'en') {
      return stored as 'pl' | 'en';
    }
  } catch (error) {
    console.warn('Failed to read language from localStorage:', error);
  }
  
  // Detect browser language
  const browserLang = navigator.language || (navigator as any).userLanguage;
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  if (langCode === 'en' || langCode === 'pl') {
    return langCode as 'pl' | 'en';
  }
  
  return 'pl'; // Default to Polish
}

export const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: getInitialLanguage(),
  fallbackLocale: 'en',
  messages,
  missingWarn: import.meta.env.DEV,
  fallbackWarn: import.meta.env.DEV,
});

export default i18n;

