const { getRepoTree, getFileContent } = require("../services/githubService");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });


async function scanWithGemini(filename, code) {
  const prompt = `
You are a professional application security analyst.

Analyze the following JavaScript/TypeScript code file for **actual security vulnerabilities** (e.g., SQL Injection, XSS, CSRF, SSRF, Insecure Auth, Token leakage, etc.). Ignore minor coding issues or stylistic concerns.

For each vulnerability, provide:
- **Issue:** Short and clear title
- **Severity:** High | Medium | Low
- **Recommendation:** Practical fix or code change

Respond in **strict markdown format**, separating each issue clearly.

File: ${filename}
\`\`\`
${code}
\`\`\`
`;
  const result = await model.generateContent(prompt);
  const analysisText = result.response.text();

  // Parsing the analysis to structure it better for end users
  const structuredAnalysis = parseAnalysis(analysisText);
  return structuredAnalysis;
}

// Helper function to parse and simplify the analysis response
function parseAnalysis(analysisText) {
  const simplified = [];

  const issues = analysisText.split("\n\n");

  for (const issue of issues) {
    const lines = issue.trim().split("\n");

    const issueObj = {
      description: "",
      severity: "",
      suggestedFix: "",
    };

    for (const line of lines) {
      if (line.toLowerCase().includes("issue:")) {
        issueObj.description = line.split(":").slice(1).join(":").trim();
      } else if (line.toLowerCase().includes("severity:")) {
        issueObj.severity = line.split(":").slice(1).join(":").trim();
      } else if (
        line.toLowerCase().includes("recommendation:") ||
        line.toLowerCase().includes("suggested patch:")
      ) {
        issueObj.suggestedFix = line.split(":").slice(1).join(":").trim();
      }
    }

    // ✅ Only push if there's meaningful content
    if (issueObj.description || issueObj.suggestedFix) {
      // Optional: default severity if missing
      if (!issueObj.severity) issueObj.severity = "Low";

      simplified.push(issueObj);
    }
  }

  return simplified;
}


function mergeRelatedEntries(rawAnalysis) {
  const entries = [];
  let pendingEntry = null;

  for (const item of rawAnalysis) {
    const hasDescription = item.description && item.description.trim() !== "";
    const hasFix = item.suggestedFix && item.suggestedFix.trim() !== "";

    if (hasDescription && hasFix) {
      entries.push(item); // Complete entry
    } else if (hasDescription) {
      pendingEntry = { ...item }; // Wait for fix
    } else if (hasFix && pendingEntry) {
      pendingEntry.suggestedFix = item.suggestedFix;
      entries.push(pendingEntry);
      pendingEntry = null;
    } else if (hasFix) {
      // Unmatched fix (rare, but keep)
      entries.push(item);
    }
  }

  // In case any leftover
  if (pendingEntry) entries.push(pendingEntry);

  return entries;
}


//-----------------POST PROCESSING-----------------
function ensureCompleteAnalysis(input) {
  for (const fileEntry of input.analysis) {
    const fixedAnalysis = [];

    for (const issue of fileEntry.analysis) {
      let { description, suggestedFix } = issue;

      // If description is missing, infer from suggestedFix
      if (!description || description.trim() === "") {
        description = inferDescriptionFromFix(suggestedFix);
      }

      // If still no valid description or fix, skip it
      if (description && suggestedFix) {
        fixedAnalysis.push({
          description,
          severity: issue.severity,
          suggestedFix,
        });
      }
    }

    fileEntry.analysis = fixedAnalysis;
  }

  return input;
}

// Basic heuristic to infer what the issue is about
function inferDescriptionFromFix(fix) {
  if (!fix) return "";

  const mappings = [
    {
      keyword: "sanitize",
      desc: "Input is not sanitized and could lead to injection attacks.",
    },
    {
      keyword: "escape",
      desc: "Input may contain unsafe HTML that should be escaped.",
    },
    {
      keyword: "UUID",
      desc: "The current ID generation is not unique or secure.",
    },
    { keyword: "validation", desc: "Missing validation on input fields." },
    {
      keyword: "backend verification",
      desc: "Missing backend verification for sensitive operations like deletion.",
    },
  ];

  const lowerFix = fix.toLowerCase();
  for (const { keyword, desc } of mappings) {
    if (lowerFix.includes(keyword)) return `** ${desc}`;
  }

  // Default fallback
  return "** A security concern has been flagged but lacks a specific description.";
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
         let analysis = await scanWithGemini(file.path, code);

         // If the analysis is empty or not an array, handle it gracefully
         if (!Array.isArray(analysis) || analysis.length === 0) {
           analysis = [
             {
               description: "No security issues detected in this file.",
               severity: "None",
               suggestedFix: "N/A",
             },
           ];
         }

         results.push({
           file: file.path,
           analysis,
         });
       } catch (e) {
         results.push({
           file: file.path,
           analysis: [
             {
               description: `Gemini API error: ${e.message}`,
               severity: "Error",
               suggestedFix:
                 "Try rerunning the scan or check API limits/configuration.",
             },
           ],
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
