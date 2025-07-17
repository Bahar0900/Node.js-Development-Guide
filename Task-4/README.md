# Node.js HTTP Server and Client Guide

This beginner-friendly guide introduces you to working with HTTP in Node.js. It walks you through setting up a basic Node.js HTTP server from scratch, creating an HTTP client to interact with external APIs, and handling various HTTP methods such as GET, POST, PUT, and DELETE. You'll also gain a clear understanding of HTTP status codes and how to manage them effectively. Additionally, the guide covers how to manually parse request bodies without relying on external libraries, giving you a deeper insight into how HTTP communication works under the hood.

## Node Js Architecture
![Node.js Logo](https://github.com/Bahar0900/Node.js-Development-Guide/blob/b11865877ec20d30baecc3341ff426f6ad2152ad/Task-4/images/nodearchi.drawio.svg)

This diagram illustrates the internal architecture of Node.js and how it handles asynchronous operations using the event-driven model. Below is a step-by-step explanation of the flow:

- **Application Layer**: This is where the JavaScript code written by the developer resides.
- **V8 Engine**: The JavaScript engine (developed by Google) that executes the JavaScript code.
- **Node.js Bindings (Node API)**: Provides the bridge between the JavaScript layer and the lower-level C/C++ APIs.
- **OS Operations**: Some operations like file I/O or networking are offloaded to the operating system.
- **Event Queue**: Stores callback functions to be executed by the event loop.
- **Event Loop**:
  - Continuously checks the event queue for pending callbacks.
  - Handles non-blocking operations.
  - Delegates long-running or blocking operations to worker threads.
- **Worker Threads**:
  - Execute blocking operations in the background.
  - Return results via the event queue once the task is complete.
- **Executive Callback**: Once the event is ready, the corresponding callback is executed by the event loop.

This architecture allows Node.js to efficiently handle thousands of concurrent requests without blocking the main thread.

## Basic HTTP Server Workflow in Node.js
![Node.js Logo](https://github.com/Bahar0900/Node.js-Development-Guide/blob/172edf4de23f6ac5be8a1c1048ec32925038eecf/Task-4/server.drawio%20(2).svg)
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
## Install `curl` for Testing HTTP Requests

- **Windows**: Install via [curl.se](https://curl.se) or use PowerShell.  
- **macOS/Linux**: `curl` is usually pre-installed. You can verify by running:  
  ```bash
  curl --version
  ```

Alternatively, you can use a browser or tools like Postman for testing HTTP requests.


## 1. Building a Basic HTTP Server
This section guides you through creating a simple HTTP server that responds with a basic message.

## Step-by-Step Instructions

### Create a Project Directory

Create a folder named `server`:

```bash
mkdir server
cd server
```

### Initialize a Node.js Project

Run the following command to create a `package.json` file:

```bash
npm init -y
```

This creates a `package.json` with default settings. Verify by checking the `server` folder for `package.json`.

### Create the Server File

Create a file named `index.js` in the `server` folder.  
Add the following code to create a basic HTTP server:

```javascript
const http = require('http');

const myServer = http.createServer((req, res) => {
    console.log('New request received.');
    res.end('Hello from server');
});

myServer.listen(3050, () => console.log('Server is running on port 3050'));
```

### Add Start Script to `package.json`

Open `package.json` and modify the `scripts` section to include:

```json
"scripts": {
    "start": "node index.js"
}
```

Save the file.

### Run the Server

In the terminal, run:

```bash
npm start
```

Expected output in the terminal:  
![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/db5b60b7cdbaf624198d3c90b875232159ece418/Task-4/images/terminal1.JPG)

### Test the Server

Open a browser and navigate to `http://localhost:3050`.  
Expected output: `Hello from server` displayed in the browser.

Alternatively, use `curl`:

```bash
curl http://localhost:3050
```

Expected output:  
![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/3e8dd93b4ee89cbe4e2cf1b8924f98185c7de09c/Task-4/images/terminal11.JPG)


## 2. Creating a Server with Routes and Logging
This section extends the basic server to handle different routes and log requests to a file.

### Step-by-Step Instructions

**Install the `fs` Module**:
The `fs` (File System) module is built into Node.js, so no installation is required.

**Update `index.js`**:
Replace the content of `index.js` with the following code to handle routes and log requests:
```javascript
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
             

**Run the Server**:
Run:  
```bash
npm start
```
Expected output:
     
![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/db5b60b7cdbaf624198d3c90b875232159ece418/Task-4/images/terminal1.JPG)  

**Test the Routes**:  
Test the homepage:  
````bash
curl http://localhost:3050/
````  
Expected output:  
        
![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/e7838a8e74e56c9587aa10955b43b328fee2edfa/Task-4/images/terminal2.JPG)  
         
Test the about page:  
````bash
curl http://localhost:3050/about
````  
Expected output:  
         
  ![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/9e665842b4777cf1d43a1edcb744deffcce49159/Task-4/images/terminal3.JPG)  
         
Test a non-existent route:  
````bash
curl http://localhost:3050/contact
````  
Expected output:  

![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/002ea0acf7874df30cec6e7fd05e567f4569066a/Task-4/images/terminal4.JPG)  
         
Check the `log.txt` file in the `server` folder for logged requests (e.g., timestamp and URL).  

## 3. Parsing URLs and Query Parameters  
This section adds URL parsing to handle query parameters and improve routing.  

### Step-by-Step Instructions  

**Install the `url` Module**:  
The `url` module is built into Node.js, so no installation is required.  

**Update `index.js`**:  
Replace the content of `index.js` with the following code to parse URLs and handle query parameters:  
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

**Run the Server**:  
Run:  
````bash
npm start
````  

**Test URL Parsing**:  
Test with a query parameter:    
````bash
curl http://localhost:3050/about?myname=teddybear
````  
Expected output:  

![IMAGE](https://github.com/Bahar0900/Node.js-Development-Guide/blob/3a5813a853a846f7108c62577c0f365c87c72308/Task-4/images/terminal5.JPG)  
         
Check the terminal for the parsed URL object, which should look like:  
     
![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/bfbb48cec90f0483430743e4e5a9d0526c6fce1c/Task-4/images/terminal6.JPG)  
     
Test with multiple query parameters:  
````bash
curl "http://localhost:3050/about?myname=teddybear&id=ok"
````  
Expected output:  
  
![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/0d5a3ddb95157b32d920b591f40b816984642a06/Task-4/images/terminal7.JPG)  
         
**Server terminal output should contain**   
`query: [Object: null prototype] { myname: 'teddybear', id: 'ok' },`.  

**Verify Logs**:  
Check `log.txt` for logged requests, including timestamps and URLs.  

## 4. Handling HTTP Methods and Status Codes
This section extends the server to handle different HTTP methods (GET, POST) and return appropriate status codes.

### Step-by-Step Instructions  

**Update `index.js`**:
Replace the content of `index.js` with the following code to handle GET and POST requests:  
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

**Run the Server**:  
Run:  
````bash
npm start
````  

**Test HTTP Methods**:  
Test GET request:  
````bash
curl http://localhost:3050/
````  
Expected output:  

![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/fd65ec5c9b70cab9f34324ea02df27449783c9e5/Task-4/images/terminal8.JPG)  
         
Test POST request (using curl):  
````bash
curl -X POST http://localhost:3050/signup
````  
Expected output:  

![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/1f665a026d2446d501d4248f7f135ec90cb1f1a3/Task-4/images/terminal9.JPG)  
         
Test an unsupported method (e.g., PUT):  
````bash
curl -X PUT http://localhost:3050/
````  
Expected output:  

![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/df92bd1c8a028888e9d73eb3e957d6f22635baaf/Task-4/images/terminal10.JPG)  
         
Check `log.txt` for logged requests, including the method (e.g., GET, POST).  

## 5. Creating an HTTP Client to Consume External APIs  
This section demonstrates how to create an HTTP client to fetch data from an external API.  

### Step-by-Step Instructions  

**Create a Client File**:  
Create a new file named `client.js` in the `server` folder.  
Add the following code to fetch data from a public API (e.g., JSONPlaceholder):  
  ````javascript
       const http = require('http'); // corrected: use http, not https

      const options = {
          hostname: 'localhost', // no http://
          port: 3050,            // match your server's port
          path: '/',             // endpoint
          method: 'GET'
      };
      
      const req = http.request(options, (res) => {
          let data = '';
      
          res.on('data', (chunk) => {
              data += chunk;
          });
      
          res.on('end', () => {
              console.log('Response:', data); // no JSON.parse needed
          });
      });
      
      req.on('error', (error) => {
          console.error('Error:', error.message);
      });
      
      req.end();

  ````  

**Run the Client**:  
Run:  
````bash
node client.js
````  
Expected output:  

![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/4e1c060663f9b278943d403de4884943bd62c90d/Task-4/images/terminal13.JPG)  

**Explanation**:  
The `http` module is used to make a GET request to the the running server.  
The response is collected in chunks and parsed as JSON when complete.  

## 6. Parsing Request Bodies Manually  
This section shows how to manually parse POST request bodies.  

### Step-by-Step Instructions  

**Update `index.js`**:   
Replace the content of `index.js` with the following code to parse POST request bodies:  
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
                              body += chunk.toString(); // ✅ Fixed line
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

**Run the Server**:  
Run:   
````bash
npm start
````   

**Test POST Request**:  
Use `curl` to send a POST request:  
````bash
curl -X POST -d "username=john" http://localhost:3050/signup
````  
Expected output:  

![image](https://github.com/Bahar0900/Node.js-Development-Guide/blob/b7c8e27e895a2aedd3ec0bccc00a4a70548e3c7f/Task-4/images/terminal14.JPG)  
     
The server collects the POST body in chunks, parses it using `URLSearchParams`, and extracts the `username` field.  
