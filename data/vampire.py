import requests
from bs4 import BeautifulSoup
import pandas as pd

def scrape_reviews(url):
    # Request the content of the web page
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Select all review containers
    reviews = soup.select('.apphub_CardContentMain')
    review_list = []
    
    # Extract data from each review
    for index, review in enumerate(reviews):
        review_text_content = review.select_one('.apphub_CardTextContent')
        review_text = ' '.join(review_text_content.text.strip().split()) if review_text_content else 'No review text found'
        
        # Append the review and its index to the list
        review_list.append({'연번': index + 1, '리뷰': review_text})
    
    # Create a DataFrame
    df_reviews = pd.DataFrame(review_list)
    return df_reviews

# URL to scrape
url = "https://steamcommunity.com/app/1794680/negativereviews/?browsefilter=toprated&snr=1_5_100010_"

# Scrape the reviews
reviews_df = scrape_reviews(url)

# Save the DataFrame to an Excel file
output_file = 'vamoutput_.xlsx'
reviews_df.to_excel(output_file, index=False)

print(reviews_df)
