const axios = require("axios");

// Dynamically import the ESM-only Octokit package
let Octokit;
(async () => {
  const mod = await import("@octokit/rest");
  Octokit = mod.Octokit;
})();

async function getOctokit() {
  if (!Octokit) {
    const mod = await import("@octokit/rest");
    Octokit = mod.Octokit;
  }
  return new Octokit({ auth: process.env.GITHUB_TOKEN });
}

async function createBranch(owner, repo, baseBranch, newBranch) {
  const octokit = await getOctokit();

  const { data: refData } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${baseBranch}`,
  });

  await octokit.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${newBranch}`,
    sha: refData.object.sha,
  });

  return newBranch;
}

async function patchFile({ owner, repo, branch, filePath, patchText }) {
  const octokit = await getOctokit();

  const { data: fileData } = await octokit.repos.getContent({
    owner,
    repo,
    path: filePath,
    ref: branch,
  });

  const decodedContent = Buffer.from(fileData.content, "base64").toString(
    "utf-8"
  );

  // Replace vulnerable pattern (for now, using string replacement — AST comes later)
  const patchedContent = decodedContent.replace(
    "SELECT * FROM users",
    patchText
  );

  const updatedContentEncoded = Buffer.from(patchedContent).toString("base64");

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message: `fix: AI-patch for SQL injection in ${filePath}`,
    content: updatedContentEncoded,
    branch,
    sha: fileData.sha,
  });
}

async function createPullRequest({ owner, repo, base, head, title, body }) {
  const octokit = await getOctokit();

  const { data } = await octokit.pulls.create({
    owner,
    repo,
    title,
    body,
    head,
    base,
  });

  return data.html_url;
}

module.exports = { createBranch, patchFile, createPullRequest };
