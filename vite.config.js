import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 5173,
    open: true,        // abre o navegador automaticamente
    host: true         // expõe na rede local (acessar via celular)
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0
  }
});
