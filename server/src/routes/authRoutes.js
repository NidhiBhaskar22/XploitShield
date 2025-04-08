const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");

const router = express.Router();

console.log("📦 authRoutes file loaded");

router.post("/register", (req, res, next) => {
  console.log("📬 /register route hit");
  return registerUser(req, res, next);
});

router.post("/login", loginUser);

module.exports = router;
