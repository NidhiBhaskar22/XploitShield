const express = require("express");
const { scanGithubRepo } = require("../controllers/githubScanController");
const {applyPatchAndPR} = require("../controllers/githubPatchController");

const router = express.Router();

router.post("/scan-repo", scanGithubRepo);
router.post("/apply-patch", applyPatchAndPR);

module.exports = router;
