import pandas as pd

# 🔹 엑셀 파일 불러오기
input_file = "가덕도_새만금_한국공항공사_전체후기rawData.xlsx"  # 🔹 사용자가 입력한 엑셀 파일
output_file = "merged_output.xlsx"  # 🔹 결과 저장 파일

df = pd.read_excel(input_file)

# 🔹 합칠 열 리스트 (사용자가 원하는 열 이름 입력)
columns_to_merge = ["인터뷰 내용", "면접 질문", "면접 답변"]  # 필요한 열들 입력

# 🔹 각 행에서 특정 열의 텍스트를 합쳐서 새로운 열 '합친 내용' 생성
df["합친 내용"] = df[columns_to_merge].apply(lambda x: '\n'.join(x.dropna().astype(str)), axis=1)

# 🔹 엑셀 저장
df.to_excel(output_file, index=False)

print(f"🚀 완료! 결과 저장: {output_file}")
