// server/controllers/taskController.js
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.generateTask = async (req, res) => {
  const { role, competency, condition, additional } = req.body;

  if (!role || !competency || !condition || !additional) {
    return res.status(400).json({ success: false, message: "모든 입력값이 필요합니다." });
  }

  const prompt = `
다음 입력정보를 참고하여 과제를 설계해줘.
입력 정보:
- 직무 및 역할: ${role}
- 평가할 역량: ${competency}
- 과제 조건: ${condition}
- 부가 요구사항: ${additional}
응답은 반드시 JSON 형식으로 다음과 같이 해줘: 배열 안에 여러 개 오브젝트로 보내줘
[
{
  "직무 및 역할": "...",
  "평가할 역량": "...",
  "과제 조건": "...",
  "부가 요구사항": "...",
  "종합": "..."
}
]
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }]
    });

    let content = completion.choices[0].message.content.trim();
    if (content.startsWith("```json") || content.startsWith("```")) {
      content = content.replace(/```json|```/g, "").trim();
    }

    const parsed = JSON.parse(content);
    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("GPT 에러:", error);
    res.status(500).json({ success: false, message: "GPT 요청 실패" });
  }
};

// ✅ 새로운 컨트롤러 추가
exports.generateStep2Task = async (req, res) => {
  const { task_topic, role, situation, competency, sub_competencies, mission, time_briefing, time_performance } = req.body;

  if (!task_topic || !role || !situation || !competency || !sub_competencies || !mission || !time_briefing || !time_performance) {
    return res.status(400).json({ success: false, message: "모든 입력값이 필요합니다." });
  }

  const prompt = `
당신은 AC 평가 과제개발 전문가입니다.
다음 과제 주제에 대한 역할수행 과제의 PLOT을 구성하려고 합니다.

과제 주제: ${task_topic}

PLOT 구성 항목:
1. 역할: ${role}
2. 상황: ${situation}
3. 측정역량: ${competency} (${sub_competencies.join(", ")})
4. 해결과제: ${mission}
5. 시간: 과제숙지 ${time_briefing}, 역할수행 ${time_performance}

요청사항:
1. 세 가지 하위 역량별 세부 story
2. 각 하위 역량별 변별도 확보를 위한 point 설정
3. 각 하위 역량별 고성과자/저성과자 기준 (과제의 내용을 반영한 bars)

응답은 반드시 아래 예시처럼 JSON 형식으로 해주세요:

{
  "이해관계자 입장 파악": {
    "story": "주민들의 입장을 이해하고 의견을 경청하는 과정 설명",
    "point": "주요 이해관계자의 관심사를 정확히 파악했는지 평가",
    "bars": {
      "고성과자": "주요 이해관계자들의 입장을 명확히 파악하고, 갈등요소를 체계적으로 정리함",
      "저성과자": "주요 이해관계자들의 입장을 표면적으로만 파악하거나 일부만 고려함"
    }
  },
  ...
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }]
    });

    let content = completion.choices[0].message.content.trim();
    if (content.startsWith("```json") || content.startsWith("```")) {
      content = content.replace(/```json|```/g, "").trim();
    }

    const parsed = JSON.parse(content);
    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("Step2 GPT 에러:", error);
    res.status(500).json({ success: false, message: "Step2 GPT 요청 실패" });
  }
};
