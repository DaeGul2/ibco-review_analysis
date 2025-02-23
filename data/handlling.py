import pandas as pd

# Excel 파일 읽기
df = pd.read_excel('youtube_review_output.xlsx')

# 'review' 컬럼에서 30글자 미만인 행 제외
filtered_df = df[df['review'].apply(lambda x: len(str(x)) >= 30)]

# 결과 저장
filtered_df.to_excel('filtered_output.xlsx', index=False)

print("Filtered reviews saved to 'filtered_output.xlsx'.")
