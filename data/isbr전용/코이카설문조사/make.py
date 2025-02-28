import os
import pandas as pd
from collections import Counter

# 폴더 경로 설정 (네가 원하는 경로로 변경)
folder_path = "./코이카_리뷰분석결과"
output_file = os.path.join(folder_path, "output.xlsx")

# 결과를 저장할 딕셔너리
sheet_data = {}

# 폴더 내 모든 .xlsx 파일 가져오기
for file in os.listdir(folder_path):
    if file.endswith(".xlsx") and file != "output.xlsx":  # output.xlsx 제외
        file_path = os.path.join(folder_path, file)
        sheet_name = os.path.splitext(file)[0]  # 확장자 제거한 파일명
        
        # 엑셀 파일 읽기
        df = pd.read_excel(file_path)
        
        if "불편함" not in df.columns:
            print(f"⚠️ {file} 파일에 '불편함' 컬럼이 없음. 스킵.")
            continue
        
        # '불편함' 컬럼 데이터 정제
        valid_values = []
        for value in df["불편함"].dropna():  # NaN 제거
            value = str(value).strip()
            if value in ["없음", "-", ""]:  # 제외할 값들
                continue
            valid_values.extend([v.strip() for v in value.split(",")])  # ','로 나누고 strip 적용
        
        # 카운트 집계
        count_data = Counter(valid_values)
        
        # DataFrame 변환
        result_df = pd.DataFrame(count_data.items(), columns=["내용", "개수"])
        sheet_data[sheet_name] = result_df

# 결과 엑셀 저장
with pd.ExcelWriter(output_file, engine="xlsxwriter") as writer:
    for sheet, data in sheet_data.items():
        data.to_excel(writer, sheet_name=sheet, index=False)

print(f"✅ 처리 완료! 결과 저장: {output_file}")
