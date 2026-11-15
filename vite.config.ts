import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {offlineBundle} from './scripts/pwa-build.mjs';
export default defineConfig(({mode})=>({base:'./',plugins:[react(),offlineBundle(mode)],build:{rollupOptions:{output:{manualChunks(id){if(id.includes('/src/lessons-')||id.endsWith('/src/lessons.ts'))return 'lesson-guides';if(id.endsWith('/src/content.ts'))return 'curriculum';}}}}}));
