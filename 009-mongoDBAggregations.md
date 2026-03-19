# MongoDB Aggregations

MongoDB’s aggregation framework allows you to process data records and return computed results. It operates as a pipeline, where documents pass through multiple stages, being transformed or filtered at each stage.

Here is a detailed guide with examples and solutions. Let's assume we have two collections for our examples: `teachers` and `students`.

### Sample Data
**`teachers` Collection:**
```javascript
[
  { "_id": 1, "name": "Alice", "age": 30, "gender": "female", "department": "Math" },
  { "_id": 2, "name": "Bob", "age": 45, "gender": "male", "department": "Science" },
  { "_id": 3, "name": "Charlie", "age": 30, "gender": "male", "department": "Science" },
  { "_id": 4, "name": "David", "age": 50, "gender": "male", "department": "Math" }
]
```

**`students` Collection:**
```javascript
[
  { "_id": 1, "name": "Eve", "hobbies": ["reading", "painting"] },
  { "_id": 2, "name": "Frank", "hobbies": ["sports", "reading"] },
  { "_id": 3, "name": "Grace", "hobbies": ["music"] },
  { "_id": 4, "name": "Hank" } // No hobbies field
]
```

---

## 1. Match Specific Documents (Filtering)
The `$match` stage filters documents based on specific criteria before passing them to the next stage. It acts like the standard MongoDB `find()` query.

**Objective**: Find all male teachers.

**Command**:
```javascript
db.teachers.aggregate([
  { $match: { gender: "male" } }
])
```

**Output**:
```json
[
  { "_id": 2, "name": "Bob", "age": 45, "gender": "male", "department": "Science" },
  { "_id": 3, "name": "Charlie", "age": 30, "gender": "male", "department": "Science" },
  { "_id": 4, "name": "David", "age": 50, "gender": "male", "department": "Math" }
]
```

---

## 2. Group Documents by Field
The `$group` stage groups documents by a specified identifier expression and applies accumulator expressions to each group.

**Objective**: Group teachers by their `age`.

**Command**:
```javascript
db.teachers.aggregate([
  { $group: { _id: "$age" } }
])
```

**Output**:
```json
[
  { "_id": 50 },
  { "_id": 45 },
  { "_id": 30 }
]
```

---

## 3. Group and Push Items to Array
You can use the `$push` operator within `$group` to aggregate specific fields into an array.

**Objective**: Group teachers by age and create a list of their names.

**Command**:
```javascript
db.teachers.aggregate([
  { 
    $group: { 
      _id: "$age", 
      names: { $push: "$name" } 
    } 
  }
])
```

**Output**:
```json
[
  { "_id": 50, "names": ["David"] },
  { "_id": 45, "names": ["Bob"] },
  { "_id": 30, "names": ["Alice", "Charlie"] }
]
```

---

## 4. Group and Get Full Documents (`$$ROOT`)
The `$$ROOT` system variable references the root document currently being processed in the aggregation pipeline.

**Objective**: Group teachers by age and keep all the original document details in an array.

**Command**:
```javascript
db.teachers.aggregate([
  { 
    $group: { 
      _id: "$age", 
      fullDoc: { $push: "$$ROOT" } 
    } 
  }
])
```

---

## 5. Filter, Group, and Count
Combining stages is the power of the aggregation pipeline. You can filter first and then group.

**Objective**: Find the count of male teachers grouped by their age.

**Command**:
```javascript
db.teachers.aggregate([
  { $match: { gender: "male" } },
  { 
    $group: { 
      _id: "$age", 
      count: { $sum: 1 } 
    } 
  }
])
```

**Output**:
```json
[
  { "_id": 50, "count": 1 },
  { "_id": 45, "count": 1 },
  { "_id": 30, "count": 1 }
]
```

---

## 6. Filter, Group, Count, and Sort
The `$sort` stage orders the documents by the specified field(s).

**Objective**: Find the count of male teachers grouped by age, and sort the result by count in descending order.

**Command**:
```javascript
db.teachers.aggregate([
  { $match: { gender: "male" } },
  { $group: { _id: "$age", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

---

## 7. Find Maximum/Minimum Value
You can group all documents by passing `null` to `_id` and use the `$max` or `$min` accumulators.

**Objective**: Find the maximum age among all teachers.

**Command**:
```javascript
db.teachers.aggregate([
  { 
    $group: { 
      _id: null, 
      maxAge: { $max: "$age" } 
    } 
  }
])
```

**Output**:
```json
[
  { "_id": null, "maxAge": 50 }
]
```

---

## 8. Calculate Sum of Fields
Use `$sum` to add up numeric fields.

**Objective**: Calculate the total sum of all teachers' ages.

**Command**:
```javascript
db.teachers.aggregate([
  { 
    $group: { 
      _id: null, 
      totalAge: { $sum: "$age" } 
    } 
  }
])
```

---

## 9. Calculate Average
Use `$avg` to calculate the average value of a numeric field.

**Objective**: Find the average age of all teachers.

**Command**:
```javascript
db.teachers.aggregate([
  { 
    $group: { 
      _id: null, 
      avgAge: { $avg: "$age" } 
    } 
  }
])
```

---

## 10. Unwind Arrays
The `$unwind` stage deconstructs an array field from the input documents to output a separate document for each element.

**Objective**: Create a separate document for every hobby a student has.

**Command**:
```javascript
db.students.aggregate([
  { $unwind: "$hobbies" }
])
```

**Output**:
```json
[
  { "_id": 1, "name": "Eve", "hobbies": "reading" },
  { "_id": 1, "name": "Eve", "hobbies": "painting" },
  { "_id": 2, "name": "Frank", "hobbies": "sports" },
  { "_id": 2, "name": "Frank", "hobbies": "reading" },
  { "_id": 3, "name": "Grace", "hobbies": "music" }
]
```

---

## 11. Group by Unwound Field
You can combine `$unwind` and `$group` to easily analyze data stored within arrays.

**Objective**: Find out how many students have each hobby (i.e., aggregate hobbies).

**Command**:
```javascript
db.students.aggregate([
  { $unwind: "$hobbies" },
  { 
    $group: { 
      _id: "$hobbies", 
      count: { $sum: 1 } 
    } 
  }
])
```

**Output**:
```json
[
  { "_id": "music", "count": 1 },
  { "_id": "reading", "count": 2 },
  { "_id": "sports", "count": 1 },
  { "_id": "painting", "count": 1 }
]
```

---

## 12. Add to Set (Unique Values)
The `$addToSet` operator adds unique values to an array during a `$group` stage. It does not push duplicates.

**Objective**: Get a single list of all unique hobbies across all students.

**Command**:
```javascript
db.students.aggregate([
  { $unwind: "$hobbies" },
  { 
    $group: { 
      _id: null, 
      allHobbies: { $addToSet: "$hobbies" } 
    } 
  }
])
```

**Output**:
```json
[
  { "_id": null, "allHobbies": ["reading", "painting", "sports", "music"] }
]
```

---

## 13. Handle Null or Missing Fields (`$ifNull`)
When working with data that might be missing or null, `$ifNull` provides a fallback value.

**Objective**: Count the total number of hobbies across all students. If a student like "Hank" has no `hobbies` field, default it to an empty array to prevent an error when calculating `$size`.

**Command**:
```javascript
db.students.aggregate([
  { 
    $group: { 
      _id: null, 
      count: { 
        $sum: { $size: { $ifNull: ["$hobbies", []] } } 
      } 
    } 
  }
])
```

---

## 14. Filter Array Elements (`$filter`)
The `$filter` operator selects a subset of an array to return based on a specified condition.

**Objective**: For each student, find only the hobbies that equal "reading".

**Command**:
```javascript
db.students.aggregate([
  {
    $project: {
      name: 1,
      readingHobbies: {
        $filter: {
          input: { $ifNull: ["$hobbies", []] },
          as: "hobby",
          cond: { $eq: ["$$hobby", "reading"] }
        }
      }
    }
  }
])
```

**Output**:
```json
[
  { "_id": 1, "name": "Eve", "readingHobbies": ["reading"] },
  { "_id": 2, "name": "Frank", "readingHobbies": ["reading"] },
  { "_id": 3, "name": "Grace", "readingHobbies": [] },
  { "_id": 4, "name": "Hank", "readingHobbies": [] }
]
```

---

## 15. Perform Left Outer Joins (`$lookup`)
The `$lookup` stage performs a left outer join to an unsharded collection in the *same* database to filter in documents from the "joined" collection for processing.

Consider a third collection, `departments`, that maps department names to details.
**`departments` Collection:**
```javascript
[
  { "_id": 1, "name": "Math", "head": "Professor X" },
  { "_id": 2, "name": "Science", "head": "Dr. Y" }
]
```

**Objective**: Join the `teachers` collection with the `departments` collection to get the department head for each teacher.

**Command**:
```javascript
db.teachers.aggregate([
  {
    $lookup: {
      from: "departments",       // The target collection to join
      localField: "department",  // The field from the input documents (teachers)
      foreignField: "name",      // The field from the documents of the "from" collection (departments)
      as: "departmentDetails"    // The name of the new array field to add
    }
  }
])
```

**Output**:
```json
[
  { 
    "_id": 1, "name": "Alice", "age": 30, "gender": "female", "department": "Math",
    "departmentDetails": [{ "_id": 1, "name": "Math", "head": "Professor X" }] 
  },
  { 
    "_id": 2, "name": "Bob", "age": 45, "gender": "male", "department": "Science",
    "departmentDetails": [{ "_id": 2, "name": "Science", "head": "Dr. Y" }] 
  }
]
```
*(Note: Since `$lookup` always returns an array, you might want to chain an `$unwind: "$departmentDetails"` stage directly after to flatten the object).*

---

### Aggregation Pipeline Performance & Limits

#### 1. Streaming vs. Blocking Stages
Aggregation stages can be categorized by how they process documents:
*   **Streaming Stages**: These stages process documents one at a time and pass them to the next stage immediately. They do not need to hold the entire dataset in memory. 
    *   *Examples:* `$match`, `$project`, `$unwind`, `$addFields`, `$lookup` (mostly). They are highly memory-efficient.
*   **Blocking Stages**: These stages must read *all* incoming documents into memory before they can produce any output for the next stage.
    *   *Examples:* `$group`, `$sort` (without a prior indexed `$match`), `$bucket`, `$facet`. Because they hold data in RAM, they are subject to memory limitations and can bottleneck pipeline execution.

#### 2. Memory Limits in Aggregation
*   **100MB RAM Limit**: By default, an individual aggregation stage (specifically blocking stages like `$group` or `$sort`) cannot consume more than **100 MB of RAM**. If it exceeds this limit, MongoDB will throw an error (`Sort exceeded memory limit of 104857600 bytes...`).
*   **Solution (`allowDiskUse`)**: If you anticipate a stage exceeding the 100MB limit, you can instruct MongoDB to write temporary data to disk using the `allowDiskUse: true` option.
    ```javascript
    db.collection.aggregate(
      [ /* ... heavy stages ... */ ],
      { allowDiskUse: true }
    )
    ```
    *Note: Disk writes are significantly slower than RAM processing, so it is always better to optimize queries (e.g., placing `$match` early to reduce dataset size) rather than immediately relying on disk utilization.*

#### 3. Key Takeaways
1.  **Order Matters**: Always filter (`$match`) as early as possible to minimize the number of documents passed down to blocking stages that are limited by memory.
2.  **Indexes**: The `$match` and `$sort` operators can take advantage of indexes, but only if they appear at the very beginning of the pipeline.
