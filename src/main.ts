import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import en from '@/locales/en.json'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en }
})

createApp(App)
  .use(store)
  .use(router)
  .use(i18n)
  .mount('#app')
