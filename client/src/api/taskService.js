// src/api/taskService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// ✅ Step1: 과제 생성 요청
export const generateTask = async (inputData) => {
  try {
    const response = await axios.post(`${API_URL}/task/generate`, inputData);
    return response.data;
  } catch (error) {
    console.error("과제 생성 실패:", error);
    return { success: false, data: null };
  }
};

// ✅ Step2: 세부 스토리/포인트/BARS 생성 요청
export const generateStep2Task = async (inputData) => {
  try {
    const response = await axios.post(`${API_URL}/task/generateStep2`, inputData);
    return response.data;
  } catch (error) {
    console.error("Step2 과제 생성 실패:", error);
    return { success: false, data: null };
  }
};
