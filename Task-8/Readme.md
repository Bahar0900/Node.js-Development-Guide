
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

## Set Up Your Environment
### Install Node.js
```bash
node --version
```

### Install and start PostgreSQL
```bash
net start postgresql-x64-14
```
`Replace the postgresql-x64-14 with actual service name of postgresql. You will get it from services.msc`
### Create Database
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

## Configure TypeORM
### Create .env File
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=mydatabase
```

### Create data-source.js
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

## Define Entities and Relationships
### User Entity (create src/entity/User.js)
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

### Post Entity (create src/entity/Post.js)
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

## Set Up Express Server (create src/index.js)
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
Test it:  
```
curl http://locahost:3000/
```
Output:  
[!image]()  

## Implement CRUD Operations
### Update src/index.js with CRUD endpoints  
Add the code after / route  

```javascript

    // POST /users (Create a user)
    app.post("/users", async (req, res) => {
      try {
        const user = AppDataSource.manager.create(User, {
          name: req.body.name,
          email: req.body.email,
        });

        await AppDataSource.manager.save(User, user);
        res.send("User saved");
      } catch (err) {
        console.error(err);
        res.status(500).send("Failed to create user");
      }
    });

    // GET /users (Fetch all users)
    app.get("/users", async (req, res) => {
      try {
        const users = await AppDataSource.manager.find(User);
        res.send(users);
      } catch (err) {
        console.error(err);
        res.status(500).send("Failed to fetch users");
      }
    });

    // PUT /users/:id (Update user by ID)
    app.put("/users/:id", async (req, res) => {
      try {
        const user = await AppDataSource.manager.findOne(User, {
          where: { id: parseInt(req.params.id) },
        });

        if (user) {
          user.name = req.body.name;
          user.email = req.body.email;
          await AppDataSource.manager.save(User, user);
          res.send("User updated");
        } else {
          res.status(404).send("User not found");
        }
      } catch (err) {
        console.error(err);
        res.status(500).send("Failed to update user");
      }
    });

    // DELETE /users/:id (Delete user by ID)
    app.delete("/users/:id", async (req, res) => {
      try {
        const user = await AppDataSource.manager.findOne(User, {
          where: { id: parseInt(req.params.id) },
        });

        if (user) {
          await AppDataSource.manager.remove(User, user);
          res.send("User deleted");
        } else {
          res.status(404).send("User not found");
        }
      } catch (err) {
        console.error(err);
        res.status(500).send("Failed to delete user");
      }
    });
```

Test with curl: 

Create New User:  
```
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d "{\"name\":\"John Doe\", \"email\":\"john@example.com\"}"
```
Output:  
[!img]()  

## Database Migrations
### Install TypeORM CLI
```bash
npm install typeorm@latest -g
```

### Create Migration
Setting up execution policy.
```bash
set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```  

```
typeorm migration:create --outputJs src/migration/CreateUsersTable
```


### Migration File Look like
```javascript
const { MigrationInterface, QueryRunner } = require("typeorm");

class CreateUsersTable1754371998850 {
  async up(queryRunner) {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
    );
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}

module.exports = CreateUsersTable1754371998850;
```

## Seed Database
### Create src/seed.js
```javascript
const { AppDataSource } = require("./data-source");
const { User } = require("./entity/User"); // EntitySchema

AppDataSource.initialize()
  .then(async () => {
    const user = {
      name: "John Doe",
      email: "john@example.com",
    };

    await AppDataSource.getRepository(User).save(user);
    console.log("Seed data inserted");
  })
  .catch((error) => console.log(error));
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
