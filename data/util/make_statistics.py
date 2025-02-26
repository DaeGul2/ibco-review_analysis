import pandas as pd
import matplotlib.pyplot as plt
from openpyxl import Workbook
from openpyxl.chart import PieChart, Reference, BarChart
from openpyxl.chart.label import DataLabelList
from openpyxl.utils.dataframe import dataframe_to_rows

# 엑셀 파일 불러오기
df = pd.read_excel('input.xlsx')

# '장점'과 '단점' 컬럼의 데이터 정제
def clean_and_split(data):
    if pd.isna(data) or data.strip() in ['-', '없음', '모름']:
        return ['모르겠음']
    cleaned = [item.strip() for item in data.split(',') if item.strip() not in ['', '-']]
    return cleaned if cleaned else ['모르겠음']

df['장점'] = df['장점'].apply(clean_and_split)
df['단점'] = df['단점'].apply(clean_and_split)

# '모르겠음' 포함한 전체 통계 계산 (엑셀 저장용)
advantages = df['장점'].explode().reset_index(drop=True).value_counts().reset_index()
advantages.columns = ['항목', '빈도']
disadvantages = df['단점'].explode().reset_index(drop=True).value_counts().reset_index()
disadvantages.columns = ['항목', '빈도']

# '모르겠음' 제외한 데이터 (차트 및 그래프용)
advantages_filtered = advantages[advantages['항목'] != '모르겠음'].copy()
disadvantages_filtered = disadvantages[disadvantages['항목'] != '모르겠음'].copy()

# 새 워크북 생성
wb = Workbook()
ws1 = wb.active
ws1.title = "장점"
ws2 = wb.create_sheet(title="단점")


# 데이터를 시트에 기록 (모르겠음 포함)
for row in dataframe_to_rows(advantages, index=False, header=True):
    ws1.append(row)
for row in dataframe_to_rows(disadvantages, index=False, header=True):
    ws2.append(row)


# 엑셀 파일 저장
wb.save('한국승강기안전공단_통계.xlsx')

print("✅ 통계 및 차트 생성 완료!")