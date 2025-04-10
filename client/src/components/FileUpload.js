import { useState } from "react";
import * as XLSX from "xlsx";
import Select from "react-select";
import { Accordion, Button } from "react-bootstrap";
import { initPassword, analyzePromptBatch } from "../api/reviewService";
import "bootstrap/dist/css/bootstrap.min.css";

const FileUpload = ({ onFileProcessed }) => {
  // 기존 입력 상태 (keyword와 category는 UI에 남겨둠)
  const [file, setFile] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("");

  // 엑셀 및 컬럼 관련 상태
  const [excelData, setExcelData] = useState([]);
  const [columnOptions, setColumnOptions] = useState([]);
  const [mainColumn, setMainColumn] = useState("");
  const [refColumns, setRefColumns] = useState([]);

  // 분석 요청(ruleSet) 상태
  const [ruleSet, setRuleSet] = useState([]);

  // 엑셀 파일 파싱 (첫 시트 기준)
  const handleExcelRead = (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      setExcelData(json);
      if (json.length > 0) {
        const cols = Object.keys(json[0]);
        setColumnOptions(cols);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 파일 선택 시 처리
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      handleExcelRead(selectedFile);
    }
  };

  // 각 행별로 동일한 프롬프트 템플릿을 이용하여 프롬프트 생성(아래 프롬프트 그대로)
  const generatePrompt = (row) => {
    const mainValue = row[mainColumn] || "";
    let prompt = "너는 공공기관 면접 후기 데이터를 분석하는 AI야.\n\n";
    prompt += `● 분석대상 컬럼: "${mainColumn}"의 값은 "${mainValue}"\n`;
    if (refColumns && refColumns.length > 0) {
      prompt += "● 참고대상 컬럼:\n";
      refColumns.forEach((col) => {
        const refVal = row[col] || "";
        prompt += `   - ${col}: "${refVal}"\n`;
      });
    }
    prompt += "\n아래는 분석 요청(ruleSet) 항목들이다. 각 항목의 제목은 분석 결과에 반드시 포함되어야 한다.\n";
    ruleSet.forEach((rule, idx) => {
      prompt += `[${idx + 1}] 요청 주제: ${rule.key || "(제목 미입력)"}\n`;
      prompt += `    주제 설명: ${rule.description || "(설명 미입력)"}\n`;
      prompt += `    분석 방식: ${rule.type}\n`;
      if (rule.type === "카테고리화" && rule.categories && rule.categories.length > 0) {
        prompt += "    카테고리 목록(복수선택하여 배열로):\n";
        rule.categories.forEach(cat => {
          prompt += `      - ${cat.name}: ${cat.description}\n`;
        });
      }
      prompt += "\n";
    });
    prompt += "최종 응답은 아래 JSON 구조로 출력해줘:\n\n";
    prompt += `{
    "분석대상": "${mainValue}"`;
    if (refColumns && refColumns.length > 0) {
      prompt += `,
    "참고대상": {`;
      refColumns.forEach((col, idx) => {
        prompt += `\n    "${col}": "${row[col] || ""}"${idx < refColumns.length - 1 ? "," : ""}`;
      });
      prompt += "\n  },";
    }
    prompt += `
    "분석결과": {`;
    ruleSet.forEach((rule, idx) => {
      prompt += `\n    "${rule.key || "요청" + (idx + 1)}": "<분석 결과>"${idx < ruleSet.length - 1 ? "," : ""}`;
    });
    prompt += "\n  }\n}";
    
    return prompt;
  };
  
  // 프롬프트 미리보기 (첫 행 기준)
  const generatePromptPreview = () => {
    if (!excelData || excelData.length === 0 || !mainColumn) return "엑셀 데이터가 없습니다.";
    return generatePrompt(excelData[0]);
  };

  // 업로드 핸들러: 비밀번호 인증 후 각 행별 프롬프트를 10개씩 배치로 서버에 전송
  const handleUpload = async () => {
    if (!file || !password.trim() || !mainColumn || excelData.length === 0) {
      alert("파일, 비밀번호, 주 분석 대상 열 및 엑셀 데이터가 필요합니다.");
      return;
    }

    // 최초 비밀번호 인증
    const initResponse = await initPassword(password);
    if (!initResponse.success) {
      alert("비밀번호 인증 실패");
      return;
    }

    // 엑셀의 각 행별 프롬프트 생성
    const prompts = excelData.map((row) => generatePrompt(row));
    console.log(prompts)
    const results = [];
    const batchSize = 10;
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      const res = await analyzePromptBatch(batch); // analyzePromptBatch는 JSON 형식의 결과를 반환
      
      if (res.success && Array.isArray(res.data)) {
        results.push(...res.data);
      } else {
        console.warn("배치 분석 중 오류 발생");
      }
    }
    console.log("results : ", results)
    onFileProcessed(results);
  };

  // 룰셋 설정 관련 함수들
  const addRule = () => {
    setRuleSet([...ruleSet, { key: "", description: "", type: "자유 분석", categories: [] }]);
  };

  const updateRule = (index, updatedRule) => {
    const newRuleSet = ruleSet.map((r, idx) => (idx === index ? updatedRule : r));
    setRuleSet(newRuleSet);
  };

  const removeRule = (index) => {
    const newRuleSet = ruleSet.filter((_, idx) => idx !== index);
    setRuleSet(newRuleSet);
  };

  const addCategoryToRule = (ruleIndex) => {
    const rule = ruleSet[ruleIndex];
    const newCategories = rule.categories ? [...rule.categories, { name: "", description: "" }] : [{ name: "", description: "" }];
    updateRule(ruleIndex, { ...rule, categories: newCategories });
  };

  const updateCategoryInRule = (ruleIndex, catIndex, updatedCat) => {
    const rule = ruleSet[ruleIndex];
    const newCategories = rule.categories.map((cat, idx) => (idx === catIndex ? updatedCat : cat));
    updateRule(ruleIndex, { ...rule, categories: newCategories });
  };

  const removeCategoryFromRule = (ruleIndex, catIndex) => {
    const rule = ruleSet[ruleIndex];
    const newCategories = rule.categories.filter((_, idx) => idx !== catIndex);
    updateRule(ruleIndex, { ...rule, categories: newCategories });
  };

  // react-select 옵션 생성 및 스타일 개선: 컨트롤 및 메뉴 스타일에 minHeight 및 zIndex 속성 추가해서 글씨가 잘 보이도록 처리
  const selectOptions = columnOptions.map(col => ({ value: col, label: col }));

  return (
    <div style={{ 
      width: "100%", 
      maxWidth: "600px", 
      margin: "20px auto", 
      padding: "20px", 
      border: "1px solid #dee2e6", 
      borderRadius: "10px", 
      backgroundColor: "#f8f9fa", 
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" 
    }}>
      <h2 style={{ textAlign: "center", marginBottom: "15px", fontSize: "18px", color: "#343a40" }}>
        파일 업로드 및 리뷰 분석
      </h2>

      {/* 파일 업로드 */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px", color: "#495057" }}>
          엑셀 파일 업로드
        </label>
        <input 
          type="file" 
          onChange={handleFileChange} 
          accept=".xlsx" 
          style={{ width: "100%", padding: "8px", border: "1px solid #ced4da", borderRadius: "5px", backgroundColor: "#ffffff" }}
        />
      </div>

      {/* 엑셀 컬럼 선택 UI */}
      {selectOptions.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px", color: "#495057" }}>
              주 분석 대상 열
            </label>
            <Select
              options={selectOptions}
              value={selectOptions.find(option => option.value === mainColumn)}
              onChange={(selected) => setMainColumn(selected ? selected.value : "")}
              placeholder="주 분석 대상 열 선택"
              isClearable
              styles={{
                control: (base) => ({ ...base, minHeight: "38px" }),
                menu: (base) => ({ ...base, zIndex: 9999 })
              }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px", color: "#495057" }}>
              참고 열 (복수 선택 가능)
            </label>
            <Select
              options={selectOptions}
              value={selectOptions.filter(option => refColumns.includes(option.value))}
              onChange={(selectedOptions) => setRefColumns(selectedOptions ? selectedOptions.map(opt => opt.value) : [])}
              placeholder="참고 열 선택"
              isMulti
              styles={{
                control: (base) => ({ ...base, minHeight: "38px" }),
                menu: (base) => ({ ...base, zIndex: 9999 })
              }}
            />
          </div>
        </div>
      )}

      {/* 기존 입력 필드 */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px", color: "#495057" }}>
          비밀번호 입력
        </label>
        <input 
          type="password" 
          placeholder="비밀번호 입력" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={{ width: "100%", padding: "10px", border: "1px solid #ced4da", borderRadius: "5px", backgroundColor: "#ffffff" }}
        />
      </div>

      {/* 분석 요청(ruleSet) 설정 UI */}
      <div style={{ marginBottom: "20px", padding: "10px", border: "1px dashed #ced4da" }}>
        <h3 style={{ marginBottom: "10px", color: "#343a40" }}>분석 요청(ruleSet) 설정</h3>
        <Accordion defaultActiveKey="0">
          {ruleSet.map((rule, ruleIndex) => (
            <Accordion.Item eventKey={String(ruleIndex)} key={ruleIndex}>
              <Accordion.Header>{rule.key || "(제목 미입력)"}</Accordion.Header>
              <Accordion.Body>
                <div style={{ marginBottom: "5px" }}>
                  <label style={{ fontWeight: "bold" }}>요청 제목</label>
                  <input 
                    type="text" 
                    placeholder="예: 장점, 한줄요약 등" 
                    value={rule.key} 
                    onChange={(e) => updateRule(ruleIndex, { ...rule, key: e.target.value })}
                    style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                  />
                </div>
                <div style={{ marginBottom: "5px" }}>
                  <label style={{ fontWeight: "bold" }}>요청 설명</label>
                  <input 
                    type="text" 
                    placeholder="분석할 내용을 설명" 
                    value={rule.description} 
                    onChange={(e) => updateRule(ruleIndex, { ...rule, description: e.target.value })}
                    style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                  />
                </div>
                <div style={{ marginBottom: "5px" }}>
                  <label style={{ fontWeight: "bold" }}>분석 방식</label>
                  <Select
                    options={[
                      { value: "자유 분석", label: "자유 분석" },
                      { value: "요약 분석", label: "요약 분석" },
                      { value: "카테고리화", label: "카테고리화" }
                    ]}
                    value={{ value: rule.type, label: rule.type }}
                    onChange={(selected) => updateRule(ruleIndex, { ...rule, type: selected.value })}
                    placeholder="분석 방식 선택"
                    isClearable={false}
                    styles={{ container: (base) => ({ ...base, marginTop: "5px" }) }}
                  />
                </div>
                {rule.type === "카테고리화" && (
                  <div style={{ marginTop: "10px", padding: "10px", border: "1px dotted #aaa" }}>
                    <h4 style={{ marginBottom: "5px" }}>카테고리 설정</h4>
                    {rule.categories && rule.categories.map((cat, catIndex) => (
                      <div key={catIndex} style={{ marginBottom: "5px", display: "flex", alignItems: "center" }}>
                        <input 
                          type="text"
                          placeholder="카테고리 이름"
                          value={cat.name}
                          onChange={(e) => updateCategoryInRule(ruleIndex, catIndex, { ...cat, name: e.target.value })}
                          style={{ flex: "1", padding: "5px", marginRight: "5px" }}
                        />
                        <input 
                          type="text"
                          placeholder="설명"
                          value={cat.description}
                          onChange={(e) => updateCategoryInRule(ruleIndex, catIndex, { ...cat, description: e.target.value })}
                          style={{ flex: "1", padding: "5px", marginRight: "5px" }}
                        />
                        <Button variant="danger" size="sm" onClick={() => removeCategoryFromRule(ruleIndex, catIndex)}>
                          삭제
                        </Button>
                      </div>
                    ))}
                    <Button variant="secondary" size="sm" onClick={() => addCategoryToRule(ruleIndex)}>
                      카테고리 추가
                    </Button>
                  </div>
                )}
                <div style={{ marginTop: "10px" }}>
                  <Button variant="danger" size="sm" onClick={() => removeRule(ruleIndex)}>
                    룰 삭제
                  </Button>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
        <div style={{ marginTop: "10px" }}>
          <Button variant="success" onClick={addRule}>
            규칙 추가
          </Button>
        </div>
      </div>

      {/* 프롬프트 미리보기 */}
      <div style={{ marginBottom: "20px", padding: "10px", border: "1px dashed #ccc" }}>
        <h3 style={{ color: "#343a40" }}>프롬프트 미리보기 (첫 행 기준)</h3>
        <pre style={{ backgroundColor: "#f1f3f5", padding: "10px", overflowX: "auto" }}>
          {generatePromptPreview()}
        </pre>
      </div>

      {/* 업로드 및 분석 버튼 */}
      <button 
        onClick={handleUpload}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#007bff",
          color: "#ffffff",
          border: "none",
          borderRadius: "5px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "background-color 0.3s ease",
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
        onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
        onMouseDown={(e) => e.target.style.transform = "scale(0.98)"}
        onMouseUp={(e) => e.target.style.transform = "scale(1)"}
      >
        업로드 및 분석
      </button>
    </div>
  );
};

export default FileUpload;
