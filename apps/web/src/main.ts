import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { PrimeVue } from "@primevue/core";
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import VincisTheme from "./vincis-primevue-theme";
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'
import './global.css'

import App from "./App.vue";
import router from "./router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false, // Avoid refetching when switching tabs
    },
  },
})

const app = createApp(App);

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia);
app.use(router);
app.use(ToastService)
app.use(VueQueryPlugin, { queryClient })
app.use(PrimeVue, {
  theme: {
    preset: VincisTheme,
    options: { darkModeSelector: ".dark" },
  },
});

app.mount("#app");
