import LoadingDots from "./LoadingDots";

const ReviewTable = ({ reviews, isLoading }) => {
  const formatValue = (value) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return "-"; // null, undefined, 빈 배열 처리
    return Array.isArray(value) ? value.join(", ") : value; // 배열이면 join(), 문자열이면 그대로 출력
  };


  return (
    <div style={{ width: "100%", padding: "20px", overflowX: "auto" }}>
      {isLoading && <LoadingDots />}
      {!isLoading && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "center",
            fontSize: "14px",
            backgroundColor: "#f8f9fa",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#007bff", color: "white", height: "40px" }}>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>리뷰</th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>판단결과 (1~5)</th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>비고</th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>미래고객가능성</th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>기존고객</th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>장점</th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>단점</th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>요청</th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>비듬</th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>각질</th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>포장</th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>사용자</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((item, index) => (
              <tr key={index} style={{ height: "35px", backgroundColor: index % 2 === 0 ? "#ffffff" : "#f1f3f5" }}>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", textAlign: "left" }}>
                  {formatValue(item.리뷰).length > 100 ? `${formatValue(item.리뷰).slice(0, 100)}...` : formatValue(item.리뷰)}
                </td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", fontWeight: "bold", color: "#28a745" }}>
                  {formatValue(item.판단결과)}
                </td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px" }}>{formatValue(item.비고)}</td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", fontWeight: "bold", color: "#17a2b8" }}>
                  {formatValue(item.미래고객가능성)}
                </td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", fontWeight: "bold", color: item.기존고객 === 1 ? "#007bff" : "#dc3545" }}>
                  {formatValue(item.기존고객) == "1" ? "기존 고객" : "신규 고객"}
                </td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", textAlign: "left" }}>
                  {formatValue(item.장점)}
                </td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", textAlign: "left", color: "#dc3545" }}>
                  {formatValue(item.단점)}
                </td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", textAlign: "left", color: "#dc3545" }}>
                  {formatValue(item.요청)}
                </td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", fontWeight: "bold", color: item.비듬 === 1 ? "#007bff" : "#dc3545" }}>
                  {item.비듬 == 1 ? "1" : "0"}
                </td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", fontWeight: "bold", color: item.각질 === 1 ? "#007bff" : "#dc3545" }}>
                  {item.각질 == 1 ? "1" : "0"}
                </td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", fontWeight: "bold", color: item.포장 === 1 ? "#007bff" : "#dc3545" }}>
                  {item.포장 == 1 ? "1" : "0"}
                </td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", textAlign: "left", fontWeight: "bold", color: "#6c757d" }}>
                  {formatValue(item.사용자)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReviewTable;
