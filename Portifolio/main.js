import './src/assets/main.css'; // Caminho correto para o CSS
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './src/App.vue'; // Caminho correto para o App.vue

const app = createApp(App);
app.use(createPinia());
app.mount('#app');
