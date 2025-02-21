import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;


export const uploadFile = async (file, keyword, password) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("keyword", keyword);
  formData.append("password", password);  // 비밀번호 함께 전송

  try {
    const response = await axios.post(`${API_URL}/upload`, formData);
    return response.data;
  } catch (error) {
    console.error("파일 업로드 오류:", error);
    return { success: false };
  }
};
