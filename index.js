// ------------------------------
// 1) Import built-in Node modules
// ------------------------------
const http = require("http");
const fs = require("fs/promises");
const path = require("path");

// ------------------------------
// 2) App configuration
// ------------------------------
const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

// ------------------------------
// 3) MIME type map (file extension -> response content type)
// ------------------------------
const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml"
};

// ------------------------------
// 4) Helper: return correct content type for a file
// ------------------------------
function getContentType(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    return mimeTypes[extension] || "application/octet-stream";
}

// ------------------------------
// 5) Helper: read a file and send it in the HTTP response
// ------------------------------
async function sendFile(res, filePath) {
    const content = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": getContentType(filePath) });
    res.end(content);
}

// ------------------------------
// 6) Helper: prevent path traversal and keep requests inside /public
// ------------------------------
function getSafePath(urlPath) {
    const normalized = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
    const resolved = path.join(publicDir, normalized);
    return resolved.startsWith(publicDir) ? resolved : null;
}

// ------------------------------
// 7) Main HTTP server and route handling
// ------------------------------
const server = http.createServer(async (req, res) => {
    try {
        // Remove query string and map "/" to index.html
        const rawPath = (req.url || "/").split("?")[0];
        const requestPath = rawPath === "/" ? "/index.html" : rawPath;
        const safePath = getSafePath(requestPath);

        if (!safePath) {
            res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Bad Request");
            return;
        }

        await sendFile(res, safePath);
    } catch (_) {
        // Fallback: return the main page for unknown routes in this simple app.
        try {
            await sendFile(res, path.join(publicDir, "index.html"));
        } catch {
            res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Internal Server Error");
        }
    }
});

// ------------------------------
// 8) Start server
// ------------------------------
server.listen(port, () => {
    console.log(`Mini URL Shortener running at http://localhost:${port}`);
});
