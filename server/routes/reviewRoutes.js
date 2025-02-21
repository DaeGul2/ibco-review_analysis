const express = require("express");
const { processReviews } = require("../controllers/reviewController");
const multer = require("multer");

// 업로드 폴더 및 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

const router = express.Router();

router.post("/upload", upload.single("file"), processReviews);

module.exports = router;
