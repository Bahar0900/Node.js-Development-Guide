# 🚀 Express Middleware Mastery: A Hands-On Guide

Welcome to the exciting world of **Express Middleware**!  
This guide walks you through middleware concepts and their practical use in Express.js, using examples and hands-on exercises. By the end, you'll be a middleware pro! 💪

---

## 🎯 What is Middleware?

Middleware functions are the backbone of Express.js, sitting between the **client request** and the **server response**. They can:

- Process requests
- Modify responses
- Handle errors
- Perform validations
- Log activities

> Think of middleware as a sequence of filters that requests pass through before getting processed or rejected.

### 🔄 Middleware Flow

**Without Middleware:**

```
Client → GET /users → Express Server → Response
```

**With Middleware:**

```
Client → Middleware 1 → Middleware 2 → ... → Express Server → Response
```

Or in case of failure:

```
Client → Middleware → ❌ Error Response
```

---

## 📚 Middleware Theory

### 🧱 Types of Middleware

- **Application-level**: Used across the entire app with `app.use()`
- **Router-level**: Applied to specific routes via `express.Router()`
- **Built-in**: Provided by Express (e.g., `express.json()`)
- **Error-handling**: Catch and handle errors
- **Third-party**: External tools like `morgan`, `helmet`, etc.

### ⚙️ Key Concepts

- Middleware functions receive `req`, `res`, and `next` as parameters.
- Call `next()` to pass control to the next middleware.
- Middleware can end the request cycle by sending a response.
- Error-handling middleware has four arguments: `err, req, res, next`.

---

## 🛠️ Practical Tasks

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

