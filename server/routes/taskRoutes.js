// server/routes/taskRoutes.js
const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

router.post("/generate", taskController.generateTask);
router.post("/generateStep2", taskController.generateStep2Task); // ✅ 추가
router.post("/reviseStep2", taskController.reviseStep2Task); // ✅ 추가


module.exports = router;
