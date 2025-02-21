require("dotenv").config();
const express = require("express");
const cors = require("cors");

const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(cors());

// 라우트 설정
app.use("/api/review", reviewRoutes);

// 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ 서버 실행 중: http://localhost:${PORT}`));
