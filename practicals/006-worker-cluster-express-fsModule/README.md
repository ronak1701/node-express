# Node.js Advanced Practicals

This project demonstrates several core Node.js concepts including Express.js architecture, multi-threading with Worker Threads, multi-processing with Clusters, and efficient data handling with File Streams.

## 1. Express.js, Middleware & Routing
Express.js is a minimal and flexible Node.js web application framework. This practical ([express.js](express.js)) implements a full CRUD (Create, Read, Update, Delete) API for managing user data.

- **Middleware**: Functions that have access to the request (`req`), response (`res`), and the `next` function. In this project, a custom middleware logs every request (Method, URL, Timestamp) to a `log.txt` file before passing control to the next handler.
- **Routing**: Defines how the application responds to client requests at specific endpoints. We use `app.route()` to group multiple HTTP methods (GET, POST) for the same path, improving code organization.

## 2. Worker Threads
Node.js is single-threaded by default. However, the `worker_threads` module allows execution of JavaScript in parallel.

- **Use Case**: This is ideal for CPU-intensive tasks that would otherwise block the main event loop.
- **Implementation**: [workerMain.js](workerMain.js) offloads a heavy calculation to [worker.js](worker.js). The main thread remains responsive and can print message "Main thread is NOT blocked!" while the worker works in the background.

## 3. Worker Cluster
While Worker Threads share memory, the `cluster` module allows you to spawn multiple processes (workers) that share the same server port.

- **Implementation**: In [cluster.js](cluster.js), we use `os.cpus().length` to fork a worker process for every CPU core.
- **Benefits**: This allows the application to handle significantly more traffic by distributing load across all available cores and provides fault tolerance (if one worker dies, a new one can be forked).

## 4. File Streams
Reading large files using `fs.readFile` can consume significant memory as the entire file is loaded into RAM. Streams provide a way to handle data piece by piece.

- **Implementation**: [simpleFileStream.js](simpleFileStream.js) uses `fs.createReadStream()` to read `MOCK_DATA.json`.
- **Streaming response**: Instead of sending the whole file at once, we use `res.write(chunk)` to stream data to the client as it's being read, resulting in lower memory overhead and faster "Time to First Byte".

---
*Developed for Node-Express learning practicals.*