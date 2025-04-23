import { useState } from "react";
import FileUpload from "./components/FileUpload";
import ReviewTable from "./components/ReviewTable";
import LoadingDots from "./components/LoadingDots";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [rawData, setRawData] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileProcessed = (results) => {
    setAnalysisResults(results);
    setIsLoading(false);
  };

  const handleRawDataLoaded = (processedRawData) => {
    setRawData(processedRawData);
    setAnalysisResults([]); // 분석 초기화
  };

  return (
    <div style={{ width: "90%", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", fontSize: "24px", marginBottom: "20px" }}>
        (주)인사바른 채용후기 분석기
      </h1>

      <FileUpload
        onFileProcessed={handleFileProcessed}
        onRawDataLoaded={handleRawDataLoaded}
        setIsLoading={setIsLoading}
      />

      {isLoading && <LoadingDots />}
      <ReviewTable rawData={rawData} analysisResults={analysisResults} isLoading={isLoading} />
    </div>
  );
}

export default App;
