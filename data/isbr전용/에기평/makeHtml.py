import pandas as pd
from bs4 import BeautifulSoup

# 파일명 설정
input_file = "html_list.xlsx"  # HTML이 저장된 엑셀 파일
output_file = "에기평_후기_rawdata.xlsx"  # 추출된 면접 후기 저장 파일

# 엑셀 파일에서 HTML 데이터 읽기
df_input = pd.read_excel(input_file, sheet_name=0)

# 결과 리스트
reviews = []

# HTML 파싱 및 데이터 추출
for index, row in df_input.iterrows():
    html_content = row["html"]  # HTML 컬럼에서 데이터 가져오기
    if not isinstance(html_content, str) or not html_content.strip():
        continue  # 빈 행이면 건너뜀

    soup = BeautifulSoup(html_content, "html.parser")

    # 후기 관련 태그 찾기
    for section in soup.find_all("section", class_="content_ty4"):
        # 직종 & 직급 추출
        txt1_span = section.find("span", class_="txt1")
        if txt1_span:
            job_info = [x.strip() for x in txt1_span.text.split("/") if x.strip()]
            직종 = job_info[0] if len(job_info) > 0 else "N/A"
            직급 = job_info[1] if len(job_info) > 1 else "N/A"
        else:
            직종, 직급 = "N/A", "N/A"

        # 면접일자
        txt2_span = section.find("span", class_="txt2")
        면접일 = txt2_span.get_text(strip=True) if txt2_span else "N/A"

        # 면접 난이도
        난이도 = "N/A"
        difficulty = section.find("span", class_="blo_txt2")
        if difficulty:
            난이도 = difficulty.get_text(strip=True)

        # 면접 경로
        면접경로 = "N/A"
        path = section.find("dd", class_="txt2")
        if path:
            면접경로 = path.get_text(strip=True)

        # 면접 질문
        면접질문 = []
        question_section = section.find("dt", string="면접질문")
        if question_section:
            questions = question_section.find_next_sibling("dd")
            if questions:
                면접질문 = [q.strip() for q in questions.get_text(strip=True).split("\n") if q.strip()]

        # 면접 답변
        면접답변 = "N/A"
        answer_section = section.find("dt", string=["면접답변", "면접답변 혹은 면접느낌"])
        if answer_section:
            answer = answer_section.find_next_sibling("dd")
            if answer:
                면접답변 = answer.get_text(strip=True)

        # 면접 결과
        면접결과 = "N/A"
        result_section = section.find("dt", string="면접결과")
        if result_section:
            result = result_section.find_next_sibling("dd")
            if result:
                면접결과 = result.get_text(strip=True)

        # 면접 경험
        면접경험 = "N/A"
        experience_section = section.find("dt", string="면접경험")
        if experience_section:
            experience = experience_section.find_next_sibling("dd")
            if experience:
                면접경험 = experience.get_text(strip=True)

        # us_label (리뷰)
        리뷰 = "N/A"
        review_section = section.find("h2", class_="us_label")
        if review_section:
            리뷰 = review_section.get_text(strip=True)

        # 데이터 저장
        review_data = {
            "직종": 직종,
            "직급": 직급,
            "면접일": 면접일,
            "면접경로": 면접경로,
            "난이도": 난이도,
            "면접질문": "\n".join(면접질문) if 면접질문 else "N/A",
            "면접답변": 면접답변,
            "면접결과": 면접결과,
            "면접경험": 면접경험,
            "리뷰": 리뷰
        }
        reviews.append(review_data)

# 빈 값 대비
if not reviews:
    reviews.append({
        "직종": "N/A",
        "직급": "N/A",
        "면접일": "N/A",
        "면접경로": "N/A",
        "난이도": "N/A",
        "면접질문": "N/A",
        "면접답변": "N/A",
        "면접결과": "N/A",
        "면접경험": "N/A",
        "리뷰": "N/A"
    })

# 데이터프레임 변환
df_reviews = pd.DataFrame(reviews)

# 엑셀 파일로 저장 (encoding 제거)
df_reviews.to_excel(output_file, index=False)

print(f"파일 저장 완료: {output_file}")
