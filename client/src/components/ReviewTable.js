import LoadingDots from "./LoadingDots";

const ReviewTable = ({ reviews, isLoading }) => {
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
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>미래고객 가능성</th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>기존고객</th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>장점</th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>단점</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((item, index) => (
              <tr key={index} style={{ height: "35px", backgroundColor: index % 2 === 0 ? "#ffffff" : "#f1f3f5" }}>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", textAlign: "left" }}>
                  {item.리뷰.length > 100 ? `${item.리뷰.slice(0, 100)}...` : item.리뷰}
                </td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", fontWeight: "bold", color: "#28a745" }}>
                  {item.판단결과}
                </td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px" }}>{item.비고 || "-"}</td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", fontWeight: "bold", color: "#17a2b8" }}>
                  {item.미래고객가능성}
                </td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", fontWeight: "bold", color: item.기존고객 === 1 ? "#007bff" : "#dc3545" }}>
                  {item.기존고객 === 1 ? "기존 고객" : "신규 고객"}
                </td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", textAlign: "left" }}>
                  {item.장점?.length > 0 ? item.장점.join(", ") : "-"}
                </td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px", textAlign: "left", color: "#dc3545" }}>
                  {item.단점?.length > 0 ? item.단점.join(", ") : "-"}
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
