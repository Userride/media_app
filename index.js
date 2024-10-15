const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoDB = require('./db');
const { Server } = require('socket.io');
const http = require('http');

dotenv.config({ path: './config.env' });

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(bodyParser.json());

// CORS configuration without hardcoded localhost
app.use(cors({
    origin: true, // Allows requests from any origin dynamically
    credentials: true // Allow credentials if needed
}));

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server);

// Routes
const { router: createUserRouter } = require('./Controller/CreateUser');
const displayDataRouter = require('./Controller/DisplayData');

app.use('/api', createUserRouter);
app.use('/api', displayDataRouter);

// Simple GET route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Initialize database connection and start server
mongoDB().then(() => {
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch(err => {
    console.error("Failed to connect to the database. Server not started.", err);
});
