const express = require("express");
const { v4: uuidV4 } = require("uuid");

const router = express.Router();

router.post("/create-meeting", (req, res) => {
  const roomId = uuidV4();
  res.json({ roomId });
});

module.exports = router;
