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

// Store encrypted repo URL for a user address
// app.post("/store", (req, res) => {
//   const { userAddress, encryptedRepo } = req.body;
//   if (!userAddress || !encryptedRepo) {
//     return res.status(400).json({ error: "Missing userAddress or encryptedRepo" });
//   }

//   encryptedRepos[userAddress] = encryptedRepo;
//   console.log(`Stored encrypted repo for ${userAddress}`);
//   return res.json({ success: true });

// Store encrypted repo URL and commit hash for a user address + orderId
app.post("/store", (req, res) => {
  const { userAddress, orderId, encryptedRepo, encryptedCommit } = req.body;
  if (!userAddress || !encryptedRepo || !orderId || !encryptedCommit) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const key = `${userAddress}_${orderId}`;
  encryptedRepos[key] = { encryptedRepo, encryptedCommit };
  console.log(`Stored encrypted repo and commit for ${key}`);
  return res.json({ success: true });
});

// Fetch encrypted repo URL for a user address
// app.get("/repo", (req, res) => {
//   const userAddress = req.query.userAddress;
//   if (!userAddress) {
//     return res.status(400).json({ error: "Missing userAddress query parameter" });
//   }

//   const encryptedRepo = encryptedRepos[userAddress] || null;
//   return res.json({ encryptedRepo });


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
