// components/DetailedAnalysisModal.js
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import * as XLSX from "xlsx";

function DetailedAnalysisModal({ show, onClose }) {
  const [columns, setColumns] = useState([]);
  const [selectedColIndex, setSelectedColIndex] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [frequencyMap, setFrequencyMap] = useState({});
  const [rawColumnData, setRawColumnData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const firstColumn = json.slice(1).map(row => row[0] ?? "");
      setRawColumnData(json);
      setColumns(firstColumn);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAnalyze = () => {
    const selectedIndex = parseInt(selectedColIndex, 10);
    if (isNaN(selectedIndex) || !delimiter) return;

    const values = rawColumnData.slice(1)
      .map(row => row[selectedIndex])
      .filter(Boolean);

    const keywords = values.flatMap(cell =>
      String(cell).split(delimiter).map(s => s.trim()).filter(Boolean)
    );

    const counts = keywords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
    setFrequencyMap(counts);
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>결과 상세 분석</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>엑셀 업로드</Form.Label>
          <Form.Control type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        </Form.Group>

        {columns.length > 0 && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>분석할 열 선택</Form.Label>
              <Form.Select onChange={(e) => setSelectedColIndex(e.target.value)}>
                {rawColumnData[0].map((colName, i) => (
                  <option key={i} value={i}>{colName || `열 ${i + 1}`}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>파싱 기준 문자 (예: ',', ';', '/')</Form.Label>
              <Form.Control value={delimiter} onChange={(e) => setDelimiter(e.target.value)} />
            </Form.Group>
            <Button variant="primary" onClick={handleAnalyze}>통계 분석</Button>
          </>
        )}

        {Object.keys(frequencyMap).length > 0 && (
          <div className="mt-4">
            <h5>키워드 통계</h5>
            <ul>
              {Object.entries(frequencyMap)
                .sort((a, b) => b[1] - a[1])
                .map(([key, count], idx) => (
                  <li key={idx}>{key} - {count}회</li>
                ))}
            </ul>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default DetailedAnalysisModal;
