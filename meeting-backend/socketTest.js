const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

const meetingId = "87cfa522263b";

socket.on("connect", () => {
    console.log("Connected to IntellMeet Socket.IO");
    console.log("Socket ID:", socket.id);

    socket.emit("join-meeting", meetingId);

    console.log("Joined meeting room:", meetingId);

    // Send a test message
    setTimeout(() => {
        socket.emit("send-message", {
            meetingId: meetingId,
            message: "Hello from IntellMeet!"
        });

        console.log("Test message sent");
    }, 1000);
});

socket.on("receive-message", (data) => {
    console.log("Message received:", data);
});

socket.on("user-joined", (data) => {
    console.log("Another user joined:", data.socketId);
});

socket.on("user-left", (data) => {
    console.log("User left:", data.socketId);
});

socket.on("connect_error", (error) => {
    console.log("Connection failed:", error.message);
});