import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), viteSingleFile()],
  resolve: {
    alias: {
      stream: "stream-browserify",
      "@airgap/beacon-sdk": "@airgap/beacon-sdk/dist/walletbeacon.min.js",
      // "@taquito/beacon-wallet": "@taquito/beacon-wallet/dist/taquito-beacon-wallet.es5.js",
      // "@taquito/signer": "@taquito/signer/dist/taquito-signer.es5.js",
      // "@taquito/taquito": "@taquito/taquito/dist/taquito.es5.js"
    },
  },
  server: {
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:8885/.netlify/functions",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  define: {
    global: "window",
  },
  build: {
    sourcemap: true,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    brotliSize: false,
    rollupOptions: {
      inlineDynamicImports: true,
      output: {
        manualChunks: () => "everything.js",
      },
    },
  },
});
