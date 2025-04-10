import { useState } from "react";
import * as XLSX from "xlsx";
import LoadingDots from "./LoadingDots";

const ReviewTable = ({ reviews, isLoading }) => {
  const [fileTitle, setFileTitle] = useState("");

  // 각 리뷰의 "분석결과" 객체에서 모든 depth1 키를 모음
  let dynamicColumns = new Set();
  reviews.forEach(review => {
    if (review["분석결과"] && typeof review["분석결과"] === "object") {
      Object.keys(review["분석결과"]).forEach(key => dynamicColumns.add(key));
    }
  });
  dynamicColumns = Array.from(dynamicColumns);
  
  // 고정 헤더: "분석대상"과 동적 컬럼들
  const headers = ["분석대상", ...dynamicColumns];

  // 셀 값 포맷: 배열이면 '-'로 조인, 객체이면 JSON.stringify, 그 외 그대로
  const formatCell = (value) => {
    if (value === null || value === undefined) return "-";
    if (Array.isArray(value)) return value.join(" - ");
    if (typeof value === "object") return JSON.stringify(value);
    return value;
  };

  // 엑셀 다운로드 핸들러: 파일 제목은 fileTitle state에서 입력받은 값 사용
  const handleDownload = () => {
    if (!fileTitle.trim()) {
      alert("파일 제목을 입력해주세요.");
      return;
    }
    // 각 리뷰별로 테이블 행과 동일한 데이터를 객체 배열로 생성
    const data = reviews.map(review => {
      const row = {};
      row["분석대상"] = formatCell(review["분석대상"]);
      dynamicColumns.forEach(col => {
        row[col] = review["분석결과"] ? formatCell(review["분석결과"][col]) : "-";
      });
      return row;
    });
    // 워크시트, 워크북 생성 후 파일 저장
    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${fileTitle.trim()}.xlsx`);
  };

  return (
    <div style={{ width: "100%", padding: "20px", overflowX: "auto" }}>
      {isLoading && <LoadingDots />}
      {!isLoading && (
        <>
          {/* 파일 제목 입력과 엑셀 다운로드 버튼 */}
          <div style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
            <input
              type="text"
              placeholder="파일 제목 입력"
              value={fileTitle}
              onChange={(e) => setFileTitle(e.target.value)}
              style={{
                padding: "8px",
                flexGrow: 1,
                marginRight: "10px",
                border: "1px solid #ced4da",
                borderRadius: "4px"
              }}
            />
            <button 
              onClick={handleDownload}
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              엑셀 다운로드
            </button>
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "center",
              fontSize: "14px",
              backgroundColor: "#f8f9fa"
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#007bff", color: "white", height: "40px" }}>
                {headers.map((header, idx) => (
                  <th key={idx} style={{ border: "1px solid #dee2e6", padding: "10px" }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviews.map((review, index) => (
                <tr key={index} style={{ height: "35px", backgroundColor: index % 2 === 0 ? "#ffffff" : "#f1f3f5" }}>
                  <td style={{ border: "1px solid #dee2e6", padding: "10px", textAlign: "left" }}>
                    {formatCell(review["분석대상"])}
                  </td>
                  {dynamicColumns.map((col, idx) => {
                    const cellValue = review["분석결과"] ? review["분석결과"][col] : null;
                    return (
                      <td key={idx} style={{ border: "1px solid #dee2e6", padding: "10px", textAlign: "left" }}>
                        {formatCell(cellValue)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ReviewTable;
