import { useState } from "react";
import FileUpload from "./components/FileUpload";
import ReviewTable from "./components/ReviewTable";
import LoadingDots from "./components/LoadingDots";
import * as XLSX from "xlsx";

function App() {
  const [reviews, setReviews] = useState([]); // 분석된 리뷰 데이터
  const [isLoading, setIsLoading] = useState(false);

  // 리뷰 분석 결과를 업데이트하는 함수
  const handleFileProcessed = (data) => {
    setReviews(data);
    setIsLoading(false);
  };

  // 엑셀 다운로드 함수 (배열 필드 변환 추가)
  const handleDownloadExcel = () => {
    const formattedData = reviews.map((review) => ({
      리뷰: review.리뷰,
      칭찬: review.칭찬?.length > 0 ? review.칭찬.join(", ") : "-", // 배열을 문자열로 변환
      불편함: review.불편함?.length > 0 ? review.불편함.join(", ") : "-", // 배열을 문자열로 변환
      요청: review.요청?.length ? review.요청.join(", ") : "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reviews");
    XLSX.writeFile(workbook, "review_analysis.xlsx");
  };

  return (
    <div style={{ width: "90%", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", fontSize: "24px", marginBottom: "20px" }}>(주)인사바른 채용후기 분석기</h1>

      {/* 파일 업로드 및 입력 */}
      <FileUpload onFileProcessed={(data) => handleFileProcessed(data)} />

      {/* 로딩 애니메이션 */}
      {isLoading && <LoadingDots />}

      {/* 분석 결과 테이블 */}
      <ReviewTable reviews={reviews} isLoading={isLoading} />

      {/* 엑셀 다운로드 버튼 (결과가 있을 때만 활성화) */}
      {reviews.length > 0 && (
        <button
          onClick={handleDownloadExcel}
          style={{
            marginTop: "20px",
            padding: "10px 15px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          엑셀 다운로드
        </button>
      )}
    </div>
  );
}

export default App;
