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

### .env:

DATABASE_URL="YOUR-DATABASE-URL"  
JWT_SECRET="YOUR-SECRET-KEY"  
MONGODB_URI="YOUR-MONGODB-URI"  
GITHUB_TOKEN="YOUR-GITHUB-PAT"  
GEMINI_API_KEY="YOUR-GEMINI-API-KEY"




