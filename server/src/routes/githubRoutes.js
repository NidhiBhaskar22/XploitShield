const express = require("express");
const { scanGithubRepo } = require("../controllers/githubScanController");
const {handleAutoFixRequest} = require("../controllers/githubPatchController");

const router = express.Router();

router.post("/scan-repo", scanGithubRepo);
router.post("/apply-patch", handleAutoFixRequest);

module.exports = router;
