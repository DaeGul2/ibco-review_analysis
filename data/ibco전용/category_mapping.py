import pandas as pd

# 카테고리별 상품번호 목록
category_dict = {
    '키즈샴푸': [5247244400, 6799518159, 5247247354, 6148739377, 6804074215, 6720796762],
    '틴에이저샴푸': [5247080994, 6799566604, 5247239893, 6148756241, 6804423217, 6740420975],
    '바디워시': [7696972121, 7790444892, 8273205214, 7819829876, 8709322797, 8708714119, 7696792115],
    '바디로션': [7696902688, 7790441384, 8395480029],
    '페이셜폼': [6501472991, 6771886467],
    '선크림': [8827966745, 8872723753, 9085281427, 9133174909]
}

# 엑셀 파일 읽기
df = pd.read_excel('fianl_analysis_target_rawdata_working.xlsx')

# 상품번호를 기반으로 카테고리 매핑
def map_category(product_number):
    for category, numbers in category_dict.items():
        if product_number in numbers:
            return category
    return "카테고리 없음"  # 상품번호가 어떤 카테고리에도 속하지 않는 경우

# '카테고리' 열을 추가하고 상품번호에 따라 카테고리를 할당
df['카테고리'] = df['상품번호'].apply(map_category)

# 결과를 새로운 Excel 파일로 저장
df.to_excel('updated_final_analysis.xlsx', index=False)
