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
