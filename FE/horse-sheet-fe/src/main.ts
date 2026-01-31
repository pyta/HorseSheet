import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'
import { useLanguageStore } from './stores/language'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

// Sync language store with i18n
const languageStore = useLanguageStore()
// Set initial i18n locale
i18n.global.locale.value = languageStore.currentLanguage
// Update i18n locale when language changes
languageStore.$subscribe((mutation, state) => {
  i18n.global.locale.value = state.currentLanguage
})

app.mount('#app')
