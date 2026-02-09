const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const meetingRoutes = require("./routes/meetingRoutes");
const socketHandler = require("./socket/socketHandler");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", meetingRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// socket logic separate file
socketHandler(io);

server.listen(5000, () => {
  console.log("Backend running on port 5000");
});

app.get("/", (req, res) => {
  res.send("Server is up and running!");
});