import './styles/_main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err);
  console.error('Vue instance:', instance);
  console.error('Error info:', info);
};

app.use(router);

app.mount('#app');
