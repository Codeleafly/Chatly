const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Dynamic port set karo
const PORT = process.env.PORT || 3000;

const activeUsers = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('register', (userId) => {
        socket.userId = userId;
        activeUsers[userId] = socket.id;
        io.emit('active-users', Object.keys(activeUsers));
    });

    socket.on('send-message', ({ to, message, from }) => {
        const targetSocketId = activeUsers[to];
        if (targetSocketId) {
            io.to(targetSocketId).emit('receive-message', { message, from });
        }
    });

    socket.on('disconnect', () => {
        if (socket.userId) {
            delete activeUsers[socket.userId];
            io.emit('active-users', Object.keys(activeUsers));
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});