import urllib.request
import urllib.parse
import re

# Fallback curated Tamil & English videos for top conditions
FALLBACK_VIDEOS = {
    "tamil": "https://www.youtube.com/watch?v=ReYRmcF26v0",
    "english": "https://www.youtube.com/watch?v=5Ujh7p6u3mE"
}

def get_video_url_for_disease(disease_name: str, language: str = "Tamil") -> str:
    """
    Dynamically finds the top educational medical video on YouTube
    in Tamil or English for ANY disease.
    """
    try:
        # Build search query for high quality educational medical videos
        if language.lower() == "tamil":
            search_query = f"{disease_name} causes symptoms treatment in tamil மருத்துவம் விளக்கம்"
        else:
            search_query = f"{disease_name} medical causes symptoms pathophysiology animation"

        encoded = urllib.parse.quote(search_query)
        url = f"https://www.youtube.com/results?search_query={encoded}"

        # Send request with standard browser headers
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        )
        
        with urllib.request.urlopen(req, timeout=5) as response:
            html = response.read().decode('utf-8')
            # Extract video IDs from the search results
            video_ids = re.findall(r"watch\?v=([a-zA-Z0-9_-]{11})", html)
            
            if video_ids:
                # Return the first found video
                return f"https://www.youtube.com/watch?v={video_ids[0]}"
                
    except Exception as e:
        print(f"Error fetching dynamic video: {e}")

    # Fallback if network issue occurs
    return FALLBACK_VIDEOS.get(language.lower(), FALLBACK_VIDEOS["english"])