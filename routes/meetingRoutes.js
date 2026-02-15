const express = require("express");
const { v4: uuidV4, validate: uuidValidate } = require("uuid");

const router = express.Router();

// Store created rooms in memory (in production, use a database)
const createdRooms = new Set();

router.post("/create-meeting", (req, res) => {
  const roomId = uuidV4();
  createdRooms.add(roomId);
  res.json({ roomId });
});

// Check if a meeting exists
router.get("/meeting/:roomId", (req, res) => {
  const { roomId } = req.params;
  
  // Validate UUID format
  if (!uuidValidate(roomId)) {
    return res.status(400).json({ 
      exists: false, 
      message: "Invalid meeting ID format" 
    });
  }
  
  // Check if room exists in memory
  const exists = createdRooms.has(roomId);
  
  res.json({ 
    exists, 
    message: exists ? "Meeting found" : "Meeting not found" 
  });
});

// Join meeting - validate and prepare for joining
router.post("/join-meeting", (req, res) => {
  const { roomId, name } = req.body;
  
  if (!roomId || !name) {
    return res.status(400).json({ 
      success: false, 
      message: "Room ID and name are required" 
    });
  }
  
  // Validate UUID format
  if (!uuidValidate(roomId)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid meeting ID format" 
    });
  }
  
  // Check if room exists
  if (!createdRooms.has(roomId)) {
    return res.status(404).json({ 
      success: false, 
      message: "Meeting not found. Please check the meeting ID." 
    });
  }
  
  // Room exists, allow join via socket
  res.json({ 
    success: true, 
    message: "Meeting found. Connecting via socket...",
    roomId 
  });
});

