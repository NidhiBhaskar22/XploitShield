const { getRepoTree, getFileContent } = require("../services/githubService");

exports.scanGithubRepo = async (req, res) => {
  const { owner, repo, branch } = req.body;

  try {
    const tree = await getRepoTree(owner, repo, branch);
    const results = [];

    for (const file of tree) {
      if (file.path.endsWith(".js") || file.path.endsWith(".ts")) {
        const code = await getFileContent(owner, repo, file.path);

        // TODO: Replace with actual AI scan logic
        console.log(`Scanning ${file.path}...`);
        const isVulnerable = code.includes("SELECT * FROM users");

        if (isVulnerable) {
          results.push({
            file: file.path,
            vulnerability: "SQL Injection",
            confidence: 0.95,
          });
        }
      }
    }

    res.json({ scanned_files: tree.length, vulnerabilities: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "GitHub scan failed" });
  }
};
