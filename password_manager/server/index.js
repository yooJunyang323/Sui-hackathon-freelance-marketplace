// run node index.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Use JSON body parser middleware
app.use(bodyParser.json());

// Enable CORS so your frontend can call this API
app.use(cors());

// In-memory storage (replace with DB in production)
const encryptedRepos = {};


// Store encrypted repo URL and commit hash for a user address + orderId
app.post("/store", (req, res) => {
  const { userAddress, orderId, encryptedData } = req.body;
  if (!userAddress || !orderId || !encryptedData) {
    return res.status(400).json({ error: "Missing userAddress, orderId or encryptedData" });
  }

  const key = `${userAddress}_${orderId}`;
  encryptedRepos[key] = encryptedData;
  console.log(`Stored encrypted data for ${key}`);
  return res.json({ success: true });
});

// Fetch encrypted repo URL and commit hash for a user address + orderId
app.get("/repo", (req, res) => {
  const { userAddress, orderId } = req.query;
  if (!userAddress || !orderId) {
    return res.status(400).json({ error: "Missing userAddress or orderId query parameter" });
  }
  
  const key = `${userAddress}_${orderId}`;
  const encryptedData = encryptedRepos[key] || null;
  return res.json({ encryptedData });
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});