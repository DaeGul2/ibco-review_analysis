import { useState } from "react";
import * as XLSX from "xlsx";
import Select from "react-select";
import { Accordion, Button } from "react-bootstrap";
import { initPassword, analyzePromptBatch } from "../api/reviewService";
import "bootstrap/dist/css/bootstrap.min.css";

const FileUpload = ({ onFileProcessed, onRawDataLoaded, setIsLoading }) => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [excelData, setExcelData] = useState([]);
  const [columnOptions, setColumnOptions] = useState([]);
  const [mainColumn, setMainColumn] = useState("");
  const [refColumns, setRefColumns] = useState([]);
  const [ruleSet, setRuleSet] = useState([]);

  const handleExcelRead = (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      const indexed = json.map((row, idx) => ({ ...row, __index: idx + 1 }));
      setExcelData(indexed);
      setColumnOptions(Object.keys(json[0] || {}));
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) handleExcelRead(selectedFile);
  };

  const generatePrompt = (row) => {
    const mainValue = row[mainColumn] || "";
    let prompt = "너는 공공기관 면접 후기 데이터를 분석하는 AI야.\n\n";
    prompt += `● 분석대상 텍스트 : "${mainValue}"\n`;
  
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
        prompt += "    카테고리 목록(아래 속성 중 복수선택하여 오직 배열로만):\n";
        rule.categories.forEach(cat => {
          prompt += `      - ${cat.name}: ${cat.description || ""}\n`;
        });
      }
    });
  
    prompt += "\n각 분석 요청 방식에 따라, key-value에 맞춰 줄글이면 줄글로, 카테고리면 배열로 응답해줘.\n";
    prompt += "기타 설명이나 텍스트는 생략하고, 반드시 아래 형식의 JSON으로만 출력해줘.\n\n";
  
    prompt += "{\n";
    if (refColumns && refColumns.length > 0) {
      prompt += `  "참고대상": {\n`;
      refColumns.forEach((col, idx) => {
        prompt += `    "${col}": "${row[col] || ""}"${idx < refColumns.length - 1 ? "," : ""}\n`;
      });
      prompt += `  },\n`;
    }
  
    prompt += `  "분석결과": {\n`;
    ruleSet.forEach((rule, idx) => {
      const isLast = idx === ruleSet.length - 1;
      if (rule.type === "카테고리화" && rule.categories && rule.categories.length > 0) {
        const categoryNames = rule.categories.map(cat => `"${cat.name}"`);
        prompt += `    "${rule.key || "요청" + (idx + 1)}": [${categoryNames.join(", ")}]${isLast ? "" : ","}\n`;
      } else {
        prompt += `    "${rule.key || "요청" + (idx + 1)}": "내용"${isLast ? "" : ","}\n`;
      }
    });
    prompt += "  }\n}";
    
    return prompt;
  };
  const generatePromptPreview = () => {
    if (!excelData.length || !mainColumn) return "엑셀 데이터가 없습니다.";
    return generatePrompt(excelData[0]);
  };

  const handleUpload = async () => {
    if (!file || !password.trim() || !mainColumn || !excelData.length) {
      alert("파일, 비밀번호, 주 분석 열이 필요합니다.");
      return;
    }

    const enriched = excelData.map((row) => ({
      ...row,
      __mainCol__: row[mainColumn] || "",
      __ref__: refColumns.map(col => `${col}: ${row[col] || ""}`).join(", ")
    }));

    onRawDataLoaded(enriched);
    setIsLoading(true);

    const initResponse = await initPassword(password);
    if (!initResponse.success) {
      alert("비밀번호 인증 실패");
      setIsLoading(false);
      return;
    }

    const prompts = enriched.map(generatePrompt);
    const results = [];
    const batchSize = 10;

    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      const res = await analyzePromptBatch(batch);
      if (res.success && Array.isArray(res.data)) results.push(...res.data);
    }

    onFileProcessed(results);
  };

  const addRule = () => {
    setRuleSet([...ruleSet, { key: "", description: "", type: "자유 분석", categories: [] }]);
  };

  const updateRule = (index, updatedRule) => {
    const newSet = ruleSet.map((r, i) => (i === index ? updatedRule : r));
    setRuleSet(newSet);
  };

  const removeRule = (index) => {
    setRuleSet(ruleSet.filter((_, i) => i !== index));
  };

  const addCategoryToRule = (ruleIndex) => {
    const rule = ruleSet[ruleIndex];
    const newCats = [...(rule.categories || []), { name: "", description: "" }];
    updateRule(ruleIndex, { ...rule, categories: newCats });
  };

  const updateCategoryInRule = (ruleIndex, catIndex, cat) => {
    const newCats = [...ruleSet[ruleIndex].categories];
    newCats[catIndex] = cat;
    updateRule(ruleIndex, { ...ruleSet[ruleIndex], categories: newCats });
  };

  const removeCategoryFromRule = (ruleIndex, catIndex) => {
    const newCats = ruleSet[ruleIndex].categories.filter((_, i) => i !== catIndex);
    updateRule(ruleIndex, { ...ruleSet[ruleIndex], categories: newCats });
  };

  const selectOptions = columnOptions.map(col => ({ value: col, label: col }));

  return (
    <div style={{ maxWidth: "700px", margin: "20px auto", padding: "20px", backgroundColor: "#f8f9fa", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h3 style={{ textAlign: "center" }}>파일 업로드 및 분석 설정</h3>

      <input type="file" onChange={handleFileChange} accept=".xlsx" className="form-control mb-3" />

      {selectOptions.length > 0 && (
        <>
          <label>주 분석 대상 열</label>
          <Select
            options={selectOptions}
            value={selectOptions.find(opt => opt.value === mainColumn)}
            onChange={opt => setMainColumn(opt?.value || "")}
            className="mb-3"
          />

          <label>참고 열</label>
          <Select
            options={selectOptions}
            value={selectOptions.filter(opt => refColumns.includes(opt.value))}
            onChange={(opts) => setRefColumns(opts ? opts.map(opt => opt.value) : [])}
            isMulti
            className="mb-3"
          />
        </>
      )}

      <label>비밀번호</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="form-control mb-3"
      />

      <div style={{ marginBottom: "20px", padding: "10px", border: "1px dashed #ced4da" }}>
        <h5>분석 요청 설정 (RuleSet)</h5>
        <Accordion defaultActiveKey="0">
          {ruleSet.map((rule, ruleIndex) => (
            <Accordion.Item eventKey={String(ruleIndex)} key={ruleIndex}>
              <Accordion.Header>{rule.key || "(제목 미입력)"}</Accordion.Header>
              <Accordion.Body>
                <input
                  type="text"
                  placeholder="요청 제목"
                  value={rule.key}
                  onChange={(e) => updateRule(ruleIndex, { ...rule, key: e.target.value })}
                  className="form-control mb-2"
                />
                <input
                  type="text"
                  placeholder="요청 설명"
                  value={rule.description}
                  onChange={(e) => updateRule(ruleIndex, { ...rule, description: e.target.value })}
                  className="form-control mb-2"
                />
                <Select
                  options={[
                    { value: "자유 분석", label: "자유 분석" },
                    { value: "요약 분석", label: "요약 분석" },
                    { value: "카테고리화", label: "카테고리화" },
                  ]}
                  value={{ value: rule.type, label: rule.type }}
                  onChange={(opt) => updateRule(ruleIndex, { ...rule, type: opt.value })}
                  className="mb-3"
                />
                {rule.type === "카테고리화" && (
                  <>
                    {rule.categories?.map((cat, catIdx) => (
                      <div key={catIdx} className="d-flex gap-2 mb-2">
                        <input
                          type="text"
                          value={cat.name}
                          placeholder="카테고리명"
                          onChange={(e) =>
                            updateCategoryInRule(ruleIndex, catIdx, { ...cat, name: e.target.value })
                          }
                          className="form-control"
                        />
                        <input
                          type="text"
                          value={cat.description}
                          placeholder="설명"
                          onChange={(e) =>
                            updateCategoryInRule(ruleIndex, catIdx, { ...cat, description: e.target.value })
                          }
                          className="form-control"
                        />
                        <Button variant="danger" size="sm" onClick={() => removeCategoryFromRule(ruleIndex, catIdx)}>
                          삭제
                        </Button>
                      </div>
                    ))}
                    <Button size="sm" onClick={() => addCategoryToRule(ruleIndex)}>카테고리 추가</Button>
                  </>
                )}
                <div className="mt-2">
                  <Button variant="danger" size="sm" onClick={() => removeRule(ruleIndex)}>룰 삭제</Button>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
        <div className="mt-2">
          <Button onClick={addRule}>규칙 추가</Button>
        </div>
      </div>

      <div className="mb-3">
        <h6>프롬프트 미리보기 (1행 기준)</h6>
        <pre style={{ backgroundColor: "#f1f3f5", padding: "10px", fontSize: "12px", overflowX: "auto" }}>
          {generatePromptPreview()}
        </pre>
      </div>

      <Button onClick={handleUpload} style={{ width: "100%" }}>
        업로드 및 분석
      </Button>
    </div>
  );
};

export default FileUpload;
