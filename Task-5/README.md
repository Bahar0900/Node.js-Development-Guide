# Lab 5: Express.js Fundamentals & Routing

## Overview

This lab provides hands-on experience with **Express.js**, a minimal and flexible Node.js web framework. By completing this lab, you will learn how to:

- Set up an Express application
- Implement basic routing
- Handle different HTTP methods (GET, POST, PUT, DELETE)
- Work with URL parameters and query strings
- Serve static files like HTML and CSS

---

## Prerequisites

- Basic knowledge of JavaScript and Node.js
- Node.js and npm installed
- A code editor (e.g., VS Code)
- Postman or curl for API testing

---

## Architecture

### A server architecture

![A server Architecture](image_url_or_path)

- **client.js** (represented by a computer icon)
  - Sends an HTTP request
  - Receives an HTTP response

- **server.js** (represented by a server icon)
  - **parse http request** block
    - Takes the HTTP request from client.js
    - Outputs a "req" (request) object
  - **create http response** block
    - Takes input from the Handler
    - Outputs a "res" (response) object
  - **Handler** block
    - Processes the "req" object
    - Sends data to create the "res" object

---

## 🔧 Task 1: Express App Setup

### 1. Initialize the Project

```bash
mkdir express-books-api
cd express-books-api
npm init -y
```

### 2. Install Express

```bash
npm install express
```

### 3. Add Start Script

In `package.json`, update the scripts section:

```json
"scripts": {
  "start": "node index.js"
}
```

### 4. Create Main File

Create `index.js` in the root directory:

```js
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Welcome to the Books API!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### 5. Run the Application

```bash
npm start
```

Test via browser or curl:

```bash
curl http://localhost:3000/
```

Expected: `Welcome to the Books API!`

---

## 📘 Task 2: RESTful Books API

### 1. Create In-Memory Data

Create `books.json` with sample data:

```json
[
  { "id": 1, "title": "The Great Gatsby", "author": "F. Scott Fitzgerald" },
  { "id": 2, "title": "1984", "author": "George Orwell" },
  { "id": 3, "title": "To Kill a Mockingbird", "author": "Harper Lee" }
]
```

### 2. Update `index.js` with API Routes

```js
const express = require('express');
const books = require('./books.json');
const app = express();
const PORT = 3000;

app.use(express.json());

// GET all books
app.get('/api/books', (req, res) => {
  const { author } = req.query;
  if (author) {
    const filteredBooks = books.filter(book =>
      book.author.toLowerCase().includes(author.toLowerCase())
    );
    return res.json(filteredBooks);
  }
  res.json(books);
});

// GET book by ID
app.get('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  const book = books.find(book => book.id === id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

// POST new book
app.post('/api/books', (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }
  const newBook = { id: books.length + 1, title, author };
  books.push(newBook);
  res.status(201).json(newBook);
});

// PUT update book
app.put('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  const { title, author } = req.body;
  const index = books.findIndex(book => book.id === id);
  if (index === -1) return res.status(404).json({ error: 'Book not found' });
  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }
  books[index] = { id, title, author };
  res.json(books[index]);
});

// DELETE book
app.delete('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = books.findIndex(book => book.id === id);
  if (index === -1) return res.status(404).json({ error: 'Book not found' });
  const deleted = books.splice(index, 1)[0];
  res.json(deleted);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### 3. Test API Endpoints

```bash
# GET all books
curl http://localhost:3000/api/books

# GET single book by ID
curl http://localhost:3000/api/books/1

# POST new book
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Pride and Prejudice","author":"Jane Austen"}'

# PUT update book
curl -X PUT http://localhost:3000/api/books/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"The Great Gatsby","author":"F. Scott Fitzgerald"}'

# DELETE book
curl -X DELETE http://localhost:3000/api/books/1
```

---

## 🔍 Task 3: Add Query String Support

### Update the `/api/books` route (already included above)

Test:

```bash
curl http://localhost:3000/api/books?author=Orwell
```

Expected: JSON list of books by George Orwell.

---

## 🖼️ Task 4: Serve Static Files

### 1. Create Static Folder

```bash
mkdir public
```

### 2. Add `index.html` in `public/`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Books API</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <h1>Welcome to the Books API</h1>
  <p>Access the API at <a href="/api/books">/api/books</a></p>
</body>
</html>
```

### 3. Add `styles.css` in `public/`

```css
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f4f4f4;
}
h1 {
  color: #333;
}
a {
  color: #007bff;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
```

### 4. Update `index.js` to Serve Static Files

Add this line **before your routes**:

```js
app.use(express.static('public'));
```

### 5. Test in Browser

Visit:

```
http://localhost:3000/
```

Expected: A styled HTML page with a link to `/api/books`.

---
