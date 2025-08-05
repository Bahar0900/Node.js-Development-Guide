```
# A Beginner's Guide to Integrating PostgreSQL with Node.js Using TypeORM

This guide walks you through integrating PostgreSQL with a Node.js application using TypeORM, covering setup, CRUD operations, migrations, and connection pooling.

## Objectives
- Understand PostgreSQL and its role in data management
- Connect Node.js to PostgreSQL using TypeORM
- Learn ORM basics and entity relationships
- Implement CRUD operations
- Manage database migrations and seeding
- Configure pgbouncer for connection pooling

## Prerequisites
- Node.js LTS
- PostgreSQL
- pgAdmin (optional)

## Step 1: Set Up Your Environment
### 1.1 Install Node.js
```bash
node --version
```

### 1.2 Install PostgreSQL
```bash
pg_ctl -D "C:\Program Files\PostgreSQL\14\data" start
```

### 1.3 Create Database
```sql
CREATE DATABASE mydatabase;
```

## Step 2: Initialize Node.js Project
```bash
mkdir myproject
cd myproject
npm init -y
npm install typeorm pg reflect-metadata express dotenv
```

## Step 3: Configure TypeORM
### 3.1 .env File
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=mydatabase
```

### 3.2 data-source.js
```javascript
const { DataSource } = require("typeorm");
require("dotenv").config();
require("reflect-metadata");

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: false,
  entities: ["src/entity/**/*.js"],
  migrations: ["src/migration/**/*.js"],
});

module.exports = { AppDataSource };
```

## Step 4: Define Entities and Relationships
### 4.1 User Entity (src/entity/User.js)
```javascript
const { EntitySchema } = require("typeorm");

const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
    },
    email: {
      type: "varchar",
    },
  },
  relations: {
    posts: {
      type: "one-to-many",
      target: "Post",
      inverseSide: "user",
    },
  },
});

module.exports = { User };
```

### 4.2 Post Entity (src/entity/Post.js)
```javascript
const { EntitySchema } = require("typeorm");

const Post = new EntitySchema({
  name: "Post",
  tableName: "posts",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    title: {
      type: "varchar",
    },
    content: {
      type: "text",
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      inverseSide: "posts",
    },
  },
});

module.exports = { Post };
```

## Step 5: Set Up Express Server (src/index.js)
```javascript
const express = require("express");
const { AppDataSource } = require("./data-source");

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    
    const app = express();
    app.use(express.json());

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => console.log("Error during Data Source initialization:", error));
```

## Step 6: Implement CRUD Operations
### Updated src/index.js with CRUD endpoints
```javascript
// [Previous imports and initialization...]

    // Create User
    app.post("/users", async (req, res) => {
      try {
        const user = AppDataSource.manager.create(User, req.body);
        await AppDataSource.manager.save(User, user);
        res.status(201).send("User created");
      } catch (err) {
        res.status(500).send("Failed to create user");
      }
    });

    // Get All Users
    app.get("/users", async (req, res) => {
      try {
        const users = await AppDataSource.manager.find(User);
        res.json(users);
      } catch (err) {
        res.status(500).send("Failed to fetch users");
      }
    });

    // [Additional CRUD endpoints...]
```

## Step 7: Database Migrations
### 7.1 Install TypeORM CLI
```bash
npm install typeorm@latest -g
```

### 7.2 Create Migration
```bash
typeorm migration:create src/migration/CreateUsersTable
```

### 7.3 Example Migration File
```javascript
class CreateUsersTable1234567890000 {
  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR NOT NULL,
        "email" VARCHAR NOT NULL
      )`);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
```

## Step 8: Seed Database
### seed.js
```javascript
const { AppDataSource } = require("./data-source");
const { User } = require("./entity/User");

AppDataSource.initialize()
  .then(async () => {
    await AppDataSource.getRepository(User).save([
      { name: "John Doe", email: "john@example.com" },
      { name: "Jane Smith", email: "jane@example.com" }
    ]);
    console.log("Seed data inserted");
  })
  .catch(console.error);
```

## Step 9: Configure PgBouncer
### pgbouncer.ini
```ini
[databases]
mydatabase = host=localhost port=5432 dbname=mydatabase

[pgbouncer]
listen_port = 6432
auth_type = plain
auth_file = userlist.txt
pool_mode = session
```

### Update data-source.js for PgBouncer
```javascript
const AppDataSource = new DataSource({
  // ... other config
  port: 6432, // PgBouncer port
  extra: {
    max: 20, // connection pool size
    connectionTimeoutMillis: 2000
  }
});
```

## Conclusion
You've now set up a complete Node.js application with:
- PostgreSQL database connection
- TypeORM for database operations
- CRUD API endpoints
- Database migrations
- Connection pooling with PgBouncer
```
