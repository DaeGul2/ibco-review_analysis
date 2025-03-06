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
      너는 공공기관 면접 후기 데이터를 분석하는 AI야.
      주어진 리뷰들이 특정 주제에 해당하는지 분석하고, JSON 형태로 결과를 제공해.
      각 리뷰에 대해 다음 정보를 포함해야 해:
      1. "판단결과" (1 or 0) int : 면접을 본 기관에 대해 평소에 지원자가 갖고있던 기관 이미지가 있었을텐데, 면접을 통해 기존에 갖고있던 기관 이미지가 변한거 같으면 1 아니면0
      2. "비고"  string : 판단결과에 대한 근거
      3. "장점":전체 채용진행에 따라 지원자가 느낀 장점 배열로 나열, 없으면 ['없음']   배열. 카테고리 내에서만 찾되 여러 개 추가 가능, 카테고리 = [면접위원에 대한 의견 / 면접 질문에 대한 의견 / 면접 분위기 / 전형 운영에 대한 의견]
      4. "단점":전체 채용진행에 따라 지원자가 느낀 단점 배열로 나열, 없으면 ['없음']   배열. 카테고리 내에서만 찾되 여러 개 추가 가능, 카테고리 = [면접위원에 대한 의견 / 면접 질문에 대한 의견 / 면접 분위기 / 전형 운영에 대한 의견]
      5. "요청": 리뷰에서 면접 경험에 대해 추가적으로 요청하고 싶은 기능 들을 배열로, 없으면 안 적어도됨
      6. "기관인상": 리뷰에서, 지원자가 해당 기관으로하여금 느꼈던 인상들을 배열로, 없으면 안 적어도됨. 
      * 중요 척도 * 
      기관인상은 아래의 9가지 카테고리중 복수 선택해줘. 무조건 아래 카테고리중 선택.
    
      (1) 신뢰도: 기관이 투명하고 신뢰할 수 있는가? (ex. "채용 과정이 공정했다.")
      (2) 사회적 평판: 외부에서 바라보는 기관의 이미지 (ex. "공공기관이라 안정적인 이미지가 강함.")
      (3) 직원 만족도: 직원들이 기관에 대해 긍정적으로 평가하는가? (ex. "내부 직원들이 자부심을 가짐.")
      (4) 윤리성/공정성: 기관이 청렴하고 윤리적인 운영을 하는가? (ex. "내정자가 있는 것 같았다.", "공정한 평가였다.")

      (5) 전문성: 면접위원이 질문을 논리적이고 체계적으로 했는가? (ex. "면접위원들이 질문이 준비되어 있지 않았다.", "전문적이고 꼼꼼하게 평가했다.")
      (6) 면접 분위기: 압박면접이었는지, 친절했는지 등 (ex. "압박면접이라 부담스러웠다.", "편안한 분위기에서 면접을 봤다.")
      (7) 질문 수준: 질문이 직무와 관련 있었는가? (ex. "엉뚱한 질문이 많았다.", "실무와 연관된 질문들이었다.")
      (8) 면접 공정성: 평가가 객관적이고 합리적으로 이루어졌는가? (ex. "정량 평가가 부족했다.", "평가기준이 명확했다.")
      


      컬럼명은 아래를 활용해

      응답 형식 (JSON 객체 내부에 배열을 포함해 출력해야 해):
      {
        "리뷰 데이터 분석": [
          { "리뷰": "리뷰 내용", "판단결과": 숫자(1or0), "비고": "판단 근거", "[장점]","[단점]" , "요청": [], "기관인상":[]},
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
