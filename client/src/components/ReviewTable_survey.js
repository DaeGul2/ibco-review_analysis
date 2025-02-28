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
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>칭찬</th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>불편함</th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>요청</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((item, index) => (
              <tr key={index} style={{ height: "35px", backgroundColor: index % 2 === 0 ? "#ffffff" : "#f1f3f5" }}>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", textAlign: "left" }}>
                  {formatValue(item.리뷰).length > 100 ? `${formatValue(item.리뷰).slice(0, 100)}...` : formatValue(item.리뷰)}
                </td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", textAlign: "left" }}>
                  {formatValue(item.칭찬)}
                </td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", textAlign: "left", color: "#dc3545" }}>
                  {formatValue(item.불편함)}
                </td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", textAlign: "left", color: "#dc3545" }}>
                  {formatValue(item.요청)}
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
