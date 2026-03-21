# Aggregation Practice and Query Planner in MongoDB

MongoDB’s aggregation framework is a powerful tool for analyzing and processing data in stages. Additionally, the **Query Planner** is an essential component for understanding and optimizing query performance. This guide covers hands-on aggregation examples from beginner to expert levels, followed by an in-depth look at the Query Planner.

---

## Part 1: Aggregation Practice

To follow along with these examples, let's first set up our sample data across four collections: `users`, `products`, `orders`, and `reviews`.

### 1. Sample Data Setup

```javascript
// 1. Users Collection
db.users.insertMany([
  { _id: 1, name: "Rahul", age: 28, city: "Ahmedabad", isPremium: true },
  { _id: 2, name: "Amit", age: 32, city: "Mumbai", isPremium: false },
  { _id: 3, name: "Neha", age: 25, city: "Delhi", isPremium: true },
  { _id: 4, name: "Priya", age: 30, city: "Ahmedabad", isPremium: false }
]);

// 2. Products Collection
db.products.insertMany([
  { _id: 101, name: "Laptop", category: "Electronics", price: 70000 },
  { _id: 102, name: "Phone", category: "Electronics", price: 30000 },
  { _id: 103, name: "Shoes", category: "Fashion", price: 2000 },
  { _id: 104, name: "Watch", category: "Fashion", price: 5000 },
  { _id: 105, name: "Tablet", category: "Electronics", price: 25000 }
]);

// 3. Orders Collection
db.orders.insertMany([
  {
    _id: 1001,
    userId: 1,
    status: "delivered",
    createdAt: ISODate("2024-01-10T00:00:00Z"),
    items: [
      { productId: 101, quantity: 1 },
      { productId: 103, quantity: 2 }
    ]
  },
  {
    _id: 1002,
    userId: 2,
    status: "pending",
    createdAt: ISODate("2024-02-15T00:00:00Z"),
    items: [
      { productId: 102, quantity: 1 }
    ]
  },
  {
    _id: 1003,
    userId: 1,
    status: "delivered",
    createdAt: ISODate("2024-03-01T00:00:00Z"),
    items: [
      { productId: 104, quantity: 3 }
    ]
  },
  {
    _id: 1004,
    userId: 3,
    status: "cancelled",
    createdAt: ISODate("2024-03-05T00:00:00Z"),
    items: [
      { productId: 105, quantity: 1 }
    ]
  }
]);

// 4. Reviews Collection
db.reviews.insertMany([
  { _id: 1, productId: 101, userId: 1, rating: 5 },
  { _id: 2, productId: 101, userId: 2, rating: 4 },
  { _id: 3, productId: 102, userId: 3, rating: 3 },
  { _id: 4, productId: 103, userId: 1, rating: 4 }
]);
```

---

### 🟢 Beginner Level

These queries use fundamental aggregation stages like `$match`, `$group`, `$sort`, and `$limit`.

#### 1. Find all delivered orders
Uses the `$match` stage to filter documents, similar to a standard `find()` query.
```javascript
db.orders.aggregate([
  { $match: { status: "delivered" } }
]);
```

#### 2. Count total orders per status
Groups documents by `status` and increments a counter for each.
```javascript
db.orders.aggregate([
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 }
    }
  }
]);
```

#### 3. Count total users per city
Groups the `users` collection by the `city` field.
```javascript
db.users.aggregate([
  {
    $group: {
      _id: "$city",
      totalUsers: { $sum: 1 }
    }
  }
]);
```

#### 4. Find the average age of all users
Using `null` for `_id` groups all documents into a single bucket.
```javascript
db.users.aggregate([
  {
    $group: {
      _id: null,
      avgAge: { $avg: "$age" }
    }
  }
]);
```

#### 5. Sort products by price (Descending)
```javascript
db.products.aggregate([
  { $sort: { price: -1 } }
]);
```

#### 6. Find the top 2 most expensive products
Combines `$sort` with `$limit`.
```javascript
db.products.aggregate([
  { $sort: { price: -1 } },
  { $limit: 2 }
]);
```

---

### 🟡 Intermediate Level

These focus on working with arrays using `$unwind`, shaping data with `$project`, and creating new fields with `$addFields`.

#### 7. Total items sold per product
`$unwind` deconstructs the `items` array so each element can be processed individually.
```javascript
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.productId",
      totalSold: { $sum: "$items.quantity" }
    }
  }
]);
```

#### 8. Total quantity of items per order
Using `$addFields` to dynamically sum properties inside an array.
```javascript
db.orders.aggregate([
  {
    $addFields: {
      totalQty: { $sum: "$items.quantity" }
    }
  }
]);
```

#### 9. List all `productId`s that have been sold
`$project` includes or excludes specific fields in the output documents.
```javascript
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $project: {
      _id: 0,
      productId: "$items.productId"
    }
  }
]);
```

#### 10. Count how many times each product was involved in an order
```javascript
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.productId",
      orderCount: { $sum: 1 }
    }
  }
]);
```

---

### 🟠 Advanced Level (`$lookup` & Joins)

MongoDB avoids joins by design, but `$lookup` provides a way to perform left outer joins between collections.

#### 11. Fetch orders along with user details
```javascript
db.orders.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user"
    }
  },
  { $unwind: "$user" } // Flattens the resulting array into a single object
]);
```

#### 12. Fetch orders along with product details
```javascript
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $lookup: {
      from: "products",
      localField: "items.productId",
      foreignField: "_id",
      as: "productDetails"
    }
  },
  { $unwind: "$productDetails" }
]);
```

#### 13. Calculate total spending per user
Requires joining `orders` with `products` to fetch the price, then computing the sum.
```javascript
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $lookup: {
      from: "products",
      localField: "items.productId",
      foreignField: "_id",
      as: "product"
    }
  },
  { $unwind: "$product" },
  {
    $group: {
      _id: "$userId",
      totalSpent: {
        $sum: { $multiply: ["$items.quantity", "$product.price"] }
      }
    }
  }
]);
```

#### 14. Find users who have never placed an order
Looks up `orders` and matches documents where the resulting array is empty.
```javascript
db.users.aggregate([
  {
    $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "userId",
      as: "orders"
    }
  },
  {
    $match: { orders: { $size: 0 } } // Checks for an empty array
  }
]);
```

#### 15. Retrieve orders that contain "Electronics" products
```javascript
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $lookup: {
      from: "products",
      localField: "items.productId",
      foreignField: "_id",
      as: "product"
    }
  },
  { $unwind: "$product" },
  {
    $match: { "product.category": "Electronics" }
  }
]);
```

---

### 🔴 Expert Level

#### 16. Calculate total overall revenue across all orders
```javascript
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $lookup: {
      from: "products",
      localField: "items.productId",
      foreignField: "_id",
      as: "product"
    }
  },
  { $unwind: "$product" },
  {
    $group: {
      _id: null,
      revenue: {
        $sum: { $multiply: ["$items.quantity", "$product.price"] }
      }
    }
  }
]);
```

#### 17. Find the top spending user
Calculates total spent per user, sorts by total, and grabs the top 1. 
```javascript
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $lookup: {
      from: "products",
      localField: "items.productId",
      foreignField: "_id",
      as: "product"
    }
  },
  { $unwind: "$product" },
  {
    $group: {
      _id: "$userId",
      total: {
        $sum: { $multiply: ["$items.quantity", "$product.price"] }
      }
    }
  },
  { $sort: { total: -1 } },
  { $limit: 1 }
]);
```

#### 18. Calculate average order value per user
```javascript
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $lookup: {
      from: "products",
      localField: "items.productId",
      foreignField: "_id",
      as: "product"
    }
  },
  { $unwind: "$product" },
  {
    $group: {
      _id: { userId: "$userId", orderId: "$_id" },
      orderValue: {
        $sum: { $multiply: ["$items.quantity", "$product.price"] }
      }
    }
  },
  {
    $group: {
      _id: "$_id.userId",
      avgOrderValue: { $avg: "$orderValue" }
    }
  }
]);
```

#### 19. Identify the most popular product (highest sold quantity)
```javascript
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.productId",
      qtySold: { $sum: "$items.quantity" }
    }
  },
  { $sort: { qtySold: -1 } },
  { $limit: 1 }
]);
```

#### 20. Find users with more than 1 order
```javascript
db.orders.aggregate([
  {
    $group: {
      _id: "$userId",
      totalOrders: { $sum: 1 }
    }
  },
  {
    $match: { totalOrders: { $gt: 1 } }
  }
]);
```

#### 21. Flag High-Value Orders (>50k)
Calculates order total and explicitly sets a boolean flag based on a condition.
```javascript
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $lookup: {
      from: "products",
      localField: "items.productId",
      foreignField: "_id",
      as: "product"
    }
  },
  { $unwind: "$product" },
  {
    $group: {
      _id: "$_id",
      total: {
        $sum: { $multiply: ["$items.quantity", "$product.price"] }
      }
    }
  },
  {
    $addFields: {
      isHighValue: { $gt: ["$total", 50000] }
    }
  }
]);
```

---

### 🧩 Array Operators

Working natively with arrays inside aggregation without breaking them down with `$unwind`.

#### 22. Using `$map` to reshape elements within an array
Useful for applying an operation directly to elements of an array.
```javascript
db.orders.aggregate([
  {
    $addFields: {
      itemTotals: {
        $map: {
          input: "$items",
          as: "item",
          in: {
            productId: "$$item.productId",
            totalQty: "$$item.quantity"
          }
        }
      }
    }
  }
]);
```

#### 23. Using `$filter` to keep specific items
Filters array members based on a condition.
```javascript
db.orders.aggregate([
  {
    $addFields: {
      filteredItems: {
        $filter: {
          input: "$items",
          as: "item",
          cond: { $gt: ["$$item.quantity", 1] }
        }
      }
    }
  }
]);
```

#### 24. Calculate total quantity purely with `$reduce`
Reduces the array into a single value based on mathematical/string operations.
```javascript
db.orders.aggregate([
  {
    $addFields: {
      totalQty: {
        $reduce: {
          input: "$items",
          initialValue: 0,
          in: { $add: ["$$value", "$$this.quantity"] }
        }
      }
    }
  }
]);
```

#### 25. Add an Order Size Label dynamically using `$switch`
Acts like an `if/else` or `switch` block in other languages.
```javascript
db.orders.aggregate([
  {
    $addFields: {
      orderSize: {
        $switch: {
          branches: [
            { case: { $lt: [{ $size: "$items" }, 2] }, then: "SMALL" },
            { case: { $lte: [{ $size: "$items" }, 3] }, then: "MEDIUM" }
          ],
          default: "LARGE"
        }
      }
    }
  }
]);
```

---

### 🪄 Facet & Analytics

#### 26. Dashboard aggregation using `$facet`
`$facet` allows running multiple independent aggregations simultaneously on the same set of documents.
```javascript
db.orders.aggregate([
  {
    $facet: {
      totalOrders: [{ $count: "count" }],
      statuses: [
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]
    }
  }
]);
```

#### 27. Categorize users into Age Buckets
Automatically groups records into defined boundaries.
```javascript
db.users.aggregate([
  {
    $bucket: {
      groupBy: "$age",
      boundaries: [20, 26, 31, 40],
      default: "Other",
      output: {
        count: { $sum: 1 }
      }
    }
  }
]);
```

---

### 🔥 Real-World Scenarios

#### 28. Monthly Revenue/Order count summary
Using date operators to group data logically.
```javascript
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $group: {
      _id: { $month: "$createdAt" },
      totalOrders: { $sum: 1 }
    }
  }
]);
```

#### 29. Daily order count
```javascript
db.orders.aggregate([
  {
    $group: {
      _id: { $dayOfMonth: "$createdAt" },
      count: { $sum: 1 }
    }
  }
]);
```

#### 30. Find users who both ordered AND left a review
```javascript
db.users.aggregate([
  {
    $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "userId",
      as: "orders"
    }
  },
  {
    $lookup: {
      from: "reviews",
      localField: "_id",
      foreignField: "userId",
      as: "reviews"
    }
  },
  {
    $match: {
      "orders.0": { $exists: true }, // Checks if array has at least 1 element
      "reviews.0": { $exists: true }
    }
  }
]);
```

---
---

## Part 2: Query Planner in MongoDB

When we issue a query to MongoDB, it must decide the most effective way to fetch the required data. This internal system is called the **Query Planner**.

### 1. What is the Query Planner?
The Query Planner is an intelligent optimizer inside MongoDB that dictates the strategy (plan) for executing a given query. It generates options and determines the **"Winning Plan"** based on performance trials.

**What it analyzes:**
- The best index (or combinations of indexes) to use.
- The order of stages in a query or aggregation pipeline.
- Evaluation of collection scans vs. index scans.
- In-memory sorting capabilities vs. index-based sorting.

### 2. How to Investigate Query Plans?

We use the `.explain()` method chained to our query to introspect.
```javascript
// Provides basic information about the winning plan
db.collection.find({ ... }).explain();

// Provides execution metrics, times, and index hit details
db.collection.find({ ... }).explain("executionStats");

// Provides metrics for BOTH the winning plan AND rejected plans for deeper debugging
db.collection.find({ ... }).explain("allPlansExecution");
```

### 3. Understanding the Explain Output

The output of `.explain("executionStats")` is an object. Here are the core conceptual fields:

#### `queryPlanner`
Contains information strictly about how MongoDB planned the query:
- `winningPlan`: The most optimized plan MongoDB selected. Look for `IXSCAN` (Index Scan) vs `COLLSCAN` (Collection Scan).
- `rejectedPlans`: A list of plans that were discarded during optimization.

#### `executionStats`
Details of how the *winning plan* actually performed in real-time execution.
- `executionTimeMillis`: Total execution time. The lower, the better.
- `totalDocsExamined`: How many actual documents MongoDB had to read from disk/memory.
- `totalKeysExamined`: How many index keys MongoDB checked. 
  - *Note: If `totalDocsExamined` is vastly greater than your returned documents, you have a missing index.*
- `executionStages`: Detailed breakdown metric for every step of the plan.

### 4. Practical Example
Let's see what happens when querying the `users` collection without an index on `age`.

```javascript
db.users.find({ age: { $gt: 25 } }).explain("executionStats");
```

**What to look for in the output:**
If there is no index on `age`, the output's `queryPlanner.winningPlan.stage` will show `"COLLSCAN"` (Collection Scan), meaning MongoDB checked the `age` property sequentially on every single user document. 

If you create an index (`db.users.createIndex({ age: 1 })`), the output will instead show `"IXSCAN"`, which is highly efficient.

---

### 5. Common Optimization Tips & Best Practices

1. **Cover Your Queries with Indexes:** Always aim for an `IXSCAN` (Index Scan). Better yet, use compound indexes to map exactly to complex queries containing multiple conditions.
2. **Limit Returned Mapped Fields (`$project`):** Limit network traffic and memory by projecting only the necessary fields, not whole bulk documents.
3. **Filter Early and Filter Often:** In aggregations, always put the `$match` and `$sort` operators as early in the pipeline as possible to dramatically reduce the dataset size passed to subsequent, heavier operations.
4. **Avoid `$where` Operations:** The `$where` queries invoke the JavaScript interpreter per document, making them catastrophically slow. Use native MongoDB query operators wherever possible.
5. **Use Sorting Effectively:** Sorting on unindexed fields triggers an in-memory sort which has a 100MB limit and is slow. If you need to sort by a field iteratively, put an index on it.
