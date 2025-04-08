const {
  createBranch,
  patchFile,
  createPullRequest,
} = require("../services/githubPatchService");

exports.applyPatchAndPR = async (req, res) => {
  const { owner, repo, baseBranch, filePath, patchText } = req.body;

  const newBranch = `auto-patch-${Date.now()}`;

  try {
    await createBranch(owner, repo, baseBranch, newBranch);
    await patchFile({ owner, repo, branch: newBranch, filePath, patchText });

    const prUrl = await createPullRequest({
      owner,
      repo,
      base: baseBranch,
      head: newBranch,
      title: `AI Patch: Fix vulnerability in ${filePath}`,
      body: `XploitShield AI detected a potential issue and suggests this fix:\n\n\`\`\`\n${patchText}\n\`\`\``,
    });

    res.json({ message: "Patch applied and PR created", pr_url: prUrl });
  } catch (error) {
    console.error("Error applying patch:", error);
    res.status(500).json({ message: "Failed to create PR" });
  }
};
