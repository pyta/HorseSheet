import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export type Language = 'pl' | 'en';

const STORAGE_KEY = 'horseSheet.language';
const DEFAULT_LANGUAGE: Language = 'pl';

function detectBrowserLanguage(): Language {
  const browserLang = navigator.language || (navigator as any).userLanguage;
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  if (langCode === 'en' || langCode === 'pl') {
    return langCode as Language;
  }
  
  return DEFAULT_LANGUAGE;
}

function getStoredLanguage(): Language | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'pl' || stored === 'en') {
      return stored as Language;
    }
  } catch (error) {
    console.warn('Failed to read language from localStorage:', error);
  }
  return null;
}

function getInitialLanguage(): Language {
  const stored = getStoredLanguage();
  if (stored) {
    return stored;
  }
  return detectBrowserLanguage();
}

export const useLanguageStore = defineStore('language', () => {
  const currentLanguage = ref<Language>(getInitialLanguage());

  function setLanguage(lang: Language) {
    currentLanguage.value = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error);
    }
  }

  // Watch for language changes and update document language attribute
  watch(currentLanguage, (lang) => {
    document.documentElement.lang = lang;
  }, { immediate: true });

  return {
    currentLanguage,
    setLanguage,
  };
});

