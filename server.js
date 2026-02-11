require('dotenv').config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const meetingRoutes = require("./routes/meetingRoutes");
const socketHandler = require("./socket/socketHandler");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", meetingRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173"
  }
});

// socket logic separate file
socketHandler(io);

const port = process.env.PORT || 5000;

server.listen(port, () => {
 console.log(`Server is running on port ${port}`);
});



 app.get("/", (req, res) => {
  res.send("Server is up and running!");
});