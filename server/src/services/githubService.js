const axios = require("axios");

console.log("👉 GITHUB_TOKEN:", process.env.GITHUB_TOKEN); // Debug print

const GITHUB_API = "https://api.github.com";

const githubClient = axios.create({
  baseURL: GITHUB_API,
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "xploitshield-agent",
  },
});

// List all files in a repo path (recursively)
async function getRepoTree(owner, repo, branch = "main") {
  const res = await githubClient.get(
    `/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
  );
  return res.data.tree.filter((file) => file.type === "blob"); // only files
}

// Get the raw code of a file
async function getFileContent(owner, repo, filePath) {
  const res = await githubClient.get(
    `/repos/${owner}/${repo}/contents/${filePath}`
  );
  const content = Buffer.from(res.data.content, "base64").toString("utf-8");
  return content;
}

module.exports = { getRepoTree, getFileContent };
