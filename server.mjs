import { createServer } from "node:http";
import { readFile, stat, watch } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.argv[2] || process.env.PORT || 5173);
const clients = new Set();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function sendReload() {
  for (const res of clients) {
    res.write("event: reload\ndata: now\n\n");
  }
}

try {
  watch(root, { recursive: true }, (_event, filename) => {
    if (!filename || filename.includes("node_modules")) return;
    if (/\.(html|css|js)$/.test(filename)) sendReload();
  });
} catch {
  watch(root, (_event, filename) => {
    if (filename && /\.(html|css|js)$/.test(filename)) sendReload();
  });
}

const liveReloadScript = `
<script>
  const source = new EventSource("/__live");
  source.addEventListener("reload", () => location.reload());
</script>`;

createServer((req, res) => {
  if (req.url === "/__live") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    });
    res.write("\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const requested = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = normalize(join(root, requested));

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  stat(filePath, (statError, info) => {
    if (statError || !info.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    readFile(filePath, (readError, buffer) => {
      if (readError) {
        res.writeHead(500);
        res.end("Server error");
        return;
      }

      const ext = extname(filePath);
      res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
      if (ext === ".html") {
        res.end(buffer.toString("utf8").replace("</body>", `${liveReloadScript}</body>`));
      } else {
        res.end(buffer);
      }
    });
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`肥宅随机投喂器预览已启动: http://127.0.0.1:${port}`);
});
