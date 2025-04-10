import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// 비밀번호 초기 1회 인증
export const initPassword = async (password) => {
  try {
    const response = await axios.post(`${API_URL}/init`, { password });
    return response.data;
  } catch (err) {
    return { success: false, message: "비밀번호 인증 실패" };
  }
};

// 각 행의 prompt 10개씩 배치로 분석 요청
export const analyzePromptBatch = async (prompts) => {
  try {
    const response = await axios.post(`${API_URL}/analyzeBatch`, { prompts });
    return response.data;
  } catch (err) {
    console.error("배치 분석 실패:", err);
    return { success: false, data: [] };
  }
};
