# URL Preview Service

URL Preview fetches and displays URL preview data and manage requests efficiently.

## Installation

To install the URL Tracker Service, you'll need Node.js and npm installed on your system. Follow these steps:

1. Clone the repository:
   ```bash
   git clone [repository-url]

2. Navigate to the project directory:
   ```bash
   cd urltracker-service

3.  Install the required dependencies:
    ```bash
    npm install

4. To start the server, run:
   ```bash
   npm start

The server will start on port 3001 by default. You can access the API at:

   ```bash
   http://localhost:3001/preview

__

To use the API, send a POST request to /preview with the URL you want to track and analyze.

Features:

Health Check Endpoint - Verify server health at http://localhost:3001/.

URL Preview: Generate a preview of the URL with title, description, and image.

