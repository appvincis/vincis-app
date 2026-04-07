import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { PrimeVue } from '@primevue/core'
import Aura from '@primeuix/themes/aura'


import App from './App.vue'
import router from './router'
import { Button } from 'primevue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
})

app.mount('#app')
