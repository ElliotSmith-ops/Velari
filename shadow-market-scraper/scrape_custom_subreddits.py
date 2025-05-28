import praw
import os
import argparse
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize Reddit API
reddit = praw.Reddit(
    client_id=os.getenv("REDDIT_CLIENT_ID"),
    client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
    user_agent=os.getenv("REDDIT_USER_AGENT")
)

# Initialize Supabase
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# Optionally use OpenAI to determine subreddits from the query
def get_relevant_subreddits(query: str) -> list[str]:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    system_prompt = "You are a startup trends analyst. Given a search query, return the 5 most relevant subreddits as a Python list of strings."
    prompt = f"Search query: {query}"
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        temperature=0.5
    )
    output = response.choices[0].message.content.strip()
    try:
        subreddits = eval(output)
        if isinstance(subreddits, list):
            return subreddits
    except Exception:
        pass
    return ["Entrepreneur", "SideProject", "AItools", "startups"]  # fallback

def scrape_custom_subreddits(subreddits: list[str], query: str, user_id: str) -> None:
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
                "custom_query": query,
                "custom_user_id": user_id
            }

            # Avoid duplicates
            existing = supabase.table("raw_posts").select("id").eq("url", post_data["url"]).execute()
            if not existing.data:
                print(f"🪄 Inserting for {user_id}: {post.title}")
                supabase.table("raw_posts").insert(post_data).execute()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Custom Reddit scraper for user-defined queries.")
    parser.add_argument("--query", required=True, help="Search query for the user")
    parser.add_argument("--user_id", required=True, help="Unique identifier for the user")
    args = parser.parse_args()

    subreddits = get_relevant_subreddits(args.query)
    print(f"🔍 Scraping subreddits: {subreddits}")
    scrape_custom_subreddits(subreddits, args.query, args.user_id)
