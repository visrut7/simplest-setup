import { createServer, IncomingMessage, ServerResponse } from "http";
import { readFile } from "fs";
import path from "path";
import { join, extname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const publicDir = join(__dirname, "public");

const routes = {
  "/log-cookie": {
    POST: handleLogCookie,
  },
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @returns {void}
 */
function handleLogCookie(req, res) {
  const cookies = req.headers.cookie;
  console.log("All cookies:", cookies);

  if (cookies) {
    const cookiePairs = cookies.split(";").map((cookie) => cookie.trim());
    const httpOnlyCookie = cookiePairs.find((cookie) =>
      cookie.startsWith("httpOnlyCookie=")
    );

    if (httpOnlyCookie) {
      console.log("HTTP-only cookie found:", httpOnlyCookie);
    } else {
      console.log("HTTP-only cookie not found in request");
    }
  } else {
    console.log("No cookies found in request");
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Cookie logged to server console" }));
}

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @returns {void}
 */
function handleStaticFile(req, res) {
  const filePath = join(publicDir, req.url === "/" ? "index.html" : req.url);

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
}

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @returns {void}
 */
function handleRequest(req, res) {
  const route = routes[req.url];

  if (route && route[req.method]) {
    route[req.method](req, res);
  } else {
    handleStaticFile(req, res);
  }
}

const server = createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
