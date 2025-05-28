from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from datetime import datetime
import praw
from supabase import create_client, Client
from gpt_insights import run_insight_pipeline


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
    try:
        print(f"🔍 Scraping subreddits for '{request.query}': {request.subreddits}")

        inserted = 0
        for sub in request.subreddits:
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
        
        print("🧠 Running GPT insight generation...")
        run_insight_pipeline(user_id=request.user_id)

        return {"success": True, "inserted_posts": inserted, "subreddits": request.subreddits}

    except Exception as e:
        print("❌ Error:", e)
        raise HTTPException(status_code=500, detail=str(e))
