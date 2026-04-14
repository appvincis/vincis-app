import { createApp } from "vue";
import { createPinia } from "pinia";
import { PrimeVue } from "@primevue/core";
import VincisTheme from "./vincis-primevue-theme";
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'
import './global.css'

import App from "./App.vue";
import router from "./router";
const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(ToastService)
app.use(PrimeVue, {
  theme: {
    preset: VincisTheme,
    options: { darkModeSelector: ".dark" },
  },
});

app.mount("#app");
