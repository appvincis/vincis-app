import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { PrimeVue } from "@primevue/core";
import VincisTheme from "./vincis-primevue-theme";
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'
import './global.css'

import App from "./App.vue";
import router from "./router";
const app = createApp(App);

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia);
app.use(router);
app.use(ToastService)
app.use(PrimeVue, {
  theme: {
    preset: VincisTheme,
    options: { darkModeSelector: ".dark" },
  },
});

app.mount("#app");
