# Comprehensive Guide to GraphQL with Node.js, Apollo Server, and Prisma

This document contains detailed, topic-wise notes, descriptions, and examples based on the "Complete GraphQL Series" and "Threads App GraphQL Clone" architecture tutorials.

---

## 1. What is GraphQL?
GraphQL is a query language for APIs and a runtime for fulfilling those queries with your existing data. It provides a more efficient, powerful, and flexible alternative to REST. 

### GraphQL vs. REST
- **No Over-fetching or Under-fetching:** In REST, an endpoint returns a fixed data structure. In GraphQL, the client requests exactly what it needs, and nothing more.
- **Single Endpoint:** REST typically requires multiple endpoints (e.g., `/users`, `/posts`). GraphQL uses a single endpoint (e.g., `/graphql`) to access all data.
- **Strongly Typed:** GraphQL APIs are organized in terms of types and fields, not endpoints. Using a schema, the frontend knows exactly what data is available.

---

## 2. Setting up a Basic GraphQL Server
The most common way to build a GraphQL server in Node.js is using `@apollo/server` along with `express`.

### Installation
```bash
npm install @apollo/server express cors body-parser graphql
```

### Basic Server Setup (`index.js`)
Here is a minimal setup for an Express-based Apollo GraphQL server.

```javascript
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const cors = require('cors');
const bodyParser = require('body-parser');

async function startServer() {
  const app = express();

  // 1. Define GraphQL Schema (TypeDefs)
  // This defines the structure of your data and the available queries/mutations.
  const typeDefs = `
    type User {
      id: ID!
      name: String!
      email: String!
      age: Int
    }

    type Query {
      getUsers: [User]
      getUserById(id: ID!): User
    }
  `;

  // 2. Define Resolvers
  // Resolvers provide the instructions for turning a GraphQL operation into data.
  const resolvers = {
    Query: {
      getUsers: () => [
        { id: "1", name: "John Doe", email: "john@example.com", age: 30 },
        { id: "2", name: "Jane Smith", email: "jane@example.com", age: 25 }
      ],
      getUserById: (parent, { id }) => {
        const users = [
          { id: "1", name: "John Doe", email: "john@example.com", age: 30 },
          { id: "2", name: "Jane Smith", email: "jane@example.com", age: 25 }
        ];
        return users.find(user => user.id === id);
      }
    }
  };

  // 3. Initialize Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  // 4. Apply Middleware
  app.use('/graphql', cors(), bodyParser.json(), expressMiddleware(server));

  app.listen(8000, () => {
    console.log('Server is running at http://localhost:8000/graphql');
  });
}

startServer();
```

---

## 3. Core Concepts in GraphQL

### Type Definitions (`typeDefs`)
The schema defines the shape of the data. Every GraphQL service defines a set of types which completely describe the set of possible data you can query on that service.
- `String`, `Int`, `Float`, `Boolean`, `ID` (Scalars)
- `!` means the field is non-nullable (required).
- `[Type]` means an array containing objects of that type.

### Queries and Mutations
- **Query:** Used to fetch data (like a `GET` request in REST).
- **Mutation:** Used to modify data (create, update, delete) (like `POST`, `PUT`, `DELETE` in REST).

Example adding a Mutation to the schema:
```graphql
type Mutation {
  createUser(name: String!, email: String!, age: Int): User
}
```

### Resolvers
The actual functions that fetch the data for the fields defined in the schema.
```javascript
const resolvers = {
  Query: { ... },
  Mutation: {
    createUser: (parent, args) => {
      const newUser = { id: Date.now().toString(), ...args };
      // Insert into DB...
      return newUser;
    }
  }
}
```

---

## 4. GraphQL with Prisma and PostgreSQL Setup

Prisma is a next-generation Node.js and TypeScript ORM. It shines when combined with GraphQL because Prisma's strongly typed auto-generated client pairs perfectly with GraphQL's type system.

### Setup Prisma
```bash
npm install prisma --save-dev
npx prisma init
```

### Define `schema.prisma`
In `prisma/schema.prisma`, configure the database connection and models.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    String @id @default(uuid())
  name  String
  email String @unique
  posts Post[]
}

model Post {
  id       String @id @default(uuid())
  title    String
  content  String
  authorId String
  author   User   @relation(fields: [authorId], references: [id])
}
```

Migrate connection and generate client:
```bash
npx prisma migrate dev --name init
npm install @prisma/client
```

### Using Prisma in GraphQL Resolvers

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const resolvers = {
  Query: {
    getUsers: async () => await prisma.user.findMany(),
    getUserById: async (_, { id }) => await prisma.user.findUnique({ where: { id } })
  },
  Mutation: {
    createUser: async (_, { name, email }) => {
      return await prisma.user.create({
        data: { name, email }
      });
    }
  },
  // Field-level resolvers for relations (fetching a User's posts)
  User: {
    posts: async (parent) => {
      // 'parent' context contains the User object.
      return await prisma.post.findMany({ where: { authorId: parent.id } });
    }
  }
};
```

---

## 5. Backend Architecture & Refactoring (Threads App Clone)

When your application grows, keeping all `typeDefs` and `resolvers` in `index.js` becomes unmanageable. Proper backend architecture requires refactoring the code into modular chunks.

### A Modular Folder Structure
Instead of a monolithic file, organize the GraphQL code by domain/feature (e.g., Users, Posts).

```text
src/
├── graphql/
│   ├── index.js           # Combines all schemas and resolvers
│   ├── user/
│   │   ├── index.js       # Exports user-related GraphQL bits
│   │   ├── typeDefs.js    # User GraphQL types
│   │   ├── queries.js     # User Query definitions
│   │   ├── mutations.js   # User Mutation definitions
│   │   ├── resolvers.js   # User Resolver implementations
│   ├── post/
│   │   ├── index.js
│   │   ├── typeDefs.js
│   │   ├── queries.js
│   │   ├── mutations.js
│   │   ├── resolvers.js
├── index.js               # Main Server entry point
```

### Example: Refactoring the `User` Domain

**`src/graphql/user/typeDefs.js`**
```javascript
exports.typeDefs = `
  type User {
    id: ID!
    name: String!
    email: String!
  }
`;
```

**`src/graphql/user/queries.js`**
```javascript
exports.queries = `
  getUsers: [User]
  getUserById(id: ID!): User
`;
```

**`src/graphql/user/mutations.js`**
```javascript
exports.mutations = `
  createUser(name: String!, email: String!): User
`;
```

**`src/graphql/user/resolvers.js`**
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.resolvers = {
  queries: {
    getUsers: async () => await prisma.user.findMany(),
    getUserById: async (_, { id }) => await prisma.user.findUnique({ where: { id } }),
  },
  mutations: {
    createUser: async (_, { name, email }) => {
      return await prisma.user.create({ data: { name, email } });
    }
  }
};
```

**`src/graphql/user/index.js`**
```javascript
const { typeDefs } = require('./typeDefs');
const { queries } = require('./queries');
const { mutations } = require('./mutations');
const { resolvers } = require('./resolvers');

exports.User = { typeDefs, queries, mutations, resolvers };
```

### Combining Everything in `src/graphql/index.js`
Create a master schema builder that takes all individual domains and constructs the final schema for Apollo Server.

```javascript
const { User } = require('./user');
const { Post } = require('./post'); // Assuming similar setup for Posts

const typeDefs = `
  ${User.typeDefs}
  ${Post.typeDefs}

  type Query {
    ${User.queries}
    ${Post.queries}
  }

  type Mutation {
    ${User.mutations}
    ${Post.mutations}
  }
`;

const resolvers = {
  Query: {
    ...User.resolvers.queries,
    ...Post.resolvers.queries,
  },
  Mutation: {
    ...User.resolvers.mutations,
    ...Post.resolvers.mutations,
  }
};

exports.createGraphqlServer = () => {
    return new ApolloServer({
        typeDefs,
        resolvers,
    });
};
```

### Main Entry Point (`src/index.js`)
```javascript
const express = require('express');
const { expressMiddleware } = require('@apollo/server/express4');
const { createGraphqlServer } = require('./graphql');

async function init() {
  const app = express();
  
  // Create modular server
  const gqlServer = createGraphqlServer();
  await gqlServer.start();

  app.use('/graphql', express.json(), expressMiddleware(gqlServer));

  app.listen(8000, () => console.log('Server started on PORT 8000'));
}

init();
```

### Architectural Benefits:
1. **Clean Code:** Separation of concerns.
2. **Scalability:** New features (like `Comments` or `Likes`) can be added just by creating a new folder in `src/graphql/` and importing it into the master `index.js`.
3. **Collaboration:** Multiple team members can work on different domains without causing merge conflicts in a single `schema.graphql` or monolithic `resolvers.js` file.
