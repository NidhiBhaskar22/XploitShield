const { getRepoTree, getFileContent } = require("../services/githubService");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });


async function scanWithGemini(filename, code) {
  const prompt = `
You're an expert AI code security scanner. Analyze the following code file for vulnerabilities (SQLi, XSS, SSRF, Auth issues, etc.)
and return the list of issues and suggested patches in markdown format.

File: ${filename}
\`\`\`
${code}
\`\`\`
`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

exports.scanGithubRepo = async (req, res) => {
  const { owner, repo, branch } = req.body;

  if (!owner || !repo) {
    return res
      .status(400)
      .json({ message: "Missing required fields: owner, repo" });
  }

  try {
    const tree = await getRepoTree(owner, repo, branch || "main");
    const results = [];

    for (const file of tree) {
      if (file.path.endsWith(".js") || file.path.endsWith(".ts")) {
        const code = await getFileContent(owner, repo, file.path);

        try {
          const analysis = await scanWithGemini(file.path, code);
          results.push({
            file: file.path,
            analysis,
          });
        } catch (e) {
          results.push({
            file: file.path,
            analysis: `Gemini API error: ${e.message}`,
          });
        }
      }
    }

    res.json({ scanned_files: tree.length, analysis: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "GitHub scan failed", error: err.message });
  }
};
