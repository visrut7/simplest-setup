const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

const server = http.createServer((req, res) => {
  let filePath = "";

  if (req.url === "/") {
    filePath = path.join(__dirname, "index.html");
  } else {
    // serve other files like CSS
    filePath = path.join(__dirname, req.url);
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
    } else {
      // Simple content type handling
      const ext = path.extname(filePath);
      let contentType = "text/html";
      if (ext === ".css") contentType = "text/css";
      if (ext === ".js") contentType = "text/javascript";

      // Only set cookies for index.html
      if (req.url === "/") {
        res.setHeader("Set-Cookie", [
          "normalCookie=IAmJSAccessible; Path=/",
          "httpOnlyCookie=IAmHttpOnly; HttpOnly; Path=/",
        ]);
      }

      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
