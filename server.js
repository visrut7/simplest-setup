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
  "/get-cookie": {
    POST: handleGetCookie,
  },
  "/set-cookie": {
    POST: handleSetCookie,
  },
  "/delete-cookie": {
    POST: handleDeleteCookie,
  },
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @returns {void}
 */
function handleGetCookie(req, res) {
  const cookies = req.headers.cookie;

  const cookieData = {
    allCookies: cookies || "",
    parsedCookies: [],
  };

  if (cookies) {
    const cookiePairs = cookies.split(";").map((cookie) => cookie.trim());

    cookiePairs.forEach((cookie) => {
      const [name, value] = cookie.split("=");
      if (name && value) {
        cookieData.parsedCookies.push({
          name: name.trim(),
          value: value.trim(),
        });
      }
    });
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(cookieData));
}

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @returns {void}
 */
function handleSetCookie(req, res) {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const data = JSON.parse(body);
      const { name, value } = data;

      if (!name || !value) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Name and value are required" }));
        return;
      }

      // Set HTTP-only cookie
      res.setHeader("Set-Cookie", `${name}=${value}; HttpOnly; Path=/`);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: `HTTP-only cookie "${name}" set successfully`,
          cookie: { name, value, type: "HTTP-Only" },
        })
      );
    } catch (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON data" }));
    }
  });
}

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @returns {void}
 */
function handleDeleteCookie(req, res) {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const data = JSON.parse(body);
      const { name } = data;

      if (!name) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Cookie name is required" }));
        return;
      }

      // Set cookie to expire immediately
      res.setHeader(
        "Set-Cookie",
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; Path=/`
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ message: `Cookie "${name}" deleted successfully` })
      );
    } catch (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON data" }));
    }
  });
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
