# Express.js, REST APIs, Middleware, HTTP Headers & HTTP Status Codes

This guide covers the core concepts of building robust backends with Node.js using **Express.js**, including REST APIs, Middleware functions, HTTP Headers, and HTTP Status Codes.

---

## 🚀 1. Express Framework

Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. It is fast, unopinionated, and simplifies the process of building web apps by providing clean APIs for routing, middleware, and template engines.

### Basic Setup

```javascript
const express = require("express");
const app = express();
const PORT = 3000;

// Basic GET route
app.get("/", (req, res) => {
  res.send("Hello World! 🌍");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

---

## 🌐 2. REST API

**REST (Representational State Transfer)** is a set of rules and conventions that define how two software systems communicate over the internet.

- **Stateless:** The server doesn't store client state between requests.
- **Client-Server Architecture:** Clear separation between UI and data storage.
- **HTTP Methods:** Utilizes standard HTTP methods for CRUD operations.

### HTTP Methods for REST

| Method        | Action      | Example Endpoint |
| :------------ | :---------- | :--------------- |
| **GET**       | Read Data   | `/users`         |
| **POST**      | Create Data | `/user`          |
| **PUT/PATCH** | Update Data | `/user/1`        |
| **DELETE**    | Remove Data | `/user/1`        |

### REST API Example

```javascript
const express = require("express");
const app = express();
const PORT = 3000;
const users = [];

// Built-in middleware to parse JSON request bodies
app.use(express.json());

// 🟢 GET: Retrieve all users
app.get("/users", (req, res) => {
  res.json({ success: true, data: users });
});

// 🔵 POST: Create a new user
app.post("/user", (req, res) => {
  const { name, age } = req.body;

  // Basic validation
  if (!name || !age) {
    return res.status(400).json({ error: "Name and age are required" });
  }

  const newUser = { id: users.length + 1, name, age };
  users.push(newUser);
  res
    .status(201)
    .json({ success: true, message: "User created", data: newUser });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## 🌉 3. Middleware

Middleware functions are the "bridge" between the incoming request and the final route handler. They execute **before** the main request handler and can:

- Modify the request (`req`) and response (`res`) objects.
- End the request-response cycle early.
- Call the `next()` function in the stack.

Common uses: Authentication, logging, data parsing, error handling.

### Middleware Example: Request Logger

```javascript
const express = require("express");
const app = express();
const users = [];

app.use(express.json()); // Built-in middleware

// 🛠️ Custom Logger Middleware
const logger = (req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} request to ${req.originalUrl}`,
  );
  // Must call next() to pass control to the next middleware/route handler
  next();
};

// Apply logger globally
app.use(logger);

app.get("/", (req, res) => {
  res.json(users);
});

app.listen(3000);
```

> [!IMPORTANT]
> Always remember to call `next()` inside your custom middleware. If you forget to call `next()` and don't end the response (like `res.send()`), the request will hang indefinitely!

---

## 🏷️ 4. HTTP Headers

**HTTP Headers** are key-value pairs sent along with HTTP requests and responses. They convey essential meta-information about the request, response, or the client/server environment.

- **Authentication:** Sending tokens (e.g., `Authorization: Bearer <token>`).
- **Content-Type:** Telling the server/client what data format to expect (e.g., `application/json`).
- **Custom Headers:** Often prefixed with `X-` (e.g., `X-Powered-By`, `X-Request-From`).

### Headers Example

```javascript
const express = require("express");
const app = express();
const users = [];

app.use(express.json());

app.get("/", (req, res) => {
  // ✉️ Setting custom and standard headers
  res.setHeader("X-Request-From", "Ronak Basita");
  res.setHeader("Content-Type", "application/json");

  res.json(users);
});

app.listen(3000);
```

---

## 📊 5. HTTP Status Codes

Status codes are 3-digit numbers returned by the server indicating the outcome of a request.
_Reference:_ [MDN Web Docs - HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

### Categories of Status Codes

| Range   | Category          | Meaning                                                                    | Examples                                               |
| :------ | :---------------- | :------------------------------------------------------------------------- | :----------------------------------------------------- |
| **1xx** | **Informational** | Request received, continuing process.                                      | `100 Continue`                                         |
| **2xx** | **Successful**    | The action was successfully received, understood, and accepted.            | `200 OK`, `201 Created`                                |
| **3xx** | **Redirection**   | Further action must be taken to complete the request.                      | `301 Moved Permanently`                                |
| **4xx** | **Client Error**  | The request contains bad syntax or cannot be fulfilled (Client's fault).   | `400 Bad Request`, `401 Unauthorized`, `404 Not Found` |
| **5xx** | **Server Error**  | The server failed to fulfill an apparently valid request (Server's fault). | `500 Internal Server Error`, `502 Bad Gateway`         |

### Status Code Example

```javascript
const express = require("express");
const app = express();
const users = [];

app.use(express.json());

app.get("/", (req, res) => {
  res.setHeader("X-Request-From", "Ronak Basita");

  // ✅ Explicitly setting a 200 OK status code
  res.status(200).json(users);
});

// ❌ Handling 404 (Not Found)
// This middleware runs if no other route matches the request
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(3000);
```

> [!TIP]
> Use semantic status codes! Don't always return `200 OK` for errors with a custom JSON payload indicating an error. Use `400` or `500` ranges so that clients, browsers, and crawlers correctly understand the response state.

---
