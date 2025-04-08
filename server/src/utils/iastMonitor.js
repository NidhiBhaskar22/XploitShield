// src/utils/iastMonitor.js

function monitorQuery(queryContext, userInput, context) {
  const riskyPatterns = [
    "--",
    ";",
    "/*",
    "*/",
    "'",
    '"',
    "OR 1=1",
    "DROP TABLE",
  ];
  const allInputs = Object.values(userInput || {}).join(" ");
  const isSuspicious = riskyPatterns.some((pat) => allInputs.includes(pat));

  if (isSuspicious) {
    console.warn("[⚠ IAST WARNING] Suspicious input detected:");
    console.warn("Query Context:", queryContext);
    console.warn("User Input:", userInput);
    console.warn("Request Meta:", context);
  }

  return { alert: isSuspicious };
}

module.exports = { monitorQuery };
 