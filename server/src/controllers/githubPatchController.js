const {
  createBranch,
  patchFile,
  createPullRequest,
} = require("../services/githubPatchService");

exports.applyPatchAndPR = async (req, res) => {
  const { owner, repo, baseBranch, analysisResponse } = req.body;

  const newBranch = `auto-patch-${Date.now()}`;
  const prBodyLines = [];
  const modifiedFiles = [];

  try {
    await createBranch(owner, repo, baseBranch, newBranch);

    for (const fileEntry of analysisResponse.analysis) {
      const { file, analysis } = fileEntry;

      if (!analysis.length) continue;

      let combinedPatch = "";
      for (const issue of analysis) {
        if (issue.suggestedFix && issue.suggestedFix.trim() !== "") {
          combinedPatch += issue.suggestedFix.trim() + "\n\n";
        }
      }

      if (combinedPatch) {
        await patchFile({
          owner,
          repo,
          branch: newBranch,
          filePath: file,
          patchText: combinedPatch.trim(),
        });

        modifiedFiles.push(file);
        prBodyLines.push(
          `### ${file}\n\`\`\`diff\n${combinedPatch.trim()}\n\`\`\`\n`
        );
      }
    }

    if (!modifiedFiles.length) {
      return res.status(400).json({ message: "No applicable fixes found." });
    }

    const prUrl = await createPullRequest({
      owner,
      repo,
      base: baseBranch,
      head: newBranch,
      title: `AI Patch: Fix vulnerabilities in ${modifiedFiles.join(", ")}`,
      body: `XploitShield AI detected potential issues and applied the following fixes:\n\n${prBodyLines.join(
        "\n"
      )}`,
    });

    res.json({ message: "Patches applied and PR created", pr_url: prUrl });
  } catch (error) {
    console.error("Error applying patch:", error);
    res
      .status(500)
      .json({ message: "Failed to create PR", error: error.message });
  }
};
