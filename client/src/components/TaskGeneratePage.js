// src/pages/TaskGeneratePage.js
import { useState } from "react";
import { generateTask, generateStep2Task, reviseStep2Task } from "../api/taskService"; // ✅ Step2 API + Revise API 추가

const TaskGeneratePage = () => {
  const [inputs, setInputs] = useState({
    role: "",
    competency: "",
    condition: "",
    additional: ""
  });
  const [step2Inputs, setStep2Inputs] = useState({
    task_topic: "",
    role: "",
    situation: "",
    competency: "",
    sub_competencies: "", // 콤마로 구분해서 입력
    mission: "",
    time_briefing: "",
    time_performance: ""
  });
  const [results, setResults] = useState([]);           // Step1 결과
  const [step2Result, setStep2Result] = useState(null); // Step2 결과
  const [selectedForRevision, setSelectedForRevision] = useState([]); // Revise 대상 선택
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleStep2Change = (e) => {
    const { name, value } = e.target;
    setStep2Inputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await generateTask(inputs);
      if (response.success) {
        let data = response.data;
        if (!Array.isArray(data)) {
          data = [data];
        }
        setResults(data);
      } else {
        alert("과제 생성 실패");
      }
    } catch (err) {
      alert("에러 발생!");
      console.error(err);
    }
    setLoading(false);
  };

  const handleStep2Submit = async () => {
    setLoading(true);
    try {
      const prepared = {
        ...step2Inputs,
        sub_competencies: step2Inputs.sub_competencies
          .split(",")
          .map(s => s.trim())
      };
      const response = await generateStep2Task(prepared);
      if (response.success) {
        setStep2Result(response.data);
      } else {
        alert("Step2 과제 생성 실패");
      }
    } catch (err) {
      alert("에러 발생!");
      console.error(err);
    }
    setLoading(false);
  };

  const toggleSelectForRevision = (competency) => {
    setSelectedForRevision(prev =>
      prev.includes(competency)
        ? prev.filter(c => c !== competency)
        : [...prev, competency]
    );
  };

  const handleReviseSelected = async () => {
    if (!step2Result || selectedForRevision.length === 0) {
      alert("수정할 항목을 선택하세요.");
      return;
    }
    setLoading(true);
    try {
      const response = await reviseStep2Task({
        originalResult: step2Result,
        reviseTargets: selectedForRevision
      });
      if (response.success) {
        setStep2Result(response.data);
        setSelectedForRevision([]);
      } else {
        alert("수정 실패");
      }
    } catch (err) {
      alert("에러 발생!");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "30px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>과제 자동 생성기</h2>

      {/* Step1 입력 */}
      <section style={{ marginBottom: "50px" }}>
        <h4>Step1 - 기본 과제 생성</h4>
        <div className="mb-3">
          <label>직무 및 역할</label>
          <input type="text" name="role" value={inputs.role} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label>평가할 역량</label>
          <input type="text" name="competency" value={inputs.competency} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label>과제 조건</label>
          <input type="text" name="condition" value={inputs.condition} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label>부가 요구사항</label>
          <input type="text" name="additional" value={inputs.additional} onChange={handleChange} className="form-control" />
        </div>
        <button onClick={handleSubmit} className="btn btn-primary w-100 mb-5" disabled={loading}>
          {loading ? "생성 중..." : "Step1 생성 요청"}
        </button>
        {results.length > 0 && (
          <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "10px" }}>
            <h5>Step1 결과</h5>
            {results.map((item, idx) => (
              <div key={idx} style={{ marginBottom: "30px", paddingBottom: "20px", borderBottom: "1px solid #dee2e6" }}>
                <h6 style={{ marginBottom: "15px" }}>세트 {idx + 1}</h6>
                {Object.entries(item).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: "8px" }}>
                    <strong>{key}:</strong> {value}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Step2 입력 */}
      <section style={{ marginBottom: "30px" }}>
        <h4>Step2 - 세부 스토리/포인트/BARS 생성</h4>
        <div className="mb-3">
          <label>과제 주제</label>
          <input type="text" name="task_topic" value={step2Inputs.task_topic} onChange={handleStep2Change} className="form-control" />
        </div>
        <div className="mb-3">
          <label>역할</label>
          <input type="text" name="role" value={step2Inputs.role} onChange={handleStep2Change} className="form-control" />
        </div>
        <div className="mb-3">
          <label>상황</label>
          <input type="text" name="situation" value={step2Inputs.situation} onChange={handleStep2Change} className="form-control" />
        </div>
        <div className="mb-3">
          <label>측정역량 (대분류)</label>
          <input type="text" name="competency" value={step2Inputs.competency} onChange={handleStep2Change} className="form-control" />
        </div>
        <div className="mb-3">
          <label>세부역량 (콤마로 구분)</label>
          <input type="text" name="sub_competencies" value={step2Inputs.sub_competencies} onChange={handleStep2Change} className="form-control" />
        </div>
        <div className="mb-3">
          <label>해결과제</label>
          <input type="text" name="mission" value={step2Inputs.mission} onChange={handleStep2Change} className="form-control" />
        </div>
        <div className="mb-3">
          <label>과제숙지 시간</label>
          <input type="text" name="time_briefing" value={step2Inputs.time_briefing} onChange={handleStep2Change} className="form-control" />
        </div>
        <div className="mb-3">
          <label>역할수행 시간</label>
          <input type="text" name="time_performance" value={step2Inputs.time_performance} onChange={handleStep2Change} className="form-control" />
        </div>
        <button onClick={handleStep2Submit} className="btn btn-success w-100" disabled={loading}>
          {loading ? "생성 중..." : "Step2 생성 요청"}
        </button>
      </section>

      {/* Step2 결과 & Revision */}
      {step2Result && (
        <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "10px" }}>
          <h5>Step2 결과</h5>
          {Object.entries(step2Result).map(([competency, detail], idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "20px",
                padding: "20px",
                backgroundColor: "white",
                border: "1px solid #dee2e6",
                borderRadius: "8px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h6>{competency}</h6>
                <input
                  type="checkbox"
                  checked={selectedForRevision.includes(competency)}
                  onChange={() => toggleSelectForRevision(competency)}
                />
              </div>
              <div><strong>Story:</strong> {detail.story}</div>
              <div><strong>Point:</strong> {detail.point}</div>
              <div><strong>고성과자:</strong> {detail.bars?.고성과자}</div>
              <div><strong>저성과자:</strong> {detail.bars?.저성과자}</div>
            </div>
          ))}
          <button
            onClick={handleReviseSelected}
            className="btn btn-danger w-100"
            disabled={loading}
          >
            {loading ? "수정 중..." : "선택한 항목 수정 요청"}
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskGeneratePage;
