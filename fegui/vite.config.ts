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
    preview: {
      // react-router build pre-renders via a preview server that binds to localhost, which in node:24 containers resolves to ::1,
      // whereas the pre-render requests go to 127.0.0.1 (ECONNREFUSED, e.g. in the Docker build)
      host: '127.0.0.1',
    },
    server: {
      proxy: {
        // string shorthand: http://localhost:5173/iapi -> http://localhost:9000/iapi
        '/iapi': 'http://localhost:9000',
      },
    },
  };
});
