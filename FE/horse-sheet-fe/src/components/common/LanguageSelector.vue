<script setup lang="ts">
import { computed } from 'vue';
import { useLanguageStore, type Language } from '@/stores/language';
import { useI18n } from 'vue-i18n';

const languageStore = useLanguageStore();
const { t } = useI18n();

const currentLanguage = computed(() => languageStore.currentLanguage);

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

function setLanguage(lang: Language) {
  languageStore.setLanguage(lang);
}

function handleKeydown(event: KeyboardEvent, lang: Language) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    setLanguage(lang);
  }
}
</script>

<template>
  <div class="language-selector" role="group" aria-label="Select language">
    <button
      v-for="lang in languages"
      :key="lang.code"
      type="button"
      class="language-button"
      :class="{ active: currentLanguage === lang.code }"
      :aria-label="`Select ${lang.label}`"
      :aria-current="currentLanguage === lang.code ? 'true' : 'false'"
      @click="setLanguage(lang.code)"
      @keydown="handleKeydown($event, lang.code)"
    >
      <span class="flag">{{ lang.flag }}</span>
      <span class="label">{{ lang.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.language-selector {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.language-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  min-height: 36px;
}

.language-button:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.language-button.active {
  background: #3498db;
  border-color: #3498db;
  color: white;
}

.language-button:focus {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}

.flag {
  font-size: 1.125rem;
  line-height: 1;
}

.label {
  font-weight: 500;
}

@media (max-width: 767px) {
  .language-selector {
    flex-direction: column;
    width: 100%;
  }

  .language-button {
    width: 100%;
    justify-content: center;
  }
}
</style>

