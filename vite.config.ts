import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('/firebase/') || id.includes('/@firebase/')) return 'firebase';
          if (id.includes('/@mui/') || id.includes('/@emotion/')) return 'mui';
          if (id.includes('/react-router') || id.includes('/react-dom/') || id.match(/\/react\/[^/]+$/)) return 'react';
        },
      },
    },
  },
});
