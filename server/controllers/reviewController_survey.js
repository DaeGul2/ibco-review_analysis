// ISBR 면접 결과 리뷰 분석용

const fs = require("fs");
const xlsx = require("xlsx");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.processReviews = async (req, res) => {
  const filePath = req.file.path;
  const keyword = req.body.keyword;
  const password = req.body.password;
  const category = req.body.category;
console.log("cateogry : ", category);
  // 비밀번호 검증
  if (password !== process.env.SECURE_PASSWORD) {
    return res.status(403).json({ success: false, message: "비밀번호가 일치하지 않습니다." });
  }

  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = xlsx.utils.sheet_to_json(sheet);

  const reviews = jsonData.map((row) => row.review);
  const results = [];

  for (let i = 0; i < reviews.length; i += 10) {
    const batch = reviews.slice(i, i + 10);
    const prompt = `
      너는 공공기관 채용 후기 데이터를 분석하는 AI야.
      주어진 리뷰들이 특정 주제에 해당하는지 분석하고, JSON 형태로 결과를 제공해.
      각 정보에 대해 너의 응답형태를 카테고리를 배열형태로 보내줄테니, 반드시 카테고리 내에서만 선택해야돼.

      각 리뷰에 대해 다음 정보를 포함해야 해:
      또한, 칭찬, 불편함의 경우 '반드시 카테고리 내에서' 선택해야돼.
      1. "칭찬": 사용자의 리뷰를 봤을 때, 본인 경험에 대해 긍정적일 경우, 어떤 점을 칭찬하고싶은지 카테고리 중 다수 선택 = ${category}. 반드시 한 개는 선택해야됨. 없으면 '없음'
      2. "불편함":사용자의 리뷰를 봤을 때, 본인 경험에 대해 불편함을 느겼을 경우, 어떤 점에서 불편함을 느꼈는지 카테고리 중 다수 선택 = ${category}. 반드시 한 개는 선택해야됨. 없으면 '없음'
      3. "요청": 리뷰에서 이용자의 경험에 대해 추가적으로 요청하고 싶은 기능 들을 배열로, 없으면 안 적어도됨

      컬럼명은 아래를 활용해

      응답 형식 (JSON 객체 내부에 배열을 포함해 출력해야 해):
      {
        "리뷰 데이터 분석": [
          { "리뷰": "리뷰 내용", "칭찬":[],"불편함":[] "요청": []},
          ...
        ]
      }

      
      분석할 리뷰:
      ${JSON.stringify(batch)}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }, // ✅ JSON 응답을 보장
    });

    // GPT 응답 처리
    let parsedData;
    try {
      let content = response.choices[0].message.content.trim(); // 앞뒤 공백 제거

      if (content.startsWith("```json")) {
        content = content.replace(/```json|```/g, "").trim(); // ` ```json ` 및 ` ``` ` 제거
      }

      parsedData = JSON.parse(content);

      // 🔥 "리뷰 데이터 분석" 키가 있는지 확인하고 해당 배열을 가져오기
      if (parsedData["리뷰 데이터 분석"]) {
        parsedData = parsedData["리뷰 데이터 분석"];
      } else {
        console.error("⚠ GPT 응답에 '리뷰 데이터 분석' 키가 없음:", parsedData);
        parsedData = []; // 데이터가 없으면 빈 배열 처리
      }

      // 🔥 배열인지 최종 확인
      if (!Array.isArray(parsedData)) {
        console.error("⚠ 변환 후에도 배열이 아님! 변환 시도:", parsedData);
        parsedData = [parsedData]; // 객체일 경우 배열로 변환
      }
      console.log(parsedData)

    } catch (error) {
      console.error("❌ JSON 파싱 오류:", error);
      return res.status(500).json({ success: false, message: "GPT 응답 처리 중 오류 발생" });
    }

    results.push(...parsedData); // ✅ 배열을 안전하게 추가
  }

  res.json({ success: true, data: results });
};
