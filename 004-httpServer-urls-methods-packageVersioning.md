# Node.js HTTP Server, URLs, Methods and Node Module/Package Versioning

Master the core of Node.js web development: from raw HTTP servers to professional package management and versioning.

---

## 🌐 1. The HTTP Server Deep Dive

Node's `http` module allows you to build high-performance servers without needing a separate web server like Apache or Nginx for simple tasks.

### Advanced Request-Response Handling

```javascript
const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
  // 1. Extracting Request Meta-data
  const { method, url, headers } = req;
  const userAgent = headers["user-agent"];

  // 2. Logging with high precision
  const log = `[${new Date().toISOString()}] ${method} ${url} | UA: ${userAgent}\n`;
  fs.appendFile("server.log", log, (err) => {
    if (err) console.error("Logging failed", err);
  });

  // 3. Setting response headers for security/type
  res.setHeader("X-Powered-By", "Node-Custom-Server");

  // 4. Advanced Routing
  if (url === "/" && method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h1>🚀 Node Server Home</h1>");
  } else if (url === "/api/data" && method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "success", version: "1.0.0" }));
  } else {
    res.writeHead(404);
    res.end("Route not found");
  }
});

server.listen(3000, () => {
  console.log("✅ Server active at http://localhost:3000");
});
```

### 📊 Common HTTP Status Codes

| Category         | Code  | Meaning               | Usage                               |
| :--------------- | :---- | :-------------------- | :---------------------------------- |
| **Success**      | `200` | **OK**                | Request succeeded.                  |
|                  | `201` | **Created**           | New resource created (via POST).    |
| **Redirect**     | `301` | **Moved Permanently** | URL moved to a new location.        |
| **Client Error** | `400` | **Bad Request**       | Server couldn't understand request. |
|                  | `401` | **Unauthorized**      | Authentication is required.         |
|                  | `404` | **Not Found**         | Resource doesn't exist.             |
| **Server Error** | `500` | **Internal Error**    | Something crashed on the server.    |

---

## 🔗 2. URL Parsing & Global URL Object

While `url.parse()` is common, modern Node.js prefers the global `URL` class.

```javascript
// Modern Approach
const fullUrl = new URL(req.url, `http://${req.headers.host}`);
console.log(fullUrl.searchParams.get("id")); // Get query params easily
```

> [!TIP]
> The `searchParams` API is more robust than manual string splitting or even the old `url.parse` query objects.

---

## 📦 3. Semantic Versioning (SemVer) Mastery

Versioning is about **trust**. When you update a package, you trust the author followed these rules.

### Format: `MAJOR.MINOR.PATCH`

- **MAJOR (1.x.x):** Non-compatible changes. **"I changed how things work; your code WILL break."**
- **MINOR (x.1.x):** New features. **"I added something new; your code is safe."**
- **PATCH (x.x.1):** Bug fixes. **"I fixed a typo; your code is safe."**

### Specifiers in `package.json`

- `^2.1.4`: **Caret** - Fixes Major. Updates Minor/Patch (Safe).
- `~2.1.4`: **Tilde** - Fixes Major/Minor. Updates only Patch (Safer).
- `2.1.4`: **Strict** - Never updates. Avoid unless you have a very specific bug constraint.
- `latest`: **Wildcard** - Updates to absolute latest. **Never use in production.**

---

## ⚙️ 4. The NPM Workspace & Scripts

Your `package.json` is the heart of your project.

### Dependencies vs DevDependencies

- **`dependencies`:** Required for the app to **run** (e.g., `express`, `mongoose`).
- **`devDependencies`:** Only needed for **development** (e.g., `jest`, `nodemon`, `eslint`).
  - _Command:_ `npm install --save-dev nodemon`

### Custom Scripts

Automation is key. Define your own shortcuts:

```json
"scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest",
    "lint": "eslint ."
}
```

_Run via:_ `npm run dev`

---

## 🔒 5. The Lock File Controversy

**Why do we have `package-lock.json`?**
Imagine developer A installs `express ^4.17.1` on Monday. Developer B joins on Friday when `4.17.2` is out.

- **Without the lock file:** Developer B gets `4.17.2`. The environments are now different.
- **With the lock file:** Developer B is forced to use `4.17.1`, exactly what Developer A used.

---

## 💡 Pro Interview Tips

1. **Event Driven:** Node handles connections asynchronously. One thread can manage 10,000 requests because it doesn't "wait" for I/O; it sets a callback and moves on.
2. **Body Parsing:** Native `http` doesn't parse the body for you. You have to listen to the `data` and `end` events on the `req` stream.
3. **NPM Audit:** Use `npm audit` to check for security vulnerabilities in your `node_modules`.

---
