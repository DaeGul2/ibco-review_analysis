import pandas as pd

# Excel 파일 로드
file_A = '리뷰_rawdata_3500_가공.xlsx'
file_B = 'review_analysis_2025-02-24_3000개.xlsx'

# 각 파일의 시트를 읽어 DataFrame으로 변환
df_A = pd.read_excel(file_A, sheet_name='Sheet0')
df_B = pd.read_excel(file_B, sheet_name='Reviews')

# '공백제거' 열(E)과 B 파일의 '리뷰' 열(A)을 기준으로 조인
result = pd.merge(df_A, df_B, left_on='공백제거', right_on='리뷰')

# B 파일에서 A열부터 L열까지의 데이터를 A 파일의 해당하는 열(H부터 S까지)에 매핑
# A 파일의 H부터 시작하여 B 파일의 A열 데이터 매핑 설정
column_mapping = {
    '리뷰': 'H', '판단결과': 'I', '비고': 'J', '미래고객가능성': 'K',
    '기존고객': 'L', '장점': 'M', '단점': 'N', '요청': 'O', '비듬': 'P',
    '각질': 'Q', '포장': 'R', '사용자': 'S'
}
result = result.rename(columns=column_mapping)

# 결과를 새로운 Excel 파일로 저장
result.to_excel('updated_review_data.xlsx', index=False)
