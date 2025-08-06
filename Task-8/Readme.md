
# Integrating PostgreSQL with Node.js Using TypeORM,Pgbouncer and Redis

Here, we focus on integrating a PostgreSQL database with a Node.js backend application using modern ORM techniques. The architecture demonstrates a scalable, layered backend system featuring a Node.js application (using Express) that handles HTTP requests from web or mobile clients. It incorporates a caching layer with Redis for efficient data retrieval, a connection pooling layer using PgBouncer to optimize database connections, and a PostgreSQL database with primary and replica nodes for read/write separation. Through practical tasks, students will set up PostgreSQL and pgAdmin, implement entity models and relationships using TypeORM, perform CRUD operations, and manage migrations and seed data—laying the foundation for robust and maintainable backend development

## System Architecture
![img](https://github.com/poridhioss/Node.js-Development-Guide/blob/e8cbc2c966ea9f206f6e8bfda1c92ca3c758f915/Task-8/images/systemactualdiagram.png)

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

## Initialize Node.js Project
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

### Create src/data-source.js
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

Run:
```
node src/index.js
```
Test / route:  
```
curl http://locahost:3000/
```
Output:  
![image](https://github.com/poridhioss/Node.js-Development-Guide/blob/0ac8c95c11036177906875653e1415864a1fc4ca/Task-8/images/terminal1.JPG)  

## Implement CRUD Operations
### Update src/index.js with CRUD endpoints  
Replace the code of index.js with it 

```javascript

    const express = require("express");
const { AppDataSource } = require("./data-source");
const { User } = require("./entity/User"); // Must be the actual entity, not a string

AppDataSource.initialize()
  .then(async () => {
    console.log("Data Source has been initialized!");

    const app = express();
    app.use(express.json());

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

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

    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => console.log("Error during Data Source initialization:", error));
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

Run:  
```
node src/indes.js
```

### Test with curl: 

Create New User:  
```
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d "{\"name\":\"sahar Doe\", \"email\":\"sahar@example.com\"}"
```
Output:  
![img](https://github.com/poridhioss/Node.js-Development-Guide/blob/627e4a48b6e7c0b4d5cd7ad62192eca755335242/Task-8/images/terminal2.JPG)  

Fetch All Users:  
```
curl http://localhost:3000/users
```
Output:  
![img](https://github.com/poridhioss/Node.js-Development-Guide/blob/1ccea28a9b5a0b2b1473fe1886b36dbfaa85967b/Task-8/images/terminal3.JPG)  

Update User By id:  
```
curl -X PUT http://localhost:3000/users/1 -H "Content-Type: application/json" -d "{\"name\":\"Jane Doe\", \"email\":\"jane@example.com\"}"
```
Output:  
![img](https://github.com/poridhioss/Node.js-Development-Guide/blob/fb464fce20317458beb58272701395693a23ea63/Task-8/images/terminal4.JPG)  

Delete User By id:  
```
curl -X DELETE http://localhost:3000/users/1
```
Output:  
![img](https://github.com/poridhioss/Node.js-Development-Guide/blob/75ae8565e19df01a251818bb680b43dd87fbfd79/Task-8/images/terminal5.JPG)  


## Integrating PgBouncer

PgBouncer is a lightweight and efficient connection pooler for PostgreSQL that sits between client applications and the PostgreSQL server to manage database connections. In PostgreSQL, each client connection consumes memory and backend processes, which can become a bottleneck under high concurrency. PgBouncer uses connection pooling—a technique where a limited number of persistent connections to the database are maintained and reused across many client sessions—to minimize this overhead. This reduces the cost of repeatedly opening and closing connections, improves scalability, and protects the database from being overwhelmed. It's especially crucial for web applications or microservices that open short-lived, frequent connections. By efficiently managing client requests and limiting actual connections to PostgreSQL, PgBouncer ensures better performance, stability, and resource utilization. 

### Architecture:
![image](https://github.com/poridhioss/Node.js-Development-Guide/blob/2fed10a9a14b8c9e38dc08e7d4ac51da02903b89/Task-8/images/pgbouncer.drawio.svg)  

### Insatlling pgbouncer  using docker  
- Pull pgbouncer
```
docker pull pgbouncer/pgbouncer
```
- Go to C:\Program Files\PostgreSQL\17\data and open the pg_hba.conf file of postgres
- Change the configuration to :
```
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     md5
# IPv4 local connections:
host    all             all             127.0.0.1/32            md5
# IPv6 local connections:
# Local IPv6 loopback
host    all             all             ::1/128                 md5

# Replication from localhost
local   replication     all                                     md5
host    replication     all             127.0.0.1/32            md5
host    replication     all             ::1/128                 md5

# Allow all IPv4
host    all             all             0.0.0.0/0               md5

# Allow all IPv6 (if needed)
host    all             all             ::/0                    md5
```
> It is important to match the hashing technique of postgres and pgbouncer to md5. And also postgres should allow the request from docker


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
`Change the md586745934327859 to your passwordusername hashed in md5.For example in this case md51234postgres. 1234postgres is hashed using  md5`

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
`Change the hosname and password` 

> This docker run command starts a detached Docker container named pgbouncer-container using the official pgbouncer/pgbouncer image. It maps port 6432 on the host to port 6432 inside the container, which is the default port PgBouncer listens on. The environment variable DATABASES defines a connection to a PostgreSQL database (mydatabase) running at IP 192.168.0.103, using user postgres and password 1234. Authentication type is set to md5, and the AUTH_FILE points to a user credentials file. Two local files (pgbouncer.ini and userlist.txt) are mounted into the container to provide PgBouncer’s configuration and user authentication details. This setup enables PgBouncer to act as a lightweight connection pooler for the PostgreSQL database.

Run :
```
docker ps
```
Expected Output:
[!image]()  

See the stats of pgbouncer:  

## Integrating Redis

Redis is an open-source, in-memory data structure store used as a high-performance cache, database, and message broker. In web backend systems, Redis is integrated to cache frequently accessed data such as API responses, session information, or user-specific content, significantly reducing the load on the primary database and improving response times. By placing Redis before PgBouncer in the system flow, the application first checks if the requested data is already available in the cache (a "cache hit"). If it is, the system can return the data instantly without querying the database. Only on a "cache miss" does the system proceed to PgBouncer for a pooled database connection. This reduces the number of database queries, improves scalability, and enhances overall performance.

### Architecture:
![image](https://github.com/poridhioss/Node.js-Development-Guide/blob/97e7b51720d9bf53528475ffd706aff5efa29e5c/Task-8/images/redis%20(1).png)  


## Conclusion
You've now set up a complete Node.js application with:
- PostgreSQL database connection
- TypeORM for database operations
- CRUD API endpoints
- Database migrations
- Connection pooling with PgBouncer
