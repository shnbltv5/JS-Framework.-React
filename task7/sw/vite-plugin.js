// A small Vite plugin that creates dist/sw.js during `npm run build`.
// Vite gives every built file a hashed name (index-3fA9c.js), so the list of files
// to precache is only known after the build. The plugin takes that list and adds it,
// together with a version, on top of sw/service-worker.js.
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";

const SOURCE = "sw/service-worker.js";
const PUBLIC_DIR = "public";

export default function serviceWorkerPlugin() {
  return {
    name: "quest-board-service-worker",
    enforce: "post", // run after Vite has added index.html to the bundle

    // Like vercel.json: /offline opens offline.html (for `npm run dev` and `npm run preview`)
    configureServer(server) {
      server.middlewares.use(rewriteOfflinePage);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewriteOfflinePage);
    },

    generateBundle(_options, bundle) {
      const builtFiles = Object.keys(bundle).filter((file) => !file.endsWith(".map"));
      const publicFiles = readdirSync(PUBLIC_DIR);
      const urls = [...new Set([...builtFiles, ...publicFiles, "index.html"])].map((file) => `/${file}`).sort();

      // The version changes when any file changes: new hashed names or new public files
      const hash = createHash("sha256");
      hash.update(readFileSync(SOURCE));
      hash.update(urls.join("\n"));
      for (const file of publicFiles) hash.update(readFileSync(`${PUBLIC_DIR}/${file}`));
      const version = hash.digest("hex").slice(0, 10);

      const header =
        `const VERSION = ${JSON.stringify(version)};\n` +
        `const PRECACHE_URLS = ${JSON.stringify(urls, null, 2)};\n\n`;

      this.emitFile({ type: "asset", fileName: "sw.js", source: header + readFileSync(SOURCE, "utf8") });
    },
  };
}

function rewriteOfflinePage(req, _res, next) {
  if (req.url === "/offline") req.url = "/offline.html";
  next();
}
