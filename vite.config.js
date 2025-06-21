import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/funnel-editor/' // 你的 GitHub 仓库名
});
