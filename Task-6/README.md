# 🚀 Express Middleware Mastery: A Hands-On Guide

Welcome to the exciting world of **Express Middleware**!  
This lab walks you through middleware concepts and their practical use in Express.js, using examples and hands-on exercises. By the end, you'll-
- Understand middleware concept and pipeline
- Built-in middleware (express.json, express.static)
- Custom middleware creation
- Error handling middleware
- Request/response lifecycle

---

## 🎯 What is Middleware?
Express applications are essentially a series of middleware function calls. When a request comes into an Express application, it goes through a pipeline of middleware functions. Each middleware function can decide whether to pass the request to the next function in the pipeline, handle the request and send a response, or terminate the request-response cycle.

This sequential execution of middleware functions forms a pipeline, where each function performs a specific task before passing the request to the next. This modular approach allows for clean separation of concerns and reusability of code.

Middleware functions are the backbone of Express.js, sitting between the **client request** and the **server response**. They can:

*   Execute any code.
*   Make changes to the request and the response objects.
*   End the request-response cycle.
*   Call the next middleware in the stack.

![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/2d6df7ac99860327ddb8b3a5a1de388eedf2060f/Task-6/images/middleware.drawio.svg)

> Think of middleware as a sequence of filters that requests pass through before getting processed or rejected.

### 🔄 Middleware Flow

**Without Middleware:**

![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/2d6df7ac99860327ddb8b3a5a1de388eedf2060f/Task-6/images/withoutmiddleware.drawio.svg)

**With Middleware:**

![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/2d6df7ac99860327ddb8b3a5a1de388eedf2060f/Task-6/images/withmiddleware.drawio.svg)

Or in case of failure:

![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/2d6df7ac99860327ddb8b3a5a1de388eedf2060f/Task-6/images/errormiddleware.drawio.svg)

---

## 📚 Middleware Types

- **Application-level**: Used across the entire app with `app.use()`
- **Router-level**: Applied to specific routes via `express.Router()`
- **Built-in**: Provided by Express (e.g., `express.json()`)
- **Error-handling**: Catch and handle errors
- **Third-party**: External tools like `morgan`, `helmet`, etc.

---

## 🛠️ Get Started

### 📁 Project Setup

```bash
mkdir express-middleware-lab
cd express-middleware-lab
npm init -y
npm install express
```

Create a file called `server.js`.

---

### ✅ Task 1: Custom Logging Middleware

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

- Run: `node server.js`
- Visit: [http://localhost:3000](http://localhost:3000)
- Console output:  
  `[2025-07-11T04:49:00.000Z] GET /`

---

### 🔍 Task 2: Request Validation Middleware

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

- ✅ [http://localhost:3000/greet?name=John](http://localhost:3000/greet?name=John)
- ❌ [http://localhost:3000/greet](http://localhost:3000/greet)

---

### 🚨 Task 3: Error Handling Middleware

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

- Visit [http://localhost:3000/error](http://localhost:3000/error)  
- Console will show stack trace  
- Response:  
  ```json
  { "error": { "message": "Something went wrong!", "status": 500 } }
  ```

---

### ⏱️ Task 4: Request Timing & Rate Limiting

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

    if (requests.count > 5) {
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

- Visit `/test` multiple times in under 60 seconds
- After 5 requests, you’ll see:
  ```json
  { "error": "Too many requests" }
  ```

---

## 🎨 Final: Complete `server.js` Code

```js
const express = require('express');
const app = express();

const requestStore = {};

// Logger Middleware
const loggerMiddleware = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
};

// Request Timing Middleware
const requestTimeMiddleware = (req, res, next) => {
    req.requestTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - req.requestTime;
        console.log(`Request to ${req.url} took ${duration}ms`);
    });
    next();
};

// Rate Limiting Middleware
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

    if (requests.count > 5) {
        return res.status(429).json({ error: 'Too many requests' });
    }

    next();
};

// Validation Middleware
const validateQueryMiddleware = (req, res, next) => {
    if (!req.query.name) {
        return res.status(400).json({ error: 'Name query parameter is required' });
    }
    next();
};

// Apply middleware
app.use(loggerMiddleware);
app.use(requestTimeMiddleware);
app.use(rateLimitMiddleware);

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Middleware Lab!' });
});

app.get('/greet', validateQueryMiddleware, (req, res) => {
    res.json({ message: `Hello, ${req.query.name}!` });
});

app.get('/error', (req, res, next) => {
    const err = new Error('Something went wrong!');
    err.status = 500;
    next(err);
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message,
            status: err.status || 500
        }
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

Happy coding and enjoy mastering Express middleware! ✨

