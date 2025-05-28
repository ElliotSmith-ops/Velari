from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from datetime import datetime
import praw
from supabase import create_client, Client
from openai import OpenAI

# Load env variables
load_dotenv()

# Init Reddit + Supabase + OpenAI
reddit = praw.Reddit(
    client_id=os.getenv("REDDIT_CLIENT_ID"),
    client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
    user_agent=os.getenv("REDDIT_USER_AGENT")
)
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# FastAPI setup
app = FastAPI()

class ScrapeRequest(BaseModel):
    user_id: str
    query: str

@app.post("/scrape")
async def scrape(request: ScrapeRequest):
    try:
        # Step 1: GPT gets subreddits
        prompt = f"Search query: {request.query}"
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a startup trends analyst. Given a search query, return the 5 most relevant subreddits as a Python list of strings."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5
        )
        output = response.choices[0].message.content.strip()
        try:
            subreddits = eval(output)
            if not isinstance(subreddits, list):
                raise Exception()
        except Exception:
            subreddits = ["Entrepreneur", "SideProject", "AItools", "startups"]

        print(f"🔍 Scraping subreddits: {subreddits}")

        # Step 2: Scrape and insert to Supabase
        inserted = 0
        for sub in subreddits:
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

        return {"success": True, "subreddits": subreddits, "inserted_posts": inserted}
    
    except Exception as e:
        print("❌ Error:", e)
        raise HTTPException(status_code=500, detail=str(e))
