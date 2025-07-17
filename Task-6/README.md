#  Understanding Express Middleware: A Hands-On Guide

This lab walks you through the core concepts and practical applications of middleware in Express.js using real examples and hands-on exercises. By the end of this lab, you will have a clear understanding of the middleware concept and how it functions as a pipeline in handling requests. You will learn to work with built-in middleware such as express.json and express.static, create your own custom middleware functions, and implement error-handling middleware effectively. Additionally, you'll gain insight into the full request and response lifecycle within an Express application.

---

##  What is Middleware?
Express applications are essentially a series of middleware function calls. When a request comes into an Express application, it goes through a pipeline of middleware functions. Each middleware function can decide whether to pass the request to the next function in the pipeline, handle the request and send a response, or terminate the request-response cycle.

This sequential execution of middleware functions forms a pipeline, where each function performs a specific task before passing the request to the next. This modular approach allows for clean separation of concerns and reusability of code.

Middleware functions are the backbone of Express.js, sitting between the **client request** and the **server response**. They can:

*   Execute any code.
*   Make changes to the request and the response objects.
*   End the request-response cycle.
*   Call the next middleware in the stack.

![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/22f194d3ea49b368f2c684a889b30ad1a613dba7/Task-6/images/middleware.drawio.svg)

> Think of middleware as a sequence of filters that requests pass through before getting processed or rejected.

###  Middleware Flow

**Without Middleware:**

![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/6895ce43e28eba804c272dc7728d471ed60dafe4/Task-6/images/withoutmiddleware.drawio.svg)

**With Middleware:**

![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/6895ce43e28eba804c272dc7728d471ed60dafe4/Task-6/images/withmiddleware.drawio.svg)

Or in case of failure:

![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/6895ce43e28eba804c272dc7728d471ed60dafe4/Task-6/images/errormiddleware.drawio.svg)

---

##  Middleware Types

- **Application-level**: Used across the entire app with `app.use()`
- **Router-level**: Applied to specific routes via `express.Router()`
- **Built-in**: Provided by Express (e.g., `express.json()`)
- **Error-handling**: Catch and handle errors
- **Third-party**: External tools like `morgan`, `helmet`, etc.

---

##  Get Started

###  Project Setup

```bash
mkdir express-middleware-lab
cd express-middleware-lab
npm init -y
npm install express
```

Create a file called `server.js`.

---

###  Task 1: Custom Logging Middleware

Log the method, URL, and timestamp of each request.

```js
// server.js
const express = require('express');
const app = express();

// Logging Middleware
const loggerMiddleware = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
};

app.use(loggerMiddleware);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Middleware Lab!' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

**Test it:**

- Run:
  ```bash
  node server.js
  ```
- Browser: [http://localhost:3000](http://localhost:3000)
   
    ![img](https://github.com/Bahar0900/Node.js-Development-Guide/blob/fabc5c1e5e3af715f0ed844ca25900487a97d761/Task-6/images/browser1.JPG)
- In terminal: `curl http://localhost:3000/`
  
    ![img](https://github.com/Bahar0900/Node.js-Development-Guide/blob/fabc5c1e5e3af715f0ed844ca25900487a97d761/Task-6/images/console1.JPG)

---

###  Task 2: Request Validation Middleware

Require a `name` query parameter.

```js
// Validation Middleware
const validateQueryMiddleware = (req, res, next) => {
    if (!req.query.name) {
        return res.status(400).json({ error: 'Name query parameter is required' });
    }
    next();
};

// Route using it
app.get('/greet', validateQueryMiddleware, (req, res) => {
    res.json({ message: `Hello, ${req.query.name}!` });
});
```

**Test it:**

- Run:
  ```bash
  node server.js
  ```
- Browser: [http://localhost:3000/greet?name=John](http://localhost:3000/greet?name=John)
   
    ![img](https://github.com/Bahar0900/Node.js-Development-Guide/blob/05277dba78528b6615b1a4895b637e0ad8867a7d/Task-6/images/browser2.JPG)
- In terminal: `curl http://localhost:3000/greet?name=John`
  
    ![img](https://github.com/Bahar0900/Node.js-Development-Guide/blob/05277dba78528b6615b1a4895b637e0ad8867a7d/Task-6/images/console2.JPG)
  
- Browser: [http://localhost:3000/greet](http://localhost:3000/greet)

  ![img](https://github.com/Bahar0900/Node.js-Development-Guide/blob/63a4d282206fe30c055ff42b412340cc6b057f40/Task-6/images/browser22.JPG)
  
---

###  Task 3: Error Handling Middleware

Simulate and gracefully handle errors.

```js
// Error Route
app.get('/error', (req, res, next) => {
    const err = new Error('Something went wrong!');
    err.status = 500;
    next(err);
});

// Error-handling Middleware (should be last)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message,
            status: err.status || 500
        }
    });
});
```

**Test it:**

- Run:
  ```bash
  node server.js
  ```
- Browser: [http://localhost:3000/error/](http://localhost:3000/error/)
   
    ![img](https://github.com/Bahar0900/Node.js-Development-Guide/blob/b6f40580fd65a8e0aeb61bf478071fc2420b43c1/Task-6/images/browser3.JPG)
- In terminal: `curl http://localhost:3000/error/`
  
    ![img](https://github.com/Bahar0900/Node.js-Development-Guide/blob/b6f40580fd65a8e0aeb61bf478071fc2420b43c1/Task-6/images/console3.JPG)

---

###  Task 4: Request Timing & Rate Limiting

Track how long each request takes and implement basic rate limiting.

```js
// In-memory rate limit store
const requestStore = {};

// Request Timing Middleware
const requestTimeMiddleware = (req, res, next) => {
    req.requestTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - req.requestTime;
        console.log(`Request to ${req.url} took ${duration}ms`);
    });
    next();
};

// Basic Rate Limiting Middleware
const rateLimitMiddleware = (req, res, next) => {
    const clientIp = req.ip;
    const currentTime = Date.now();

    const requests = requestStore[clientIp] || { count: 0, lastRequest: 0 };

    if (currentTime - requests.lastRequest > 60000) {
        requests.count = 0;
    }

    requests.count++;
    requests.lastRequest = currentTime;
    requestStore[clientIp] = requests;

    if (requests.count > 2) {
        return res.status(429).json({ error: 'Too many requests' });
    }

    next();
};

app.use(requestTimeMiddleware);
app.use(rateLimitMiddleware);

app.get('/test', (req, res) => {
    res.json({ message: 'Test successful' });
});
```

**Test it:**

- Run:
  ```bash
  node server.js
  ```
- Browser: [http://localhost:3000/test/](http://localhost:3000/test/).Refresh 2 times. You'll see   
   
    ![img](https://github.com/Bahar0900/Node.js-Development-Guide/blob/3f412704fe351be2f509e387c6af4b23b080bf3a/Task-6/images/browser4.JPG)
- In terminal: `curl http://localhost:3000/error/`
  
    ![img](https://github.com/Bahar0900/Node.js-Development-Guide/blob/3f412704fe351be2f509e387c6af4b23b080bf3a/Task-6/images/console4.JPG)
  
- Explanation:
  
    > The requestTimeMiddleware measures how long each request takes and logs it to the console.
    > The rateLimitMiddleware keeps track of how many requests each user (by IP address) makes. If a user sends more than 2 requests within 60 seconds, they get a response:  
---  
