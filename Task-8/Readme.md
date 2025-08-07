
# Integrating PostgreSQL with Node.js Using TypeORM,Pgbouncer and Redis

Here, we focus on integrating a PostgreSQL database with a Node.js backend application using modern ORM techniques. The architecture demonstrates a scalable, layered backend system featuring a Node.js application (using Express) that handles HTTP requests from web or mobile clients. It incorporates a caching layer with Redis for efficient data retrieval, a connection pooling layer using PgBouncer to optimize database connections, and a PostgreSQL database with primary and replica nodes for read/write separation. Through practical tasks, students will set up PostgreSQL and pgAdmin, implement entity models and relationships using TypeORM, perform CRUD operations, and manage migrations and seed data—laying the foundation for robust and maintainable backend development

## System Architecture
![img](https://github.com/poridhioss/Node.js-Development-Guide/blob/b18157ab0c08411fbdeef25b277541ce8fe91ed3/Task-8/images/systermarchitecture%20finalfinal.png)

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
docker run -d --name postgres-container \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=1234 \
  -e POSTGRES_DB=mydatabase \
  -p 5432:5432 \
  postgres:latest
```
### Create Database
```sql
docker exec -it postgres-container psql -U postgres -c "CREATE DATABASE mydatabase;"
```

## Initializing Node.js Project
```bash
mkdir myproject
cd myproject
git init
git pull https://github.com/poridhioss/Node.js-Development-Guide-Coding-Section.git
npm install
```

## Configure TypeORM
### Create myproject/.env File
```env
DB_HOST=IP of postgres continer
DB_PORT=5432
DB_USERNAME=user db user name
DB_PASSWORD=your_password
DB_DATABASE=mydatabase
```
`docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' postgres-container running this you will find ip`

### Datasource file in src/data-source.js  
The AppDataSource object initializes a TypeORM DataSource instance configured for a PostgreSQL database. It dynamically loads connection parameters (host, port, username, password, database) from environment variables using dotenv. The synchronize: true option enables automatic schema synchronization based on defined entities, while logging: false disables SQL query logging. Entity definitions and migration scripts are resolved from the specified paths using glob patterns (src/entity/**/*.js and src/migration/**/*.js). This setup provides the necessary configuration for establishing and managing the database connection within a TypeORM-powered Node.js application.

## Defining Entities and Relationships
### User Entity (It is in src/entity/User.js path)
This code defines a User entity schema using TypeORM’s EntitySchema for a table named users. It specifies three columns: id (a primary key with auto-increment), name, and email, both of type varchar. It also defines a one-to-many relationship between User and Post, indicating that each user can have multiple associated posts, with the inverseSide referencing the user property in the Post entity. This schema is used by TypeORM to map the User entity to the database table and manage its structure and relationships.

### Post Entity (It is in src/entity/Post.js path)
This code defines a Post entity schema using TypeORM’s EntitySchema for a table named posts. It includes three columns: id (a primary key with auto-increment), title (a string), and content (a text field). It also establishes a many-to-one relationship with the User entity, indicating that each post is associated with a single user, and the inverseSide refers to the posts property in the User entity. This schema enables TypeORM to map the Post entity to its corresponding database table and manage its structure and relations.

## Setting Up Express Server (It is in src/index.js path)
This code initializes a PostgreSQL database connection using TypeORM (AppDataSource.initialize()), and once successful, sets up a basic Express.js server. The server listens on port 3000, parses incoming JSON requests using express.json(), and responds with "Hello World!" when the root (/) route is accessed. If the database connection fails, it logs an error. This setup ensures the server starts only after the database is successfully connected, making it suitable for applications that rely on a working database connection before handling requests.

Run:
```
node src/index.js
```
Test '/' route:  
```
curl http://localhost:3000/
```
Output:  
![image](https://github.com/poridhioss/Node.js-Development-Guide/blob/0ac8c95c11036177906875653e1415864a1fc4ca/Task-8/images/terminal1.JPG)  

## Implement CRUD Operations
### The file src/index-crude.js with CRUD endpoints  
It includes 

> This code sets up a basic Express.js server connected to a database via TypeORM's AppDataSource. It initializes the data source and defines RESTful API endpoints to manage User entities: a root GET endpoint (/) that returns "Hello World!", a POST endpoint (/users) to create a new user with name and email, a GET endpoint (/users) to fetch all users, a PUT endpoint (/users/:id) to update a user by their ID, and a DELETE endpoint (/users/:id) to delete a user by ID. Each endpoint interacts with the database through TypeORM's manager methods (create, save, find, findOne, remove) and includes basic error handling. The server listens on port 3000 once the data source is successfully initialized.
> TypeORM reduces complexity by letting you perform database operations using simple JavaScript methods instead of writing raw SQL queries. For example, instead of writing an SQL statement like INSERT INTO users (name, email) VALUES (...) to add a new user, you just create a user object with AppDataSource.manager.create(User, {...}) and save it using AppDataSource.manager.save(User, user). Similarly, fetching users is as easy as calling AppDataSource.manager.find(User). This abstraction handles all the database connection, query building, and data mapping behind the scenes, making your code cleaner, easier to write, and focused on business logic rather than database details.

## Database Migrations
### Install TypeORM CLI

This is installed previously with npm install

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
### This file is in src/seed.js path

Run:  
```
node src/seed.js
```

Explanation: 
> The src/seed.js file is a database seeding script that connects to the database using TypeORM and inserts initial data (e.g., a default user) into the relevant tables. This is essential for setting up consistent and ready-to-use data during development, testing, or staging environments. It ensures developers and automated tests have predictable, reliable data to work with, saving time and reducing manual setup. Seeding is also helpful for demos, CI/CD pipelines, and verifying that entity configurations like validations and relationships are functioning correctly.  

### Test with curl: 

Run:  
```
node src/index-crude.js
```

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
![image](https://github.com/poridhioss/Node.js-Development-Guide/blob/a0f70de5540e8993ea066949bc7fa96ee36aa23e/Task-8/images/pgbouncerupdated.drawio.svg)  

There are three pooling modes of pg bouncer:

- Session Pooling: Keeps one server connection per client until the client disconnects — supports session features.
- Transaction Pooling: Assigns a server connection only during a transaction — better efficiency, no session features.
- Statement Pooling: Reuses connections after each query — most efficient, autocommit only, no session or transaction support.

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
![image](https://github.com/poridhioss/Node.js-Development-Guide/blob/dadf5ed686e2a73e2b0fb812f9fc188aca4b19be/Task-8/images/terminal6.JPG)  

Monitor activities of pgbouncer:
```
psql -h localhost -p 6432 -U postgres pgbouncer
SHOW STATS;
SHOW POOLS;
SHOW SERVERS;
SHOW CLIENTS;
SHOW LISTS;

```
Expected Output:  
![image](https://github.com/poridhioss/Node.js-Development-Guide/blob/f142fd3566c215aa2a4f4f7efc51ae10a3fdcbb5/Task-8/images/terminal7.JPG)  


## Integrating Redis

Redis is an open-source, in-memory data structure store used as a high-performance cache, database, and message broker. In web backend systems, Redis is integrated to cache frequently accessed data such as API responses, session information, or user-specific content, significantly reducing the load on the primary database and improving response times. By placing Redis before PgBouncer in the system flow, the application first checks if the requested data is already available in the cache (a "cache hit"). If it is, the system can return the data instantly without querying the database. Only on a "cache miss" does the system proceed to PgBouncer for a pooled database connection. This reduces the number of database queries, improves scalability, and enhances overall performance.

### Architecture:
![image](https://github.com/poridhioss/Node.js-Development-Guide/blob/194b3df3a752b095a5826ab1412fb995d69801c8/Task-8/images/redisfinal.png)  

Redis can do  

- Cache frequently accessed data
- Store sessions (e.g., user login sessions)
- Pub/Sub messaging between services
- Rate limiting (e.g., API call throttling)
- Queues (e.g., background jobs/tasks)

### Installation:
- Download the Redis Windows port from MSOpenTech Redis or use WSL2 with the Linux instructions.
- Execute the redis-server.exe
- on myproject folder run
  ```
  npm install redis
  ```
- Check the code of src/index-redis.js
> This updated code adds Redis caching to the previous Express and TypeORM setup for managing users. Specifically, it uses a Redis client to cache the list of users fetched from the database in the /users GET endpoint. When a request for all users comes in, the code first checks Redis for a cached version of the users. If found, it returns that cached data immediately, avoiding a database query and improving response time. If not found, it queries the database, sends the data back, and caches the result in Redis for one hour. Additionally, after any operation that modifies user data (create, update, or delete), the users cache in Redis is invalidated (deleted) to ensure the cache doesn’t serve stale data. This caching layer reduces database load and improves performance for read-heavy operations. The code also includes graceful Redis client shutdown on process termination.

Run:
```
node src/index-redis.js
```
Testing with Postman:  
```
http://localhost:3000/users/
```
If you run this get method  again and again the time taken will  be :  
![image](https://github.com/poridhioss/Node.js-Development-Guide/blob/b778399a67c70a2eb2a2a3ca2c8620760b2d3522/Task-8/images/terminal8.JPG)  
It is on average 4-5ms. Whereas without redis it will take 7-8 ms because of the overhead of database call.
