import * as XLSX from "xlsx";
import LoadingDots from "./LoadingDots";

const ReviewTable = ({ rawData, analysisResults, isLoading }) => {
  let resultKeys = new Set();
  analysisResults.forEach(res => {
    if (res["분석결과"]) {
      Object.keys(res["분석결과"]).forEach(k => resultKeys.add(k));
    }
  });
  resultKeys = Array.from(resultKeys);
  const headers = ["연번", "분석대상", "참고정보", ...resultKeys];

  const formatCell = (val) => {
    if (val === null || val === undefined) return "-";
    if (Array.isArray(val)) return val.join(", ");
    if (typeof val === "object") return JSON.stringify(val);
    return val;
  };

  const mergedRows = rawData.map((row, idx) => {
    const result = analysisResults[idx]?.["분석결과"] || {};
    return {
      __index: row.__index,
      __mainCol__: row.__mainCol__,
      __ref__: row.__ref__,
      ...result
    };
  });

  const handleDownload = () => {
    const dataToDownload = mergedRows.map(row => {
      const rowObj = {
        연번: row.__index,
        분석대상: row.__mainCol__,
        참고정보: row.__ref__
      };
      resultKeys.forEach(key => {
        rowObj[key] = formatCell(row[key]);
      });
      return rowObj;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToDownload, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `분석결과_${new Date().toISOString()}.xlsx`);
  };

  return (
    <div style={{ width: "100%", padding: "20px", overflowX: "auto" }}>
      {isLoading && <LoadingDots />}
      {!isLoading && rawData.length > 0 && (
        <>
          <div style={{ marginBottom: "10px" }}>
            <button onClick={handleDownload} style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              엑셀 다운로드
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", backgroundColor: "#f8f9fa" }}>
            <thead>
              <tr style={{ backgroundColor: "#007bff", color: "white", height: "40px" }}>
                {headers.map((header, idx) => (
                  <th key={idx} style={{ border: "1px solid #dee2e6", padding: "10px" }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mergedRows.map((row, rowIdx) => (
                <tr key={rowIdx} style={{ height: "35px", backgroundColor: rowIdx % 2 === 0 ? "#ffffff" : "#f1f3f5" }}>
                  <td style={{ border: "1px solid #dee2e6", padding: "8px" }}>{row.__index}</td>
                  <td style={{ border: "1px solid #dee2e6", padding: "8px", textAlign: "left" }}>{formatCell(row.__mainCol__)}</td>
                  <td style={{ border: "1px solid #dee2e6", padding: "8px", textAlign: "left" }}>{formatCell(row.__ref__)}</td>
                  {resultKeys.map((key, colIdx) => (
                    <td key={colIdx} style={{ border: "1px solid #dee2e6", padding: "8px", textAlign: "left" }}>
                      {formatCell(row[key])}
                    </td>
                  ))}
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
