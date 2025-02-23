import pandas as pd
from bs4 import BeautifulSoup

# ✅ 1️⃣ 엑셀 파일 불러오기
input_file = "html리스트.xlsx"  # 🔹 사용자가 입력한 엑셀 파일
output_file = "parsed_interviews.xlsx"  # 🔹 결과 저장 파일

# 🔹 엑셀의 두 번째 행부터 'html' 컬럼 읽기
df = pd.read_excel(input_file)
html_list = df["html"][1:]  # 두 번째 행부터

# 🔹 결과 저장할 리스트
parsed_data = []

# ✅ 2️⃣ HTML 파싱 및 데이터 추출
for idx, html in enumerate(html_list, start=1):
    soup = BeautifulSoup(html, "html.parser")

    try:
        # 🔹 모든 인터뷰 데이터를 담은 div 요소 찾기
        content_divs = soup.find_all('div', class_='content_body_ty1')

        if not content_divs:
            print(f"❌ {idx}번째 HTML: 면접 데이터 없음. 스킵")
            continue

        for div in content_divs:
            try:
                # 🔹 인터뷰 내용
                interview_text = div.find('div', class_='us_label_wrap').find('h2', class_='us_label').get_text(strip=True)
            except:
                interview_text = ''

            try:
                # 🔹 면접 질문, 답변, 채용 방식, 발표 시기
                tc_list = div.find('dl', class_='tc_list')
                dd_tags = tc_list.find_all('dd', class_='df1')
                interview_question = dd_tags[0].get_text(separator=" ", strip=True) if len(dd_tags) > 0 else ''
                interview_answer = dd_tags[1].get_text(separator=" ", strip=True) if len(dd_tags) > 1 else ''
                recruitment_method = dd_tags[2].get_text(separator=" ", strip=True) if len(dd_tags) > 2 else ''
                announcement_timing = dd_tags[3].get_text(separator=" ", strip=True) if len(dd_tags) > 3 else ''
            except:
                interview_question = interview_answer = recruitment_method = announcement_timing = ''

            try:
                # 🔹 면접 결과, 면접 경험
                now_box = div.find('div', class_='now_box')
                dl_now = now_box.find('dl')
                dd_now = dl_now.find_all('dd', class_='txt_img')
                interview_result = dd_now[0].get_text(strip=True) if len(dd_now) > 0 else ''
                interview_experience = dd_now[1].get_text(strip=True) if len(dd_now) > 1 else ''
            except:
                interview_result = interview_experience = ''

            # 🔹 결과 저장
            parsed_data.append([
                idx, interview_text, interview_question, interview_answer,
                recruitment_method, announcement_timing, interview_result, interview_experience
            ])

        print(f"✅ {idx}번째 HTML 파싱 완료. (추출된 인터뷰 수: {len(content_divs)})")

    except Exception as e:
        print(f"❌ {idx}번째 HTML 파싱 실패: {e}")

# ✅ 3️⃣ 엑셀로 저장
columns = ["번호", "인터뷰 내용", "면접 질문", "면접 답변", "채용 방식", "발표 시기", "면접 결과", "면접 경험"]
output_df = pd.DataFrame(parsed_data, columns=columns)
output_df.to_excel(output_file, index=False)

print(f"🚀 완료! 결과 저장: {output_file}")
