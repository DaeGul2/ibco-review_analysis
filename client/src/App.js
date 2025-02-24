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

  // ✅ 엑셀 다운로드 함수 (리뷰 데이터 + 통계 데이터 추가)
  const handleDownloadExcel = () => {
    if (reviews.length === 0) {
      alert("다운로드할 데이터가 없습니다.");
      return;
    }

    // ✅ 기존 리뷰 데이터 포맷
    const formattedData = reviews.map((review) => ({
      리뷰: review.리뷰,
      판단결과: review.판단결과,
      비고: review.비고 || "-",
      미래고객가능성: review.미래고객가능성,
      기존고객: review.기존고객 === 1 ? "기존 고객" : "신규 고객",
      장점: review.장점?.length ? review.장점.join(", ") : "-",
      단점: review.단점?.length ? review.단점.join(", ") : "-",
      요청: review.요청?.length ? review.요청.join(", ") : "-",
      비듬: review.비듬 === 1 ? "1" : "0",
      각질: review.각질 === 1 ? "1" : "0",
      포장: review.포장 === 1 ? "1" : "0",
      사용자: review.사용자?.length ? review.사용자.join(", ") : "-",
    }));

    // ✅ 통계를 저장할 객체 초기화
    const countOccurrences = (data, key) => {
      const counter = {};
      data.forEach((item) => {
        if (item[key] && item[key] !== "-") {
          const values = item[key].includes(",") ? item[key].split(",") : [item[key]];
          values.map((v) => v.trim()).forEach((v) => {
            counter[v] = (counter[v] || 0) + 1;
          });
        }
      });
      return Object.entries(counter).map(([name, count]) => ({ 항목: name, 개수: count }));
    };

    // ✅ 장점, 단점, 사용자 통계 계산
    const advantagesStats = countOccurrences(formattedData, "장점");
    const disadvantagesStats = countOccurrences(formattedData, "단점");
    const userStats = countOccurrences(formattedData, "사용자");

    // ✅ 엑셀 워크북 및 시트 생성
    const workbook = XLSX.utils.book_new();

    // ✅ 기존 리뷰 데이터 시트 추가
    const worksheetReviews = XLSX.utils.json_to_sheet(formattedData);
    XLSX.utils.book_append_sheet(workbook, worksheetReviews, "Reviews");

    // ✅ 장점_통계 시트 추가
    const worksheetAdvantages = XLSX.utils.json_to_sheet(advantagesStats);
    XLSX.utils.book_append_sheet(workbook, worksheetAdvantages, "장점_통계");

    // ✅ 단점_통계 시트 추가
    const worksheetDisadvantages = XLSX.utils.json_to_sheet(disadvantagesStats);
    XLSX.utils.book_append_sheet(workbook, worksheetDisadvantages, "단점_통계");

    // ✅ 사용자_통계 시트 추가
    const worksheetUsers = XLSX.utils.json_to_sheet(userStats);
    XLSX.utils.book_append_sheet(workbook, worksheetUsers, "사용자_통계");

    // ✅ 파일명에 날짜 추가 (예: review_analysis_2024-06-12.xlsx)
    const date = new Date().toISOString().split("T")[0];
    const fileName = `review_analysis_${date}.xlsx`;

    XLSX.writeFile(workbook, fileName);
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
