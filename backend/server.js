const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Global state for the polling system
const pollState = {
    teacherSocketId: null, // Keep track of teacher's ID (optional, but good for direct messages)
    currentPoll: null,
    students: {}
};

// CORS configuration to allow connections from your frontend
const io = new Server(server, {
    cors: {
        origin: "https://live-poll-frontend-59pt.onrender.com",
        methods: ["GET", "POST"]
    }
});

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Handle Disconnections
    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);
        // Remove the disconnected user from our state
        if (socket.id === pollState.teacherSocketId) {
            pollState.teacherSocketId = null;
            console.log('Teacher disconnected.');
        } else if (pollState.students[socket.id]) {
            delete pollState.students[socket.id];
            console.log(`Student disconnected: ${socket.id}`);
        }
    });

    // Listen for when a teacher connects and sets up the session
    socket.on('teacher_connect', () => {
        console.log(`Teacher connected with ID: ${socket.id}`);
        pollState.teacherSocketId = socket.id;
        
        // When a teacher connects, send the current poll state and results so the dashboard loads correctly
        if (pollState.currentPoll && pollState.currentPoll.isActive) {
             socket.emit('new_poll', pollState.currentPoll);
             socket.emit('vote_received', pollState.currentPoll.results);
        }
    });

    // Listen for when a student connects
    socket.on('student_connect', (studentName) => {
        console.log(`Student connected with ID: ${socket.id}, Name: ${studentName}`);
        
        // Ensure student state is correctly initialized
        pollState.students[socket.id] = {
            name: studentName,
            answered: false,
        };
        
        // If a poll is already active, send it to the newly connected student
        if (pollState.currentPoll && pollState.currentPoll.isActive) {
            socket.emit('new_poll', pollState.currentPoll);
        }
    });

    // Listen for when a teacher submits a new poll
    socket.on('create_poll', (pollData) => {
        console.log('New poll created by teacher:', pollData);
        
        // Save the new poll state
        pollState.currentPoll = {
            ...pollData,
            isActive: true,
            results: {}, // Initialize empty results
        };
        
        // Reset student answers for the new poll
        for (const studentId in pollState.students) {
            pollState.students[studentId].answered = false;
        }
        
        // CRITICAL: Use io.emit to send the new poll to ALL connected sockets (all students get it)
        io.emit('new_poll', pollState.currentPoll);
    });

    // Listen for when a student submits a vote
    socket.on('submit_vote', ({ pollId, voterId, votedOption }) => {
        
        // CRASH FIX: Check if the student record exists. If not, initialize it.
        if (!pollState.students[voterId]) {
            pollState.students[voterId] = {
                name: `Anonymous_${voterId.substring(0, 4)}`,
                answered: false,
            };
            console.log(`WARNING: Student ${voterId} voted before 'student_connect'. Initializing state.`);
        }

        // Only process the vote if the poll is active and the student hasn't voted yet
        if (pollState.currentPoll && pollState.currentPoll.isActive && !pollState.students[voterId].answered) {
            console.log(`Vote received from ${pollState.students[voterId].name || voterId}: ${votedOption}`);

            // Tally the vote
            pollState.currentPoll.results[votedOption] = (pollState.currentPoll.results[votedOption] || 0) + 1;
            pollState.students[voterId].answered = true; // Mark student as having answered

            // LIVE RESULTS FIX: Notify ALL connected sockets about the vote update (teacher and potentially others)
            io.emit('vote_received', pollState.currentPoll.results);
        }
    });

    // Listen for when a teacher closes the poll
    socket.on('close_poll', () => {
        if (pollState.currentPoll) {
            pollState.currentPoll.isActive = false;
            io.emit('poll_closed');
            console.log('Poll closed by teacher.');
        }
    });

    // Emit a welcome message to confirm the connection
    socket.emit('welcome_message', 'Hello from the Socket.io Server!');
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Server is running on http://localhost:${PORT}`));

