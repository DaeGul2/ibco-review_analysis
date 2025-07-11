import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import FileUpload from "./components/FileUpload";
import ReviewTable from "./components/ReviewTable";
import LoadingDots from "./components/LoadingDots";
import TaskGeneratePage from "./components/TaskGeneratePage"; // 아까 만든 페이지
import DetailedAnalysisModal from "./components/DetailedAnalysisModal";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [rawData, setRawData] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const handleFileProcessed = (results) => {
    setAnalysisResults(results);
    setIsLoading(false);
  };

  const handleRawDataLoaded = (processedRawData) => {
    setRawData(processedRawData);
    setAnalysisResults([]); // 분석 초기화
  };

  return (
    <Router>
      <div style={{ width: "90%", margin: "0 auto", padding: "20px" }}>
        {/* ✅ Navbar 추가 */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4" style={{ borderRadius: "8px" }}>
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">인사바른</Link>
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link className="nav-link" to="/">채용후기 분석기</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/task">과제 생성기</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* ✅ 페이지 라우팅 */}
        <Routes>
          <Route path="/" element={
            <>
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
            </>
          } />
          <Route path="/task" element={<TaskGeneratePage />} />
        </Routes>
      </div>
      <button className="btn btn-secondary mb-3" onClick={() => setShowModal(true)}>
        결과 상세 분석
      </button>

      <DetailedAnalysisModal show={showModal} onClose={() => setShowModal(false)} />
    </Router>
  );
}

export default App;
