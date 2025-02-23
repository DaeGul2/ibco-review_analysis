import pandas as pd
import json

# 파일 로드
file_path = "./가덕도_새만금_한국공항공사_전체후기_GPT.xlsx"  # 여기에 실제 파일 경로 입력
df = pd.read_excel(file_path)

# '단어' 컬럼 파싱
df['단어'] = df['단어'].apply(lambda x: json.loads(x.replace("'", '"')))

# 전체 단어별 카운트 계산
def total_word_counts(df):
    total_counts = pd.Series(dtype=int)
    for words in df['단어']:
        total_counts = total_counts.add(pd.Series(words), fill_value=0)
    return total_counts

# 면접 결과별 단어 카운트
def word_counts_by_column(df, column_name, filter_value):
    filtered_df = df[df[column_name] == filter_value]
    filtered_counts = pd.Series(dtype=int)
    for words in filtered_df['단어']:
        filtered_counts = filtered_counts.add(pd.Series(words), fill_value=0)
    return filtered_counts

# 전체, 불합격, 합격 단어 카운트
all_words = total_word_counts(df)
unsuccessful_words = word_counts_by_column(df, '면접 결과', '불합격')
successful_words = word_counts_by_column(df, '면접 결과', '합격')

# 면접 경험별 단어 카운트
normal_words = word_counts_by_column(df, '면접 경험', '보통')
positive_words = word_counts_by_column(df, '면접 경험', '긍정적')
negative_words = word_counts_by_column(df, '면접 경험', '부정적')

# 결과를 엑셀 파일로 저장
with pd.ExcelWriter('./통계결과.xlsx') as writer:  # 출력 파일 경로 설정
    all_words.to_excel(writer, sheet_name='전체 단어')
    unsuccessful_words.to_excel(writer, sheet_name='불합격 단어 카운트')
    successful_words.to_excel(writer, sheet_name='합격 단어 카운트')
    normal_words.to_excel(writer, sheet_name='보통 경험 단어 카운트')
    positive_words.to_excel(writer, sheet_name='긍정적 경험 단어 카운트')
    negative_words.to_excel(writer, sheet_name='부정적 경험 단어 카운트')
