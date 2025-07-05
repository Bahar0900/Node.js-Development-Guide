# Node.js HTTP Server and Client Guide

This beginner-friendly guide helps you work with HTTP in Node.js. It covers:

- ✅ Setting up a basic **Node.js HTTP server** from scratch.
- 🌐 Creating an **HTTP client** to communicate with external APIs.
- 📥 Handling different **HTTP methods** (GET, POST, PUT, DELETE).
- 📊 Understanding and managing **HTTP status codes**.
- 🧠 Manually **parsing request bodies** without external libraries.
- 🔍 Each section includes:
  - 📄 Sample code
  - 💡 Explanations
  - ✅ Step-by-step verification instructions

Perfect for developers learning to build HTTP-based applications using only core Node.js modules.

## Node Js Architecture
![Node.js Logo](https://github.com/Bahar0900/Node.js-Development-Guide/blob/8bcaa8f68b05f2689db851c7d34df8377596f6a9/Task-4/nodejsarchitecture.drawio.svg)
## Prerequisites

### Node.js Installation
- Download and install Node.js from [nodejs.org](https://nodejs.org).
- Verify installation by running:
    ````bash
    node -v
    npm -v
    ````
- Expected output: Version numbers (e.g., v20.x.x for Node.js and 10.x.x for npm).

### Text Editor
- Use any text editor (e.g., VS Code, Sublime Text) to write and save your code.

### Terminal
- Use a terminal (Command Prompt, PowerShell, or any bash-compatible terminal) to run commands.

### Testing Tools
- Install `curl` for testing HTTP requests:
  - **Windows**: Install via [curl.se](https://curl.se) or use PowerShell.
  - **macOS/Linux**: `curl` is usually pre-installed; verify with:
    ````bash
    curl --version
    ````
- Alternatively, use a browser or tools like Postman for testing.

## 1. Building a Basic HTTP Server
This section guides you through creating a simple HTTP server that responds with a basic message.

### Step-by-Step Instructions

1. **Create a Project Directory**:
   - Create a folder named `server`:
       ````bash
       mkdir server
       cd server
       ````

2. **Initialize a Node.js Project**:
   - Run the following command to create a `package.json` file:
       ````bash
       npm init -y
       ````
   - This creates a `package.json` with default settings. Verify by checking the `server` folder for `package.json`.

3. **Create the Server File**:
   - Create a file named `index.js` in the `server` folder.
   - Add the following code to create a basic HTTP server:
       ````javascript
       const http = require('http');

       const myServer = http.createServer((req, res) => {
           console.log('New request received.');
           res.end('Hello from server');
       });

       myServer.listen(3050, () => console.log('Server is running on port 3050'));
       ````

4. **Add Start Script to `package.json`**:
   - Open `package.json` and modify the `scripts` section to include:
       ````json
       "scripts": {
           "start": "node index.js"
       }
       ````
   - Save the file.

5. **Run the Server**:
   - In the terminal, run:
       ````bash
       npm start
       ````
   - Expected output in the terminal:
       ```
       > server@1.0.0 start
       > node index.js

       Server is running on port 3050
       ```

6. **Test the Server**:
   - Open a browser and navigate to `http://localhost:3050`.
   - Expected output: `Hello from server` displayed in the browser.
   - Alternatively, use `curl`:
       ````bash
       curl http://localhost:3050
       ````
   - Expected output: `Hello from server`

## 2. Creating a Server with Routes and Logging
This section extends the basic server to handle different routes and log requests to a file.

### Step-by-Step Instructions

1. **Install the `fs` Module**:
   - The `fs` (File System) module is built into Node.js, so no installation is required.

2. **Update `index.js`**:
   - Replace the content of `index.js` with the following code to handle routes and log requests:
       ````javascript
       const http = require('http');
       const fs = require('fs');

       const myServer = http.createServer((req, res) => {
           const log = `${Date.now()}: ${req.url} New request received\n`;

           fs.appendFile('log.txt', log, (err) => {
               if (err) console.error('Error writing to log file:', err);
               switch (req.url) {
                   case '/':
                       res.end('Homepage');
                       break;
                   case '/about':
                       res.end('About page');
                       break;
                   default:
                       res.end('404 Not Found');
               }
           });
       });

       myServer.listen(3050, () => console.log('Server is running on port 3050'));
       ````

3. **Run the Server**:
   - Run:
       ````bash
       npm start
       ````
   - Expected output:
       ```
       Server is running on port 3050
       ```

4. **Test the Routes**:
   - Test the homepage:
       ````bash
       curl http://localhost:3050/
       ````
       - Expected output: `Homepage`
   - Test the about page:
       ````bash
       curl http://localhost:3050/about
       ````
       - Expected output: `About page`
   - Test a non-existent route:
       ````bash
       curl http://localhost:3050/contact
       ````
       - Expected output: `404 Not Found`
   - Check the `log.txt` file in the `server` folder for logged requests (e.g., timestamp and URL).

## 3. Parsing URLs and Query Parameters
This section adds URL parsing to handle query parameters and improve routing.

### Step-by-Step Instructions

1. **Install the `url` Module**:
   - The `url` module is built into Node.js, so no installation is required.

2. **Update `index.js`**:
   - Replace the content of `index.js` with the following code to parse URLs and handle query parameters:
       ````javascript
       const http = require('http');
       const fs = require('fs');
       const url = require('url');

       const myServer = http.createServer((req, res) => {
           if (req.url === '/favicon.ico') {
               return res.end(); // Ignore favicon requests
           }
           const log = `${Date.now()}: ${req.url} New request received\n`;
           const myUrl = url.parse(req.url, true); // Parse query parameters

           console.log(myUrl);

           fs.appendFile('log.txt', log, (err) => {
               if (err) console.error('Error writing to log file:', err);
               switch (myUrl.pathname) {
                   case '/':
                       console.log('Home page requested');
                       res.end('Homepage');
                       break;
                   case '/about':
                       const username = myUrl.query.myname || 'Guest';
                       res.end(`Good morning ${username}!`);
                       break;
                   default:
                       res.end('404 Not Found');
               }
           });
       });

       myServer.listen(3050, () => console.log('Server is running on port 3050'));
       ````

3. **Run the Server**:
   - Run:
       ````bash
       npm start
       ````

4. **Test URL Parsing**:
   - Test with a query parameter:
       ````bash
       curl http://localhost:3050/about?myname=teddybear
       ````
       - Expected output: `Good morning teddybear!`
   - Check the terminal for the parsed URL object, which should look like:
       ```
       Url {
         protocol: null,
         slashes: null,
         auth: null,
         host: null,
         port: null,
         hostname: null,
         hash: null,
         search: '?myname=teddybear',
         query: { myname: 'teddybear' },
         pathname: '/about',
         path: '/about?myname=teddybear',
         href: '/about?myname=teddybear'
       }
       ```
   - Test with multiple query parameters:
       ````bash
       curl http://localhost:3050/about?myname=teddybear&id=ok
       ````
       - Expected output: `Good morning teddybear!`
       - Terminal output should show `query: { myname: 'teddybear', id: 'ok' }`.

5. **Verify Logs**:
   - Check `log.txt` for logged requests, including timestamps and URLs.

## 4. Handling HTTP Methods and Status Codes
This section extends the server to handle different HTTP methods (GET, POST) and return appropriate status codes.

### Step-by-Step Instructions

1. **Update `index.js`**:
   - Replace the content of `index.js` with the following code to handle GET and POST requests:
       ````javascript
       const http = require('http');
       const fs = require('fs');
       const url = require('url');

       const myServer = http.createServer((req, res) => {
           if (req.url === '/favicon.ico') {
               return res.end();
           }
           const log = `${Date.now()}: ${req.method} ${req.url} New request received\n`;
           const myUrl = url.parse(req.url, true);

           console.log(myUrl);

           fs.appendFile('log.txt', log, (err) => {
               if (err) console.error('Error writing to log file:', err);
               switch (myUrl.pathname) {
                   case '/':
                       if (req.method === 'GET') {
                           res.writeHead(200, { 'Content-Type': 'text/plain' });
                           res.end('Home page requested');
                       } else {
                           res.writeHead(405, { 'Content-Type': 'text/plain' });
                           res.end('Method Not Allowed');
                       }
                       break;
                   case '/about':
                       const username = myUrl.query.myname || 'Guest';
                       res.writeHead(200, { 'Content-Type': 'text/plain' });
                       res.end(`Good morning ${username}!`);
                       break;
                   case '/signup':
                       if (req.method === 'GET') {
                           res.writeHead(200, { 'Content-Type': 'text/plain' });
                           res.end('Signup page requested');
                       } else if (req.method === 'POST') {
                           res.writeHead(201, { 'Content-Type': 'text/plain' });
                           res.end('All ok');
                       } else {
                           res.writeHead(405, { 'Content-Type': 'text/plain' });
                           res.end('Method Not Allowed');
                       }
                       break;
                   default:
                       res.writeHead(404, { 'Content-Type': 'text/plain' });
                       res.end('404 Not Found');
               }
           });
       });

       myServer.listen(3050, () => console.log('Server is running on port 3050'));
       ````

2. **Run the Server**:
   - Run:
       ````bash
       npm start
       ````

3. **Test HTTP Methods**:
   - Test GET request:
       ````bash
       curl http://localhost:3050/
       ````
       - Expected output: `Home page requested`
   - Test POST request (using curl):
       ````bash
       curl -X POST http://localhost:3050/signup
       ````
       - Expected output: `All ok`
   - Test an unsupported method (e.g., PUT):
       ````bash
       curl -X PUT http://localhost:3050/
       ````
       - Expected output: `Method Not Allowed`
   - Check `log.txt` for logged requests, including the method (e.g., GET, POST).

## 5. Creating an HTTP Client to Consume External APIs
This section demonstrates how to create an HTTP client to fetch data from an external API.

### Step-by-Step Instructions

1. **Create a Client File**:
   - Create a new file named `client.js` in the `server` folder.
   - Add the following code to fetch data from a public API (e.g., JSONPlaceholder):
       ````javascript
       const https = require('https');

       const options = {
           hostname: 'jsonplaceholder.typicode.com',
           path: '/todos/1',
           method: 'GET'
       };

       const req = https.request(options, (res) => {
           let data = '';

           res.on('data', (chunk) => {
               data += chunk;
           });

           res.on('end', () => {
               console.log('Response:', JSON.parse(data));
           });
       });

       req.on('error', (error) => {
           console.error('Error:', error);
       });

       req.end();
       ````

2. **Run the Client**:
   - Run:
       ````bash
       node client.js
       ````
   - Expected output (example):
       ```
       Response: {
         userId: 1,
         id: 1,
         title: 'delectus aut autem',
         completed: false
       }
       ```

3. **Explanation**:
   - The `https` module is used to make a GET request to the JSONPlaceholder API.
   - The response is collected in chunks and parsed as JSON when complete.
   - Error handling is included for robustness.

## 6. Parsing Request Bodies Manually
This section shows how to manually parse POST request bodies.

### Step-by-Step Instructions

1. **Update `index.js`**:
   - Replace the content of `index.js` with the following code to parse POST request bodies:
       ````javascript
       const http = require('http');
       const fs = require('fs');
       const url = require('url');

       const myServer = http.createServer((req, res) => {
           if (req.url === '/favicon.ico') {
               return res.end();
           }
           const log = `${Date.now()}: ${req.method} ${req.url} New request received\n`;
           const myUrl = url.parse(req.url, true);

           fs.appendFile('log.txt', log, (err) => {
               if (err) console.error('Error writing to log file:', err);
               switch (myUrl.pathname) {
                   case '/':
                       res.writeHead(200, { 'Content-Type': 'text/plain' });
                       res.end('Homepage');
                       break;
                   case '/signup':
                       if (req.method === 'POST') {
                           let body = '';
                           req.on('data', (chunk) => {
                               body += chunk一定的
                           });
                           req.on('end', () => {
                               const parsedBody = new URLSearchParams(body);
                               const username = parsedBody.get('username') || 'Guest';
                               res.writeHead(201, { 'Content-Type': 'text/plain' });
                               res.end(`Received: Hello ${username}!`);
                           });
                       } else {
                           res.writeHead(405, { 'Content-Type': 'text/plain' });
                           res.end('Method Not Allowed');
                       }
                       break;
                   default:
                       res.writeHead(404, { 'Content-Type': 'text/plain' });
                       res.end('404 Not Found');
               }
           });
       });

       myServer.listen(3050, () => console.log('Server is running on port 3050'));
       ````

2. **Run the Server**:
   - Run:
       ````bash
       npm start
       ````

3. **Test POST Request**:
   - Use `curl` to send a POST request:
       ````bash
       curl -X POST -d "username=john" http://localhost:3050/signup
       ````
   - Expected output: `Received: Hello john!`
   - The server collects the POST body in chunks, parses it using `URLSearchParams`, and extracts the `username` field.
