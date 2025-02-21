import { useState } from "react";
import { uploadFile } from "../api/reviewService";

const FileUpload = ({ onFileProcessed }) => {
  const [file, setFile] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [password, setPassword] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file || !keyword.trim() || !password.trim()) {
      alert("파일, 주제, 비밀번호를 입력하세요.");
      return;
    }

    const response = await uploadFile(file, keyword, password);
    if (response.success) {
      onFileProcessed(response.data);
    } else {
      alert("업로드 실패. 비밀번호를 확인하세요.");
    }
  };

  return (
    <div style={{ 
      width: "100%", 
      maxWidth: "600px", 
      margin: "20px auto", 
      padding: "20px", 
      border: "1px solid #dee2e6", 
      borderRadius: "10px", 
      backgroundColor: "#f8f9fa", 
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" 
    }}>
      <h2 style={{ 
        textAlign: "center", 
        marginBottom: "15px", 
        fontSize: "18px", 
        color: "#343a40" 
      }}>
        파일 업로드 및 리뷰 분석
      </h2>

      {/* 파일 업로드 필드 */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px", color: "#495057" }}>
          엑셀 파일 업로드
        </label>
        <input 
          type="file" 
          onChange={handleFileChange} 
          accept=".xlsx" 
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ced4da",
            borderRadius: "5px",
            backgroundColor: "#ffffff"
          }}
        />
      </div>

      {/* 특정 주제 입력 */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px", color: "#495057" }}>
          특정 주제 입력
        </label>
        <input 
          type="text" 
          placeholder="예: 제품 품질, 배송 만족도" 
          value={keyword} 
          onChange={(e) => setKeyword(e.target.value)} 
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ced4da",
            borderRadius: "5px",
            backgroundColor: "#ffffff"
          }}
        />
      </div>

      {/* 비밀번호 입력 */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px", color: "#495057" }}>
          비밀번호 입력
        </label>
        <input 
          type="password" 
          placeholder="비밀번호 입력" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ced4da",
            borderRadius: "5px",
            backgroundColor: "#ffffff"
          }}
        />
      </div>

      {/* 업로드 버튼 */}
      <button 
        onClick={handleUpload}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#007bff",
          color: "#ffffff",
          border: "none",
          borderRadius: "5px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "background-color 0.3s ease",
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
        onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
        onMouseDown={(e) => e.target.style.transform = "scale(0.98)"}
        onMouseUp={(e) => e.target.style.transform = "scale(1)"}
      >
        업로드 및 분석
      </button>
    </div>
  );
};

export default FileUpload;
