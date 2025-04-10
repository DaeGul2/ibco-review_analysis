import axios from "axios";
import { sendLog } from "isbr_util";

const API_URL = process.env.REACT_APP_API_URL;

export const uploadFile = async (file, keyword, password, category) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("keyword", keyword);
  formData.append("password", password);
  formData.append("category", category);

  try {
    const response = await axios.post(`${API_URL}/upload`, formData);
    const data = response.data;

    const userName = prompt("로그를 남길 사용자 이름을 입력하세요");
    if (!userName) {
      console.warn("사용자 이름 미입력 - 로그 생략");
      return data;
    }

    const 분석결과 = data.data;
    if (!Array.isArray(분석결과)) {
      console.warn("분석결과가 배열이 아님 - 로그 생략");
      return data;
    }

    const people_count = 분석결과.length;
    const advantages = {};
    const disadvantages = {};

    분석결과.forEach((item) => {
      const 장점들 = Array.isArray(item["장점"]) ? item["장점"] : [];
      const 단점들 = Array.isArray(item["단점"]) ? item["단점"] : [];

      장점들.forEach((cat) => {
        advantages[cat] = (advantages[cat] || 0) + 1;
      });

      단점들.forEach((cat) => {
        disadvantages[cat] = (disadvantages[cat] || 0) + 1;
      });
    });

    await sendLog({
      appName: "파일분석",
      functionName: "uploadFile",
      userName,
      extra: {
        people_count,
        advantages,
        disadvantages,
      },
    });

    return data;
  } catch (error) {
    console.error("파일 업로드 오류:", error);
    return { success: false };
  }
};
