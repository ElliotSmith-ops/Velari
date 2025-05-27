import praw
import os
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Reddit config
reddit = praw.Reddit(
    client_id=os.getenv("REDDIT_CLIENT_ID"),
    client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
    user_agent=os.getenv("REDDIT_USER_AGENT")
)

# Supabase config
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# Subreddits to scrape
subreddits = ["Entrepreneur", "SideProject", "fashion"]

def fetch_posts():
    for sub in subreddits:
        subreddit = reddit.subreddit(sub)
        for post in subreddit.hot(limit=20):  # Adjust 'hot', 'new', etc.
            # Skip if it's a stickied post or a link post
            if post.stickied or post.is_self is False:
                continue

            post_data = {
                "source": "reddit",
                "url": f"https://reddit.com{post.permalink}",
                "title": post.title,
                "content": post.selftext[:5000],  # Truncate if needed
                "created_at": datetime.utcfromtimestamp(post.created_utc).isoformat(),
                "subreddit": sub,
                "score": post.score
            }

            # Check for duplicates before insert
            existing = supabase.table("raw_posts").select("id").eq("url", post_data["url"]).execute()
            if not existing.data:
                print(f"Inserting: {post.title}")
                supabase.table("raw_posts").insert(post_data).execute()

if __name__ == "__main__":
    fetch_posts()
