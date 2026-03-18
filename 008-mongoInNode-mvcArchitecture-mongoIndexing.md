# MongoDB in Node.js (Mongoose), MVC Architecture and MongoDB Indexing

Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It manages relationships between data, provides schema validation, and translates between objects in code and the representation of those objects in MongoDB.

## Installation

First, ensure you have initialized a Node.js project. Then install Mongoose (which includes the MongoDB driver under the hood):

```bash
npm install mongoose
```

## Connecting to MongoDB

Connecting to MongoDB involves using the `mongoose.connect()` method. It is highly recommended to handle connection events to know if your application successfully connects or loses connection to the database.

### Basic Local Connection

```javascript
const mongoose = require("mongoose");

async function connectDB() {
  try {
    // Connect to a local MongoDB instance
    await mongoose.connect("mongodb://localhost:27017/myDatabase");
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
}

// Optional: listen to connection events
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

connectDB();
```

### MongoDB Atlas Connection

For production, you'll likely use MongoDB Atlas (a cloud-hosted MongoDB service). Ensure you replace `<username>`, `<password>`, and `cluster0.mongodb.net` with your actual Atlas credentials. Have your password URL-encoded if it contains special characters.

```javascript
const uri =
  "mongodb+srv://<username>:<password>@cluster0.mongodb.net/myDatabase?retryWrites=true&w=majority";

async function connectCloudDB() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.log("Failed to connect to cloud database", error);
  }
}
```

## Mongoose Schemas and Models

A **Schema** defines the structure of your documents (fields, default values, validators).
A **Model** is a compiled version of the schema. It acts as a constructor that creates and queries documents from the underlying MongoDB collection.

```javascript
const mongoose = require("mongoose");

// Define the Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // Removes whitespace from both ends
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Always cast to lowercase
  },
  age: {
    type: Number,
    min: 0,
    default: 18, // Default value if none is provided
  },
  createdAt: {
    type: Date,
    default: Date.now, // Evaluated when the document is created
  },
});

// Compile Schema into a Model.
// "User" becomes the "users" collection in MongoDB.
const User = mongoose.model("User", userSchema);
```

## CRUD Operations

Mongoose Models provide a rich set of built-in methods to interact with the database.

### Create

```javascript
// Method 1: Create an instance and call save()
const user = new User({ name: "Alice", email: "alice@example.com", age: 25 });
await user.save();

// Method 2: Use Model.create() to instantiate and save directly
const user2 = await User.create({
  name: "Bob",
  email: "bob@example.com",
  age: 30,
});

// Bulk insertion
const usersToInsert = [
  { name: "Charlie", email: "charlie@example.com", age: 22 },
  { name: "Dave", email: "dave@example.com", age: 35 },
];
await User.insertMany(usersToInsert);
```

### Read

```javascript
// Find all documents
const allUsers = await User.find();

// Find with filter (e.g., users age 25 or older)
const activeUsers = await User.find({ age: { $gte: 25 } });

// Find one document that matches a condition
const user = await User.findOne({ email: "alice@example.com" });

// Find strictly by ID
const userById = await User.findById("60d5ec49f1c2d3a4b5c6d7e8");
```

### Update

```javascript
// Update one document without returning it
const updateResult = await User.updateOne(
  { email: "alice@example.com" },
  { $set: { age: 26 } },
);

// Update and return the modified document
const updatedUser = await User.findOneAndUpdate(
  { email: "bob@example.com" },
  { $set: { age: 31 } },
  { new: true }, // 'new: true' returns the document after update; 'new: false' (default) returns before update
);
```

### Delete

```javascript
// Delete one document
const deleteResult = await User.deleteOne({ email: "alice@example.com" });

// Delete by ID
const deletedUser = await User.findByIdAndDelete("60d5ec49f1c2d3a4b5c6d7e8");

// Delete multiple documents
const bulkDeleteResult = await User.deleteMany({ age: { $lt: 18 } });
```

## Validation

Mongoose provides powerful built-in validation rules and allowing custom validation functions. Validation occurs when documents are `.save()` or `.create()`.

```javascript
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"], // Custom error message
    minlength: [3, "Name must have at least 3 characters"],
    maxlength: 50,
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"],
    max: 10000,
  },
  category: {
    type: String,
    // Restrict string to specific allowed values
    enum: {
      values: ["Electronics", "Clothing", "Books"],
      message: "{VALUE} is not a valid category",
    },
  },
  discountCode: {
    type: String,
    // Custom Validator
    validate: {
      validator: function (v) {
        return /^[A-Z0-9]{5,10}$/.test(v); // Regex validation
      },
      message: (props) => `${props.value} is not a valid discount code format!`,
    },
  },
});
```

---

## MVC Architecture with Mongoose

MVC (Model-View-Controller) is a design pattern used to decouple data, user-interface, and control logic. In an API-driven Node.js application, the "View" is typically replaced by JSON responses, but the architecture (Routes controlling endpoints, Controllers containing logic, Models abstracting database operations) remains.

### Example Directory Structure

```
project-root/
│
├── models/
│   └── User.js         # Mongoose schemas and models
│
├── controllers/
│   └── userController.js # Business logic and request handling
│
├── routes/
│   └── userRoutes.js   # API endpoint definitions mapped to controllers
│
└── app.js              # Express app setup and server initialization
```

### 1. Model (`models/User.js`)

Responsible ONLY for defining the structure and data operations.

```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: Number,
});

module.exports = mongoose.model("User", userSchema);
```

### 2. Controller (`controllers/userController.js`)

Contains the core business logic. Takes the request `req`, processes it using Models, and sends back an HTTP response `res`.

```javascript
const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body); // Directly uses model creation
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
```

### 3. Routes (`routes/userRoutes.js`)

Maps incoming HTTP methods and URLs to specific controller functions.

```javascript
const express = require("express");
const router = express.Router();
const { getAllUsers, createUser } = require("../controllers/userController");

// Endpoint: GET /users
router.get("/", getAllUsers);

// Endpoint: POST /users
router.post("/", createUser);

module.exports = router;
```

### 4. Main App (`app.js`)

The entry point. Wires middleware, database connections, and base routes.

```javascript
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(express.json()); // Built-in middleware to parse JSON body

mongoose
  .connect("mongodb://localhost:27017/myDatabase")
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("DB error:", err));

// Mount routes on specific paths
app.use("/api/users", userRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));
```

---

## MongoDB Indexing (Mongosh Commands)

Indexes speed up read query performance by minimizing the number of documents MongoDB has to scan to fulfill a query.

- **Without Index**: Scan every document in the collection (Full Collection Scan) → **O(n)**
- **With Index**: Use the index (like a shortcut) → **O(log n)**

> **Important Note:** The examples below portray native MongoDB Shell (`mongosh`) commands interacting with actual MongoDB collections, instead of Mongoose schema-level declarations.

### Key Concepts & Best Practices

1. **B-Tree Structure**: Indices are stored in B-Trees (Balanced Trees) to keep data sorted, allowing for efficiently searchable, sequential access and logarithmic-time operations.
2. **Performance Trade-offs**:
   - **Pros**: Drastically speeds up read operations.
   - **Cons**: Takes up additional storage space in RAM and disk. It can also slow down **write** operations (inserts, updates, deletes) because the index must be explicitly maintained and updated every time data is added or modified.
3. **Explaining Queries**: The `.explain("executionStats")` method is a vital tool to analyze how queries are executed. It confirms whether the query is utilizing an index (via an `IXSCAN` stage) or doing a full collection scan (via a `COLLSCAN` stage).
   ```javascript
   db.users.find({ age: 25 }).explain("executionStats");
   ```
4. **Creating and Dropping Indices**:
   - **Create:** `db.collection.createIndex({ field: 1 })`
   - **Drop a Specific Index:** `db.collection.dropIndex("index_name")` or `db.collection.dropIndex({ field: 1 })`
   - **Drop All Indices:** `db.collection.dropIndexes()`

### 1. Single Field Index

An index on a discrete single field.

```javascript
// Creates an index on the 'email' field.
// 1 specifies ascending order, -1 specifies descending order.
db.users.createIndex({ email: 1 });
```

### 2. Compound Index

An index that holds references to multiple fields. Order of fields in a compound index matters significantly for query optimization.

```javascript
// Creates a compound index on 'name' and 'age'
db.users.createIndex({ name: 1, age: -1 });

// This index will efficiently support queries analyzing just 'name',
// or both 'name' and 'age', but NOT queries analyzing just 'age' because of the leftmost prefix rule.
```

### 3. Unique Index

Ensures that the indexed fields do not store duplicate values.

```javascript
// Rejects any documents that have an email trying to match an already inserted email.
db.users.createIndex({ email: 1 }, { unique: true });
```

### 4. TTL (Time-To-Live) Index

Automatically expires and deletes documents from a collection after a certain amount of time. Highly useful for session data or temporary logs.
_Note: TTL indexes only work on date fields or arrays of date fields._

```javascript
// Auto-delete documents 3600 seconds (1 hour) after their 'createdAt' timestamp
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });
```

### 5. Multikey Index

When you index a field that holds an array, MongoDB automatically creates a "multikey" index, which indexes every element of the array.

```javascript
// Assuming documents look like: { name: "John", hobbies: ["Reading", "Cooking"] }
// MongoDB creates an index entry for "Reading" and another for "Cooking"
db.users.createIndex({ hobbies: 1 });
```

### 6. Text Index

Supports text search queries on string content. A collection can have at most one text index.

```javascript
// Creates text indexes for searchable text properties
db.articles.createIndex({ title: "text", description: "text" });

// Usage via mongosh:
// db.articles.find({ $text: { $search: "database engineering" } });
```

### 7. Covered Queries (Covered Index)

A "covered query" happens when all the fields queried are part of an index, AND all the fields returned in the results are in the same index. Since the index itself satisfies the query, MongoDB doesn't have to scan or load the actual document—resulting in extreme performance optimizations.

```javascript
// Step 1: Create compound index
db.users.createIndex({ email: 1, age: 1 });

// Step 2: Write a query requesting only 'email' and 'age', explicitly excluding '_id'
// Because _id is usually returned by default, it would un-cover the query if not excluded.
db.users.find({ email: "john@example.com" }, { email: 1, age: 1, _id: 0 });
```

### 8. Background Index Creation

By default, creating an index locks the database temporarily. Building an index in the background prevents blocking other database operations during index creation.

```javascript
// The index creation will yield to incoming DB queries.
// Note: In MongoDB 4.2+, index builds are background-like by default, and this option is mostly ignored.
db.users.createIndex({ email: 1 }, { background: true });
```

### 9. Partial Index

Indexes only the documents in a collection that meet a specified filter expression. This reduces index size and operational overhead.

```javascript
// Will ONLY index documents where age is greater than or equal to 18
db.users.createIndex(
  { email: 1 },
  { partialFilterExpression: { age: { $gte: 18 } } }
);
```

---

## Advanced Indexing Concepts

### 1. Index Cardinality
Cardinality refers to the uniqueness of data values contained in a specific field.
- **High Cardinality**: Contains a large proportion of unique values (e.g., `email`, `userId`, `socialSecurityNumber`).
- **Low Cardinality**: Contains many repeating values (e.g., `gender`, `status` [active/inactive], `boolean` values).

**Best Practice**: You should generally build indexes on fields with **High Cardinality**. Indexing a low-cardinality field (like a boolean) does little to narrow down search results and wastes storage.

### 2. The Winning Plan
When you run a query, MongoDB's Query Optimizer determines the most efficient way to execute it.
- If there are multiple indexes that could satisfy a query, MongoDB tests all feasible query plans concurrently.
- The plan that returns trial results the fastest is chosen as the **Winning Plan**.
- The `Winning Plan` is cached and used for subsequent identical-shaped queries.

### 3. Plan Cache and Reset
- **Plan Cache**: To avoid re-evaluating optimal indexes constantly, MongoDB caches the Winning Plan for a given query shape.
- **Cache Reset**: The cache is automatically evicted/reset when:
  - The number of documents changes significantly (collection data gets modified or deleted past a threshold).
  - Indexes are created or dropped.
  - The `mongod` process restarts.
  - You can manually clear it using the shell: `db.collection.getPlanCache().clear()`.

### 4. Primary Keys vs. Clustered Indexes
In standard databases, people often assume the Primary Key is always the Clustered Index. **This is not universally true.**

> **What is a Clustered Index?**
> A clustered index determines the physical order of data in a table/collection. The data is physically stored in the same order as the index itself, meaning the table **is** the index.
> *Example:* `[1] Rahul`, `[2] Amit`, `[3] Neha`

> **What is a Non-Clustered Index?**
> A separate structure from the data itself. It contains the indexed field (e.g., `name`) and a pointer referencing the actual physical location of the row/document.
> *Example:* Index: `name → pointer → actual_document`

#### Behavior Across Databases:
- **MySQL (InnoDB):** The Primary Key is the Clustered Index by default. 
- **PostgreSQL:** The Primary Key is **NOT** automatically clustered. It merely creates a unique B-Tree index structure.
- **MongoDB:** Prior to MongoDB 5.3, all MongoDB collections used non-clustered indexes. Now, MongoDB supports *Clustered Collections* where documents are physically ordered by the `_id` field (the Clustered Index). However, general indexes you create explicitly are **Non-Clustered**.
