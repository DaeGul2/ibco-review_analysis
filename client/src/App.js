// App.js
import { useState } from "react";
import FileUpload from "./components/FileUpload";
import ReviewTable from "./components/ReviewTable";
import LoadingDots from "./components/LoadingDots";
import * as XLSX from "xlsx";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [reviews, setReviews] = useState([]); // GPT 분석 응답 결과 (각 행별 분석)
  const [isLoading, setIsLoading] = useState(false);

  // 분석 결과를 업데이트하는 함수
  const handleFileProcessed = (data) => {
    setReviews(data);
    setIsLoading(false);
  };

  return (
    <div style={{ width: "90%", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", fontSize: "24px", marginBottom: "20px" }}>
        (주)인사바른 채용후기 분석기
      </h1>
      {/* 파일 업로드 및 분석 설정 */}
      <FileUpload onFileProcessed={(data) => handleFileProcessed(data)} setIsLoading={setIsLoading} />

      {/* 로딩 애니메이션 */}
      {isLoading && <LoadingDots />}

      {/* 분석 결과 테이블 */}
      <ReviewTable reviews={reviews} isLoading={isLoading} />
    </div>
  );
}

export default App;
