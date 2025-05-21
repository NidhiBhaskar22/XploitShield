const { processAutoFixes } = require("../services/githubPatchService");

exports.handleAutoFixRequest = async (req, res) => {
  const { owner, repo, baseBranch, analysisReport } = req.body;

  try {
    if (!owner || !repo || !baseBranch || !analysisReport) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const result = await processAutoFixes({
      owner,
      repo,
      baseBranch,
      analysisReport,
    });
    res.status(200).json({ message: "Fixes applied and PRs created", result });
  } catch (err) {
    console.error("Auto-fix error:", err);
    res.status(500).json({ error: err.message });
  }
};
