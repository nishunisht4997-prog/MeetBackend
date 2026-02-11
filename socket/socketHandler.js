const rooms = {};
const waitingRooms = {}; // Store waiting participants per room

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Request to join room (waiting room logic)
    socket.on("request-to-join", ({ roomId, name }) => {
      socket.join(roomId);

      if (!waitingRooms[roomId]) {
        waitingRooms[roomId] = [];
      }

      // Add to waiting list
      waitingRooms[roomId].push({
        id: socket.id,
        name: name || 'Anonymous'
      });

      // Notify all hosts in the room about waiting participant
      socket.to(roomId).emit("request-to-join", {
        userId: socket.id,
        name: name || 'Anonymous'
      });

      console.log("User requested to join:", socket.id, "Room:", roomId);
    });

    // Accept join request
    socket.on("accept-join", ({ roomId, userId }) => {
      // Find the waiting participant
      const waitingParticipant = waitingRooms[roomId]?.find(p => p.id === userId);

      if (waitingParticipant) {
        // Remove from waiting list
        waitingRooms[roomId] = waitingRooms[roomId].filter(p => p.id !== userId);

        // Notify the accepted user
        io.to(userId).emit("accept-join");

        console.log("User accepted:", userId, "Room:", roomId);
      }
    });

    // Reject join request
    socket.on("reject-join", ({ roomId, userId }) => {
      // Find the waiting participant
      const waitingParticipant = waitingRooms[roomId]?.find(p => p.id === userId);

      if (waitingParticipant) {
        // Remove from waiting list
        waitingRooms[roomId] = waitingRooms[roomId].filter(p => p.id !== userId);

        // Notify the rejected user
        io.to(userId).emit("reject-join");

        // Remove user from room
        socket.to(roomId).emit("user-left", userId);

        console.log("User rejected:", userId, "Room:", roomId);
      }
    });

    // Join room (after approval)
    socket.on("join-room", (roomId) => {
      socket.join(roomId);

      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }

      rooms[roomId].push(socket.id);

      // Notify other users in room
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

      // remove from waiting rooms
      for (const roomId in waitingRooms) {
        waitingRooms[roomId] = waitingRooms[roomId].filter(
          (participant) => participant.id !== socket.id
        );

        // If waiting room is empty, clean it up
        if (waitingRooms[roomId].length === 0) {
          delete waitingRooms[roomId];
        }
      }
    });
  });
};
