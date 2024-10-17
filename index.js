const express = require('express');
const { io } = require('socket.io-client');
const app = express();
app.use(express.json());

// Initialize the Socket.IO client
const socket = io('http://localhost:4001', {  
  transports: ['websocket', 'polling'], 
});

// Handle socket connection
socket.on('connect', () => {
  console.log('Connected to chat server as client:', socket.id);
});

// Listen to incoming messages from the server (newMessage)
socket.on('newMessage', (message) => {
  console.log('Message received from server:', message);
});

// Listen to room join confirmation
socket.on('userJoined', ({ roomName }) => {
  console.log(`A user joined room: ${roomName}`);
});

// Listen to message history after joining room
socket.on('messageHistory', (messages) => {
  console.log('Message history:', messages);
});

// Listen to errors
socket.on('error', (errorMessage) => {
  console.error('Error:', errorMessage);
});

// Endpoint to send a message to the chat server
app.post('/send-message', (req, res) => {
  const { roomId, content, userId } = req.body;
  if (!content || !roomId || !userId) {
    return res.status(400).json({ error: 'roomId, content, userId are required' });
  }

  // Send message to the server
  socket.emit('sendMessage', { roomId, content, userId });
  res.json({ status: 'Message sent', content });
});

// Endpoint to join a chat room
app.post('/join-room', (req, res) => {
  const { roomName } = req.body;
  if (!roomName) {
    return res.status(400).json({ error: 'Room name is required' });
  }

  // Join the specified room
  socket.emit('joinRoom', roomName);
  res.json({ status: `Joining room: ${roomName}` });
});

// Start the Express server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});
