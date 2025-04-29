const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 최초 1회 비밀번호 검증
exports.initPassword = (req, res) => {
  const password = req.body.password;
  if (password !== process.env.SECURE_PASSWORD) {
    return res.status(403).json({ success: false, message: "비밀번호가 일치하지 않습니다." });
  }
  return res.json({ success: true });
};

// 클라이언트에서 받은 prompt들을 10개씩 나눠 분석 후, 코드 블록 제거 및 JSON 파싱
exports.analyzeBatchPrompts = async (req, res) => {
  const prompts = req.body.prompts;
  if (!Array.isArray(prompts)) {
    return res.status(400).json({ success: false, message: "prompts 배열이 필요합니다." });
  }
  console.log(prompts);

  const batchSize = 10;
  const allPromises = [];

  let status = 1; // 기본 성공

  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize);
    const batchPromise = Promise.all(
      batch.map(prompt =>
        openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
        })
        .then(response => {
          let content = response.choices[0].message.content.trim();
          if (content.startsWith("```json")) {
            content = content.replace(/```json|```/g, "").trim();
          } else if (content.startsWith("```")) {
            content = content.replace(/```/g, "").trim();
          }
          try {
            const parsed = JSON.parse(content);
            console.log("parsed : ", parsed);
            return parsed;
          } catch (e) {
            console.error("JSON 파싱 오류:", e);
            status = 0; // 파싱 오류 있으면 전체 실패로 간주
            return null;
          }
        })
        .catch(err => {
          console.error("GPT 응답 실패:", err);
          status = 0; // GPT 통신 실패 있으면 전체 실패
          return null;
        })
      )
    );
    allPromises.push(batchPromise);
  }

  // 모든 GPT 호출 완료
  const allResults = await Promise.allSettled(allPromises);
  const flatResponses = allResults.flatMap(r =>
    r.status === "fulfilled" ? r.value.filter(response => response !== null) : []
  );

  // ✅ 전체 끝난 후에 한 번만 로그 전송
  

  res.json({ success: true, data: flatResponses });
};
