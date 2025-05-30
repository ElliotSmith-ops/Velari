from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from datetime import datetime
import praw
from supabase import create_client, Client
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'shadow-market-scraper')))

from gpt_insights import run_insight_pipeline
from prawcore.exceptions import NotFound, Forbidden, Redirect

def is_scrapable(subreddit_name):
    try:
        info = reddit.subreddit(subreddit_name)
        _ = info.subscribers  # Force fetch to trigger errors
        if info.subreddit_type == 'private':
            print(f"🔒 r/{subreddit_name} is private")
            return False
        if info.quarantine:
            print(f"☣️ r/{subreddit_name} is quarantined")
            return False
        if info.subscribers == 0:
            print(f"👻 r/{subreddit_name} has no subscribers")
            return False
        return True
    except (NotFound, Forbidden, Redirect) as e:
        print(f"❌ r/{subreddit_name} is banned or inaccessible: {str(e)}")
        return False
    except Exception as e:
        print(f"⚠️ Unexpected error for r/{subreddit_name}: {str(e)}")
        return False



# Load environment variables
load_dotenv()

# Init Reddit + Supabase
reddit = praw.Reddit(
    client_id=os.getenv("REDDIT_CLIENT_ID"),
    client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
    user_agent=os.getenv("REDDIT_USER_AGENT")
)
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# FastAPI setup
app = FastAPI()

class ScrapeRequest(BaseModel):
    user_id: str
    query: str
    subreddits: list[str]

@app.post("/scrape")
async def scrape(request: ScrapeRequest):
inserted = 0
skipped = []

for sub in request.subreddits:
    if not is_scrapable(sub):
        skipped.append(sub)
        continue

    try:
        subreddit = reddit.subreddit(sub)
        for post in subreddit.top(time_filter="day", limit=20):
            if post.stickied or not post.is_self:
                continue

            post_data = {
                "source": "custom",
                "url": f"https://reddit.com{post.permalink}",
                "title": post.title,
                "content": post.selftext[:5000],
                "created_at": datetime.utcfromtimestamp(post.created_utc).isoformat(),
                "subreddit": sub,
                "score": post.score,
                "custom_query": request.query,
                "custom_user_id": request.user_id
            }

            existing = supabase.table("raw_posts").select("id").eq("url", post_data["url"]).execute()
            if not existing.data:
                supabase.table("raw_posts").insert(post_data).execute()
                inserted += 1
    except Exception as e:
        print(f"❌ Failed to fetch r/{sub}: {str(e)}")
        skipped.append(sub)
        continue
