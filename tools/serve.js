const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const port = 4173;
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mov": "video/mp4",
  ".png": "image/png",
};

http
  .createServer((request, response) => {
    const requestPath = decodeURIComponent((request.url || "/").split("?")[0]);
    const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
    const filePath = path.resolve(root, relativePath);

    if (!filePath.startsWith(root + path.sep)) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    fs.stat(filePath, (statError, stats) => {
      if (statError || !stats.isFile()) {
        response.writeHead(404).end("Not found");
        return;
      }

      response.writeHead(200, {
        "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      fs.createReadStream(filePath).pipe(response);
    });
  })
  .listen(port, "127.0.0.1", () => {
    process.stdout.write(`Preview server: http://127.0.0.1:${port}\n`);
  });
