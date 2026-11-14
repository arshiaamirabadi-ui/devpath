import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({base:'./',plugins:[react()],build:{rollupOptions:{output:{manualChunks(id){if(id.includes('/src/lessons-')||id.endsWith('/src/lessons.ts'))return 'lesson-guides';if(id.endsWith('/src/content.ts'))return 'curriculum';}}}}});
