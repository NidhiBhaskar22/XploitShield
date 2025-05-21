
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));


let Octokit;

async function getOctokit() {
  if (!Octokit) {
    const mod = await import("@octokit/rest");
    Octokit = mod.Octokit;
  }
  return new Octokit({ auth: process.env.GITHUB_TOKEN });
}

async function createBranch(owner, repo, baseBranch, newBranch) {
  const octokit = await getOctokit();

  const { data: baseRef } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${baseBranch}`,
  });

  await octokit.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${newBranch}`,
    sha: baseRef.object.sha,
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




async function getPatchFromGemini(fileContent, issueDescription) {
  const prompt = `
The following JavaScript file contains a vulnerability:
** Description: ${issueDescription} **

Here is the file content:

${fileContent}


Please return a fully secured version of this code file with all the issues fixed and no comments.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();     

    if (!text || text.trim() === "") {
      throw new Error("Gemini returned an empty response.");
    }

    return text;
  } catch (error) {
    console.error("❌ Gemini SDK Error:", error);
    throw new Error("Gemini failed to generate a valid patch.");
  }
}


function removeComments(code) {
  // Remove single-line comments (// ...)
  code = code.replace(/(?<!:)\/\/.*$/gm, "");
  // Remove multi-line comments (/* ... */)
  code = code.replace(/\/\*[\s\S]*?\*\//gm, "");
  return code;
}



async function applyFixAndCreatePR({
  owner,
  repo,
  filePath,
  issue,
  baseBranch,
}) {
  const octokit = await getOctokit();

  const newBranch = `fix-${filePath
    .replace(/\//g, "-")
    .replace(".js", "")}-${Date.now()}`;
  await createBranch(owner, repo, baseBranch, newBranch);

  const { data: fileData } = await octokit.repos.getContent({
    owner,
    repo,
    path: filePath,
    ref: baseBranch,
  });

  const originalContent = Buffer.from(fileData.content, "base64").toString(
    "utf-8"
  );

  const rawPatch = await getPatchFromGemini(originalContent, issue.description);

  const extension = path.extname(filePath);
  const cleaned = stripMarkdownCodeBlock(rawPatch);
  const patchedContent = removeCommentsByExtension(cleaned, extension);
//  const patchedContent = removeComments(rawPatch);
  console.log(` Patched content for ${filePath}:\n`, patchedContent);

  if (!patchedContent || patchedContent.trim() === "") {
    throw new Error(`No valid patch returned for ${filePath}`);
  }

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message: `fix: Gemini AI-generated patch for ${filePath}`,
    content: Buffer.from(patchedContent).toString("base64"),
    branch: newBranch,
    sha: fileData.sha,
  });

  const prUrl = await createPullRequest({
    owner,
    repo,
    base: baseBranch,
    head: newBranch,
    title: `AI fix for ${filePath}`,
    body: `Automatically generated fix for:\n${issue.description}`,
  });

  return prUrl;
}

async function processAutoFixes({ owner, repo, baseBranch, analysisReport }) {
  const result = [];

  for (const file of analysisReport.analysis) {
    for (const issue of file.analysis) {
      if (issue.severity !== "None" && issue.description) {
        const prUrl = await applyFixAndCreatePR({
          owner,
          repo,
          filePath: file.file,
          issue,
          baseBranch,
        });

        result.push({
          file: file.file,
          prUrl,
          status: "patched",
        });
      }
    }
  }

  return result;
}

module.exports = {
  processAutoFixes,
};

