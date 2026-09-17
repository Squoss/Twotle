import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    // Play serves the built assets under /fegui/ (cf. beapi's conf/routes) and index.html for all other paths
    base: command === 'build' ? '/fegui/' : '/',
    build: {
      assetsDir: 'vrassets',
    },
    plugins: [reactRouter()],
    server: {
      proxy: {
        // string shorthand: http://localhost:5173/iapi -> http://localhost:9000/iapi
        '/iapi': 'http://localhost:9000',
      },
    },
  };
});
