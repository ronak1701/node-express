# Practical: MongoDB Integration & Advanced Analytics with Node.js

This practical demonstrates **CRUD operations** and **Advanced MongoDB Aggregation** within an eCommerce domain. The focus is on integrating multiple collections (Users, Products, and Orders) to perform complex data processing and derive business insights.

## 🚀 Key Features

-   **User CRUD**: Full management of user profiles using custom numeric IDs.
-   **Multi-Collection Integration**: Linking orders with products and users.
-   **Advanced Aggregation Pipelines**: Extensive use of MongoDB's `$lookup`, `$unwind`, `$group`, and `$project` stages.
-   **Data Analytics**: Calculating revenue and spending patterns based on relational data stored in non-relational MongoDB.

---

## 🛠️ Project Structure & Architecture

```text
013-mongoNodeIntegration-analytics/
├── controller/
│   ├── analyticsController.js  # Aggregation pipeline logic
│   └── userController.js       # Standard CRUD operations
├── models/
│   ├── usersModel.js           # User Schema (id, name, age, city)
│   ├── productModel.js         # Product Schema (id, name, price, category)
│   └── oderModel.js            # Order Schema (id, userId, items, status)
├── routes/
│   ├── analyticsRoutes.js      # Analytics-specific endpoints
│   └── userRoute.js            # Standard user management routes
├── connection.js               # MongoDB connection & configuration
├── index.js                    # Server entry point
└── package.json
```

---

## 📊 Detailed Analytics Breakdown

The analytics engine uses the MongoDB **Aggregation Framework** to join and transform data.

### 1. Overall Revenue Calculation
-   **Endpoint**: `/api/analytics/totalRevenue`
-   **Logic**:
    -   `$unwind`: Deconstructs the `items` array from order documents.
    -   `$lookup`: Performs a left outer join to the `products` collection.
    -   `$group`: Calculates revenue by multiplying `quantity` with product `price`.

### 2. User Spending Analysis
-   **Endpoint**: `/api/analytics/totalSpendingPerUser`
-   **Logic**: Aggregates all orders and joins them with product data to determine the total financial contribution of each user (identified by `userId`).

### 3. Category Performance
-   **Endpoint**: `/api/analytics/totalSpendingPerCategory`
-   **Logic**: Groups sales data by product `category` to identify which segments are generating the most revenue.

---

## 🚦 API Reference

### User Management (`/api/users`)
-   `GET /`: List all users.
-   `POST /`: Add a new user.
-   `GET /:id`: Retrieve a specific user by custom ID.
-   `PUT /:id`: Update user information.
-   `DELETE /:id`: Remove a user record.

### Analytics Insight (`/api/analytics`)
-   `GET /totalRevenue`: View total system revenue and order volume.
-   `GET /totalSpendingPerUser`: Breakdown of spending per user account.
-   `GET /totalSpendingPerCategory`: Breakdown of sales by product category.

---

## 📝 Technical Notes
-   **Custom IDs**: This project uses a custom `Number` field named `id` as a unique identifier for business logic instead of default `ObjectId`.
-   **Port Configuration**: The server runs on port `5000` and connects to a localized MongoDB instance.
