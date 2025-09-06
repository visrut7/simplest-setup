import { createServer } from "http";
import { readFile } from "fs";
import path from "path";
import { join, extname } from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const publicDir = join(__dirname, "public");

const server = createServer((req, res) => {
  let filePath = join(publicDir, req.url === "/" ? "index.html" : req.url);

  readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = extname(filePath);
    let contentType = "text/html";
    if (ext === ".css") contentType = "text/css";
    if (ext === ".js") contentType = "text/javascript";

    // Set cookies only for index.html
    if (req.url === "/") {
      res.setHeader("Set-Cookie", [
        "normalCookie=IAmJSAccessible; Path=/",
        "httpOnlyCookie=IAmHttpOnly; HttpOnly; Path=/",
      ]);
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
