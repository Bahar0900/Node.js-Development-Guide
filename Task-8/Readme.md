
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
Explanation:  
> A TypeORM migration file is like a saved record of a change you want to make to your database. It has two parts: up() to apply the change (like creating a table), and down() to undo it (like dropping the table). When you run typeorm migration:run, it updates the database by running all pending up() methods. If needed, you can roll back with typeorm migration:revert, which calls the down() method. This helps you manage database changes easily without writing raw SQL, keeps your code and database in sync, and ensures that all team members and environments stay consistent—just like version control for your schema.

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
Run:  
```
node src/seed.js
```

Explanation: 
> The src/seed.js file is a database seeding script that connects to the database using TypeORM and inserts initial data (e.g., a default user) into the relevant tables. This is essential for setting up consistent and ready-to-use data during development, testing, or staging environments. It ensures developers and automated tests have predictable, reliable data to work with, saving time and reducing manual setup. Seeding is also helpful for demos, CI/CD pipelines, and verifying that entity configurations like validations and relationships are functioning correctly.


Test with curl: 

Create New User:  
```
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d "{\"name\":\"John Doe\", \"email\":\"john@example.com\"}"
```
Output:  
[!img]()  

Fetch All Users:  
```
curl http://localhost:3000/users
```
Output:  
[!img]()  

Update User By id:  
```
curl -X PUT http://localhost:3000/users/1 -H "Content-Type: application/json" -d "{\"name\":\"Jane Doe\", \"email\":\"jane@example.com\"}"
```
Output:  
[!img]()  

Delete User By id:  
```
curl -X DELETE http://localhost:3000/users/1
```
Output:  
[!img]()  


## Integrating PgBouncer
### Create pgbouncer.ini
```ini
[databases]
mydatabase=host=192.168.0.103 port=5432 user=postgres password=1234 dbname=mydatabase

[pgbouncer]
listen_addr = 0.0.0.0
auth_type = md5
ignore_startup_parameters = extra_float_digits
auth_file = userlist.txt
pool_mode = session
```
`Replace the host address with your pcs private address. Type ipconfig in cmd. Take ipv4: xxxxx  this address.Also change password`

### Create userlist.txt
```
"postgres" "md586745934327859"
```
`Change the md586745934327859 to your password+username hashed in md5`

### Update .env for PgBouncer
```javascript
DB_HOST=localhost
DB_PORT=6432
DB_USERNAME=postgres
DB_PASSWORD="1234"
DB_DATABASE=mydatabase
```

Run:  
```
docker run -d --name pgbouncer-container -p 6432:6432 -e DATABASES="mydatabase=host=192.168.0.103 port=5432 user=postgres password=1234 dbname=mydatabase" -e AUTH_TYPE=md5 -e AUTH_FILE="/etc/pgbouncer/userlist.txt" -v C:\pgbouncer\pgbouncer.ini:/etc/pgbouncer/pgbouncer.ini -v C:\pgbouncer\userlist.txt:/etc/pgbouncer/userlist.txt pgbouncer/pgbouncer
```
`Change the host password` 

> This docker run command starts a detached Docker container named pgbouncer-container using the official pgbouncer/pgbouncer image. It maps port 6432 on the host to port 6432 inside the container, which is the default port PgBouncer listens on. The environment variable DATABASES defines a connection to a PostgreSQL database (mydatabase) running at IP 192.168.0.103, using user postgres and password 1234. Authentication type is set to md5, and the AUTH_FILE points to a user credentials file. Two local files (pgbouncer.ini and userlist.txt) are mounted into the container to provide PgBouncer’s configuration and user authentication details. This setup enables PgBouncer to act as a lightweight connection pooler for the PostgreSQL database.

Run :
```
docker ps
```
Expected Output:


## Conclusion
You've now set up a complete Node.js application with:
- PostgreSQL database connection
- TypeORM for database operations
- CRUD API endpoints
- Database migrations
- Connection pooling with PgBouncer
