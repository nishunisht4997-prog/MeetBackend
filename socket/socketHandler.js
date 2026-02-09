const rooms = {};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join room
    socket.on("join-room", (roomId) => {
      socket.join(roomId);

      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }

      rooms[roomId].push(socket.id);

      // Notify other user
      socket.to(roomId).emit("user-joined", socket.id);

      console.log("Room users:", rooms[roomId]);
    });

    // Offer from one user
    socket.on("offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("offer", { offer, from: socket.id });
    });

    // Answer from other user
    socket.on("answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("answer", { answer, from: socket.id });
    });

    // ICE candidate exchange
    socket.on("ice-candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("ice-candidate", { candidate, from: socket.id });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      // remove from rooms
      for (const roomId in rooms) {
        rooms[roomId] = rooms[roomId].filter(
          (id) => id !== socket.id
        );
      }
    });
  });
};
