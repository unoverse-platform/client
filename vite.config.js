import { defineConfig, loadEnv } from "vite";
import { resolve } from "path";

/**
 * A starting point for putting an unoverse assistant on your website.
 *
 * There is very little here on purpose. The assistant is served by your universe at
 * `<universe>/embed.js`, so this project builds no assistant of its own: it is one page
 * showing where the tag goes, and one file showing how to hand it your login.
 *
 * Two placeholders are substituted into index.html at dev and build time, so the tag in
 * the markup is a real URL you can read and copy:
 *
 *   %UNOVERSE_URL%  →  VITE_UNOVERSE_URL, default http://localhost:4105
 *   %UNOVERSE_APP%  →  VITE_UNOVERSE_APP, default demo/demo-chat-layout
 *
 * They are ordinary text replacement rather than Vite's own `%VITE_*%` mechanism, which
 * has no defaults: with no `.env` it leaves the placeholder in the markup, and the page
 * then requests a script at a path that does not exist.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const universeUrl = (process.env.VITE_UNOVERSE_URL || env.VITE_UNOVERSE_URL || "http://localhost:4105").replace(/\/$/, "");
  const appId = process.env.VITE_UNOVERSE_APP || env.VITE_UNOVERSE_APP || "demo/demo-chat-layout";

  return {
    define: {
      "import.meta.env.VITE_AUTH_ISSUER": JSON.stringify(process.env.VITE_AUTH_ISSUER || env.VITE_AUTH_ISSUER || ""),
      "import.meta.env.VITE_AUTH_CLIENT_ID": JSON.stringify(process.env.VITE_AUTH_CLIENT_ID || env.VITE_AUTH_CLIENT_ID || ""),
      "import.meta.env.VITE_AUTH_AUDIENCE": JSON.stringify(process.env.VITE_AUTH_AUDIENCE || env.VITE_AUTH_AUDIENCE || "gravity-api"),
    },
    plugins: [
      {
        name: "unoverse-placeholders",
        transformIndexHtml: (html) =>
          html.replaceAll("%UNOVERSE_URL%", universeUrl).replaceAll("%UNOVERSE_APP%", appId),
      },
    ],
    build: { outDir: "dist", rollupOptions: { input: resolve(__dirname, "index.html") } },
    server: { port: 3010, strictPort: true, host: "0.0.0.0" },
  };
});
