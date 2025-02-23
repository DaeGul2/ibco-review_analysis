from googleapiclient.discovery import build
import pandas as pd

def get_all_youtube_comments(video_id, api_key):
    # YouTube service 객체 생성
    youtube = build('youtube', 'v3', developerKey=api_key)
    comments = []

    # 초기 요청 설정
    request = youtube.commentThreads().list(
        part='snippet',
        videoId=video_id,
        textFormat='plainText',
        maxResults=100,
        pageToken=None
    )

    while request:
        # 댓글 가져오기
        response = request.execute()
        for item in response['items']:
            comment = item['snippet']['topLevelComment']['snippet']['textDisplay']
            comments.append({'review': comment})
        
        # 다음 페이지 요청 (페이지 토큰 이용)
        request = youtube.commentThreads().list_next(previous_request=request, previous_response=response)

    return comments

# API 키와 동영상 ID 설정
api_key = 'AIzaSyASVNuhVLTae-KvbKckbyu7aatED82R11A'  # 실제 API 키를 사용하세요
video_id = 'C-jt0Cetaxg'

# 모든 댓글 가져오기
comments = get_all_youtube_comments(video_id, api_key)

# 데이터 프레임 생성 및 엑셀 파일로 저장
df = pd.DataFrame(comments)
output_file = 'youtube_review_output.xlsx'
df.to_excel(output_file, index=False)

print("댓글이 성공적으로 저장되었습니다.")

