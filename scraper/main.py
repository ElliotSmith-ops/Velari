from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from datetime import datetime
import praw
from supabase import create_client, Client
import sys

# Fix path to import GPT logic
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'shadow-market-scraper')))
from gpt_insights import run_insight_pipeline  # <-- must support query param
from prawcore.exceptions import NotFound, Forbidden, Redirect

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

# Subreddit check helper
def is_scrapable(subreddit_name):
    try:
        info = reddit.subreddit(subreddit_name)
        _ = info.subscribers  # Trigger fetch
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

# Request model
class ScrapeRequest(BaseModel):
    user_id: str
    query: str
    subreddits: list[str]

# Scrape endpoint
@app.post("/scrape")
async def scrape(request: ScrapeRequest):
    print(f"🔍 Scraping subreddits for '{request.query}': {request.subreddits}")
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

                existing = supabase.table("raw_posts").select("id").eq("url", post_data["url"]).eq("custom_query", request.query).execute()
                if not existing.data:
                    supabase.table("raw_posts").insert(post_data).execute()
                    inserted += 1
        except Exception as e:
            print(f"❌ Failed to fetch r/{sub}: {str(e)}")
            skipped.append(sub)
            continue

    if inserted == 0 and len(skipped) == len(request.subreddits):
        raise HTTPException(status_code=400, detail="All subreddits were inaccessible or failed.")

    print("🧠 Running GPT insight generation...")
    run_insight_pipeline(user_id=request.user_id, query=request.query)  # <-- pass query
    user = supabase.table("users").select("credits").eq("id", request.user_id).single().execute().data
    if user and user["credits"] > 0:
        supabase.table("users").update({"credits": user["credits"] - 1}).eq("id", request.user_id).execute()
    return {
        "success": True,
        "inserted_posts": inserted,
        "skipped_subreddits": skipped,
        "scraped_subreddits": [sub for sub in request.subreddits if sub not in skipped]
    }
