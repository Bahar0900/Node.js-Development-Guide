# Lab 5: Express.js Fundamentals & Routing

## Overview

This lab provides hands-on experience with Express.js, a minimal and flexible Node.js web framework. By completing this lab, you will learn how to set up an Express application, implement basic routing, handle different HTTP methods such as GET, POST, PUT, and DELETE, work with URL parameters and query strings, and serve static files like HTML and CSS.

---

## Prerequisites

- Basic knowledge of JavaScript and Node.js
- Node.js and npm installed
- A code editor (e.g., VS Code)
- Postman or curl for API testing

---

## Architecture

### A server architecture

![A server Architecture](https://github.com/Bahar0900/Node.js-Development-Guide/blob/ceb8dc34c704c796d5a5c04cab9236de9b6894d7/Task-5/images/server.drawio.svg)

- **client.js** (represented by a computer icon): Sends an HTTP request and receives an HTTP response.

- **server.js** (represented by a server icon):
  - **Parse HTTP request**: Takes the HTTP request from `client.js` and outputs a `req` (request) object.
  - **Handler**: Processes the `req` object and prepares data for the response.
  - **Create HTTP response**: Takes input from the Handler and outputs a `res` (response) object.


### Express.js with Rest api

![Express.js Architecture](https://github.com/Bahar0900/Node.js-Development-Guide/blob/220f8a8aebe5ea1204d7cdd3590322f721d99981/Task-5/images/expressarchi.drawio.svg)

- **Node.js Application**: Receives **REQUESTS** (POST, GET, PATCH, PUT, DELETE) and sends **RESPONSES**.

- **Express REST APIs**: Manage incoming requests and process data flow.

- **Node.js Files**: Handle request processing and interact with the database.

- **Database**: Stores or retrieves data and stays connected to Node.js files.


---

##  Task 1: Express App Setup

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

Expected:
![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/636d765694681197874c7178f05f6e6218f1b752/Task-5/images/image1.JPG)

---

##  Task 2: RESTful Books API

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
const fs = require('fs');
const path = require('path');
const books = require('./books.json');
const app = express();
const PORT = 3000;

app.use(express.json());

const booksPath = path.join(__dirname, 'books.json');

// Helper function to write updated books to JSON file
const saveBooksToFile = () => {
  fs.writeFileSync(booksPath, JSON.stringify(books, null, 2), 'utf-8');
};

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
  saveBooksToFile();
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
  saveBooksToFile();
  res.json(books[index]);
});

// DELETE book
app.delete('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = books.findIndex(book => book.id === id);
  if (index === -1) return res.status(404).json({ error: 'Book not found' });
  const deleted = books.splice(index, 1)[0];
  saveBooksToFile();
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
```
Expected:
![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/636d765694681197874c7178f05f6e6218f1b752/Task-5/images/image1.JPG)
```bash
# GET single book by ID
curl http://localhost:3000/api/books/1
```
Expected:
![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/2c825fb778ad9781dbcb7193d6ecb8c9f36948f9/Task-5/images/image2.JPG)
```bash
# POST new book
curl -X POST http://localhost:3000/api/books/ -H "Content-Type: application/json" -d "{\"title\":\"Pride and Prejudice\",\"author\":\"Jane Austen\"}"
```
Expected:
![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/a6153b4db54d733935b4f8ea54010101ff28f179/Task-5/images/image3.JPG)
```bash
# PUT update book
curl -X PUT http://localhost:3000/api/books/1 -H "Content-Type: application/json" -d "{\"title\":\"The Great Gatsby\",\"author\":\"F. Scott Fitzgerald\"}"

```
Expected:
![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/f9a944793f3fc22c95121fb5926fdd627f60509d/Task-5/images/image4.JPG)
```bash
# DELETE book
curl -X DELETE http://localhost:3000/api/books/1

```
Expected:

![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/d466c59044cc586a924b3f2236dd745b1b45f43b/Task-5/images/image5.JPG)

---

##  Task 3: Add Query String Support

Test:

```bash
curl http://localhost:3000/api/books?author=Orwell
```

Expected:
![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/844d6105629619d8381efb1a06b1da462b81a8ee/Task-5/images/image6.JPG)

---

##  Task 4: Serve Static Files

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

### 5. Test with curl

Type:

```
curl http://localhost:3000/

```

Expected:

![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/d748c5f3f08ef1613ce120285b638fe7185df978/Task-5/images/image7.JPG)

---
