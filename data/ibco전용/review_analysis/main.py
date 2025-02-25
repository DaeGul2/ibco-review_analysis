import pandas as pd

# 파일 로드
df = pd.read_excel('fianl_analysis_target_rawdata_working.xlsx')

# '-' 값을 '모르겠음'으로 치환
df['사용자'] = df['사용자'].replace('-', '모르겠음')

# 공백 및 개행 제거 함수
def clean_text(x):
    if isinstance(x, str):
        return x.strip().replace('\n', '').replace('\r', '').replace(' ', '')
    return x

# '장점', '단점', '사용자' 컬럼에 clean_text 함수 적용 후 ','로 파싱
df['장점'] = df['장점'].apply(lambda x: clean_text(x).split(',') if x != '-' else [])
df['단점'] = df['단점'].apply(lambda x: clean_text(x).split(',') if x != '-' else [])
df['사용자'] = df['사용자'].apply(lambda x: clean_text(x).split(',') if x != '-' else [])

# 각 데이터의 전체 카운트
advantages_count = df.explode('장점')['장점'].value_counts().reset_index()
advantages_count.columns = ['장점', '횟수']
disadvantages_count = df.explode('단점')['단점'].value_counts().reset_index()
disadvantages_count.columns = ['단점', '횟수']
users_count = df.explode('사용자')['사용자'].value_counts().reset_index()
users_count.columns = ['사용자', '횟수']

# 카테고리별 장점, 단점, 사용자 카운트
category_advantages_count = df.explode('장점').groupby('카테고리')['장점'].value_counts().unstack(fill_value=0)
category_disadvantages_count = df.explode('단점').groupby('카테고리')['단점'].value_counts().unstack(fill_value=0)
category_users_count = df.explode('사용자').groupby('카테고리')['사용자'].value_counts().unstack(fill_value=0)

# 엑셀 파일로 결과 저장
with pd.ExcelWriter('analysis_results.xlsx', engine='openpyxl') as writer:
    advantages_count.to_excel(writer, sheet_name='전체_장점_카운트', index=False)
    disadvantages_count.to_excel(writer, sheet_name='전체_단점_카운트', index=False)
    users_count.to_excel(writer, sheet_name='전체_사용자_카운트', index=False)
    category_advantages_count.to_excel(writer, sheet_name='카테고리별_장점_카운트')
    category_disadvantages_count.to_excel(writer, sheet_name='카테고리별_단점_카운트')
    category_users_count.to_excel(writer, sheet_name='카테고리별_사용자_카운트')
