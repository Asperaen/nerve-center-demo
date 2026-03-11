import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? './' : '/',
  plugins: [react()],
  server: {
    port: 3001,
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: [
      'nerve-center-xc.deployer.mckinsey.com',
      '.deployer.mckinsey.com', // Allow all subdomains
    ],
  },
});
