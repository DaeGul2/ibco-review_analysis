// ISBR 면접 결과 리뷰 분석용

const fs = require("fs");
const xlsx = require("xlsx");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.processReviews = async (req, res) => {
  const filePath = req.file.path;
  const keyword = req.body.keyword;
  const password = req.body.password;

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
      너는 게임 전문 리뷰어야.
      주어진 리뷰들이 특정 주제에 해당하는지 분석하고, JSON 형태로 결과를 제공해.
      각 리뷰에 대해 다음 정보를 포함해야 해:
      1. "판단결과" (1~5 점수로 판단, 1: 전혀 관련 없음, 5: 매우 관련 있음) int
      2. "비고" (선택 사항, 판단 근거 설명) string
      3. "해당직업에 대한 호감도" (0~5 점수) int
      4. "기존 지원자" (1 혹은 0) 100% 이전에 해당 기관에 지원해본 지원자가 재도전한거면 1, 그렇지 않고 첫 지원이면 0 int
      5. "장점":느낀 장점 배열로 나열, 없으면 ['없음']   배열
      6. "단점":느낀 단점 배열로 나열, 없으면 ['없음']   배열

      컬럼명은 아래를 활용해

      응답 형식 (JSON 객체 내부에 배열을 포함해 출력해야 해):
      {
        "리뷰 데이터 분석": [
          { "리뷰": "리뷰 내용", "판단결과": 숫자(1~5), "비고": "필요할 경우 판단 근거", "호감도": 해당기관 에대한 지원자의 호감도(0~5), "기존지원자": 1or0,"[장점]","[단점]" },
          ...
        ]
      }

      주제: "${keyword}"
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
