# Redis Guide

## Introduction to Redis
Redis (Remote Dictionary Server) is an open-source, in-memory data structure store, used as a database, cache, and message broker. Since it stores data in memory rather than on disk, it delivers sub-millisecond response times, making it ideal for real-time applications such as caching, session management, gaming, leaderboards, real-time analytics, geospatial tracking, and more.

**Key Features:**
- **In-Memory Storage:** Extremely fast read and write operations.
- **Key-Value Store:** Data is stored as key-value pairs but values can be complex data structures.
- **Persistence:** Can be configured to save data to disk (RDB and AOF) to provide durability.
- **Pub/Sub Messaging:** Supports publish/subscribe messaging paradigms.

## Installing Redis
There are multiple ways to install Redis, depending on your operating system.

### macOS (using Homebrew)
```bash
brew install redis
brew services start redis
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
```

### Windows (using WSL or Docker)
Using Docker is highly recommended for Windows (using `redis-stack` which includes RedisInsight on port 8001):
```bash
docker run -d --name my-redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

To access the Redis CLI inside the Docker container:
```bash
docker exec -it my-redis-stack redis-cli
```

## Redis Strings
Strings are the most basic type of value you can store in Redis. A string can contain any kind of data, such as numbers, serialized objects, or simple text. A string value can be at most 512 MB in length.

**Examples:**
```redis
# Setting a key
SET username "john_doe"

# Getting a key
GET username
# Returns: "john_doe"

# Deleting a key
DEL username

# Incrementing/Decrementing numbers
SET counter 10
INCR counter     # Returns 11
DECR counter     # Returns 10
INCRBY counter 5 # Returns 15

# Setting with Expiration (TTL in seconds)
SETEX session_token 3600 "abc123xyz"
```

## Redis Lists (Queues & Stacks)
Redis Lists are simply linked lists of strings. They are great for implementing queues (FIFO) and stacks (LIFO) or maintaining a chronological list of items like a timeline.

**Examples:**
```redis
# Push elements to the Left (Head) or Right (Tail)
LPUSH messages "msg1"
LPUSH messages "msg2" # List: [msg2, msg1]
RPUSH messages "msg3" # List: [msg2, msg1, msg3]

# Read range of elements (0 to -1 gets all)
LRANGE messages 0 -1

# Pop elements from Left or Right
LPOP messages  # Removes and returns "msg2" (Stack behavior with LPUSH)
RPOP messages  # Removes and returns "msg3" (Queue behavior with LPUSH)

# Getting length
LLEN messages
```

## Redis Sets
Redis Sets are unordered collections of unique strings. You can use Sets to store unique items, check for existence, or perform operations like union, intersection, and difference.

**Examples:**
```redis
# Add elements to a set
SADD tags "nodejs"
SADD tags "redis"
SADD tags "express"
SADD tags "nodejs" # Ignored, as it must be unique

# Get all elements
SMEMBERS tags

# Check if an element exists
SISMEMBER tags "redis" # Returns 1 (true)
SISMEMBER tags "python" # Returns 0 (false)

# Remove an element
SREM tags "express"

# Intersect two sets
SADD user:1:hobbies "reading" "coding"
SADD user:2:hobbies "coding" "gaming"
SINTER user:1:hobbies user:2:hobbies # Returns "coding"
```

## Redis HashMaps
Redis Hashes are maps between string fields and string values, making them the perfect data type to represent objects (e.g., a User).

**Examples:**
```redis
# Setting multiple fields in a hash
HSET user:1001 name "John" age "30" email "john@example.com"

# Getting a single field
HGET user:1001 name # Returns "John"

# Getting all fields and values
HGETALL user:1001

# Getting all keys or values
HKEYS user:1001
HVALS user:1001

# Incrementing a specific field
HINCRBY user:1001 age 1 # Increments age to 31
```

## Ordered Sets (Priority Queue) in Redis
Similar to Sets, but every string element is associated with a floating-number value called a *score*. Elements are always sorted by their score. This is perfect for leaderboards or priority queues.

**Examples:**
```redis
# Add elements with a score
ZADD leaderboard 100 "player_1"
ZADD leaderboard 250 "player_2"
ZADD leaderboard 50 "player_3"

# Getting items in ascending order of score
ZRANGE leaderboard 0 -1 # Returns player_3, player_1, player_2

# Getting items in descending order (e.g., top players)
ZREVRANGE leaderboard 0 1 WITHSCORES # Returns player_2 (250), player_1 (100)

# Getting rank of an element
ZRANK leaderboard "player_1" # Returns 1 (0-indexed, ascending)
ZREVRANK leaderboard "player_1" # Returns 1 (0-indexed, descending)
```

## Redis Streams
Redis Streams is an append-only data structure that models an event log. It is widely used for event sourcing and tracking activity logs.

**Examples:**
```redis
# Add an entry to a stream (* meaning auto-generate ID)
XADD mystream * sensor_id 1234 temperature 19.8

# Read from a stream (0-0 gets from the beginning)
XRANGE mystream - +

# Read newly added data, blocking for up to 1000ms if no new data
XREAD BLOCK 1000 STREAMS mystream $
```

## Redis Geospatial Data
Redis can store geospatial data (longitude and latitude) and perform radius queries, making it excellent for finding locations within a certain distance.

**Examples:**
```redis
# Add location coordinates (Longitude, then Latitude)
GEOADD cities 13.361389 38.115556 "Palermo" 15.087269 37.502669 "Catania"

# Calculate the distance between two locations
GEODIST cities Palermo Catania km # Returns distance in kilometers

# Find cities within a radius
GEORADIUS cities 15 37 100 km # Finds locations within 100km of given coords
```

## Other Data Types In Redis
While strings, hashes, lists, sets, and sorted sets are the most common, Redis also offers:
1. **Bitmaps:** Operations on bits. Useful for tracking binary states (e.g., daily active users boolean array representation).
2. **HyperLogLogs:** A probabilistic data structure used to count unique things extremely efficiently with a very small memory footprint (e.g., counting unique page visits).
3. **Bitfields:** Allows operations on multiple bit fields of varying width in the same string.

## Pub-Sub in Redis
Publish/Subscribe is a messaging paradigm where senders (publishers) do not send messages directly to specific receivers (subscribers), but instead categorize messages into channels. Subscribers listen to specific channels. This allows for realtime event-driven architectures.

**Examples:**
```redis
# Subscriber listens to a channel (Run in Terminal 1)
SUBSCRIBE tech_news
# PUNSUBSCRIBE tech_news # To unsubscribe

# Publisher sends to the channel (Run in Terminal 2)
PUBLISH tech_news "Redis 7.0 is released!"
```

## Speeding up Nodejs Server with Redis
Redis is frequently used as a caching layer in Node.js applications to drastically reduce database query times and API fetching latency.

**Node.js Example (using `redis` library):**

First, install the necessary packages in your Node.js project:
```bash
npm install express redis axios
```

**Implementation Example:**
```javascript
const express = require('express');
const { createClient } = require('redis');
const axios = require('axios');

const app = express();

// Configure Redis client
const redisClient = createClient();
redisClient.on('error', (err) => console.error('Redis Client Error', err));

app.get('/users/:username', async (req, res) => {
    const { username } = req.params;

    try {
        // 1. Check if data is already in Redis cache
        const cachedData = await redisClient.get(`github_user:${username}`);
        
        if (cachedData) {
            console.log("Serving from Cache");
            // Serve from cache without hitting external API
            return res.json(JSON.parse(cachedData));
        }
        
        // 2. Data not in cache, fetch from the main source (e.g., GitHub API)
        console.log("Fetching from External API");
        const response = await axios.get(`https://api.github.com/users/${username}`);
        const data = response.data;

        // 3. Store the acquired data in the Redis cache for future requests
        // (Set expiration to 3600 seconds)
        await redisClient.setEx(`github_user:${username}`, 3600, JSON.stringify(data));

        // Serve data to the user
        return res.json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Start the server and connect to Redis
app.listen(3000, async () => {
    await redisClient.connect();
    console.log("Server running on port 3000");
});
```

Using this approach, the first request will take standard time to hit the third-party API, but any subsequent requests for the same username within the hour will be served instantaneously from Redis, minimizing database or external API load and providing significantly faster response times for clients.
