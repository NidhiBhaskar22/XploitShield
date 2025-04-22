# XploitShield 🔐

XploitShield is an automated security analysis tool that scans GitHub repositories and detects potential security vulnerabilities in code files. It uses the Gemini API for intelligent static analysis, providing human-readable reports highlighting risky patterns and configurations.

## 🚀 Features

- 🔍 Analyzes JavaScript/TypeScript source files using Gemini API
- 🛡️ Detects potential vulnerabilities like:
  - Insecure ESLint rules
  - Dangerous patterns in server code
  - Configuration misuse
- 📄 Returns actionable security analysis reports
- ⚡ REST API powered by Node.js and Express
- 🔐 Supports secure Gemini API key management via `.env`

## 📁 Project Structure

XploitShield/ │ ├── client/ # Frontend application (if applicable) 🖥️ │ ├── server/ # Backend application 💻 │ ├── src/ │ │ ├── controllers/ # Logic for handling API requests 🎮 │ │ ├── routes/ # Express route definitions 📡 │ │ ├── utils/ # Gemini API integration & helper utilities ⚙️ │ │ └── config/ # Server and environment configurations ⚡ │ │ │ ├── .env # Environment variables (e.g., API keys) 🔑 │ └── server.js # Entry point for the backend server 🚀 │ └── README.md # Project documentation 📄
