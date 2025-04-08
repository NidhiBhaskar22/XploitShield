require("dotenv").config();

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const githubRoutes = require("./routes/githubRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/github", githubRoutes);

console.log("✅ Middleware loaded");

// 👇 Add logging before and after route
console.log("✅ Registering /api/v1/auth route...");
app.use("/api/v1/auth", authRoutes);
console.log("✅ Route registered");

app.get("/", (req, res) => res.send("XploitShield API running"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
