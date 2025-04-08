const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

exports.registerUser = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser)
    return res.status(409).json({ message: "User already exists." });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, passwordHash: hashedPassword, role },
  });

  res
    .status(201)
    .json({
      message: "User registered successfully",
      user: { id: user.id, email: user.email, role: user.role },
    });
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({ access_token: token, token_type: "Bearer" });
};
