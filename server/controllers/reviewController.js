// IBCO 상품분석리뷰용

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
      너는 리뷰 데이터를 분석하는 AI야.
      주어진 리뷰들이 특정 주제에 해당하는지 분석하고, JSON 형태로 결과를 제공해.
      각 리뷰에 대해 다음 정보를 포함해야 해:
      1. "판단결과" (1~5 점수로 판단, 1: 전혀 관련 없음, 5: 매우 관련 있음)
      2. "비고" (선택 사항, 판단 근거 설명)
      3. "미래고객가능성" (0~5 점수)
      4. "기존고객" (1 혹은 0) 기존 고객이 또 구매해서 댓글 쓴 거 같으면1, 그렇지 않고 첫 구매같으면 0
      5. "장점":리뷰에서 제품에대한 장점이 있으면 배열로 나열. 단, 다음의 카테고리 중 여러 개 골라줘. [향,성분,발림성과 사용감,사용감,순하다,거품,보습]
      6. "단점":리뷰에서 제품에 대한 아쉬운 점이 있으면 배열로 나열, 없으면 안적어도됨. [향,성분,발림성과 사용감,보습,거품]
      7. "요청": 리뷰에서 제품에 대해 추가적으로 요청하고 싶은 기능 들을 배열로, 없으면 안 적어도됨
      8. "비듬": 리뷰에서 비듬에 대한 언급이 조금이라도 있으면 1, 아니면 0
      9. "각질": 리뷰에서 각질에 대한 언급이 조금이라도 있으면 1, 아니면 0
      10. "포장": 리뷰에서 포장이나 배송에 대한 언급이 조금이라도 있으면 '포장'이라는 컬럼으로 1, 아니면 0
      11. "사용자": 리뷰에서 실제 제품 사용자가 누구인지 다음의 카테고리에서 골라서 배열에 추가. ['아이','임산부','어른','모르겠음'] // 여러 개 허용 ex) '아이와 같이 써요' =>"사용자":[아이,어른]


      응답 형식 (JSON 객체 내부에 배열을 포함해 출력해야 해):
      {
        "리뷰 데이터 분석": [
          { "리뷰": "리뷰 내용", "판단결과": 숫자(1~5), "비고": "필요할 경우 판단 근거", "미래고객가능성": 숫자(0~5), "기존고객": 1or0,"장점","단점","요청":["요청사항들"],"비듬","각질","포장","사용자" },
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

    } catch (error) {
      console.error("❌ JSON 파싱 오류:", error);
      return res.status(500).json({ success: false, message: "GPT 응답 처리 중 오류 발생" });
    }

    results.push(...parsedData); // ✅ 배열을 안전하게 추가
  }

  res.json({ success: true, data: results });
};
