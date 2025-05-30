import praw
import os
import argparse
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime
from openai import OpenAI
import sys
import json
from prawcore.exceptions import NotFound, Forbidden, Redirect
from pathlib import Path

# Get from environment or crash with clear error
def get_env(name):
    value = os.getenv(name)
    if not value:
        print(f"❌ Missing environment variable: {name}", file=sys.stderr)
        sys.exit(1)
    return value

reddit = praw.Reddit(
    client_id=get_env("REDDIT_CLIENT_ID"),
    client_secret=get_env("REDDIT_CLIENT_SECRET"),
    user_agent=get_env("REDDIT_USER_AGENT")
)

# Initialize Supabase
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def is_scrapable(subreddit):
    try:
        info = reddit.subreddit(subreddit)
        _ = info.subscribers  # Force fetch to trigger errors
        if info.subreddit_type == 'private':
            print(f"🔒 r/{subreddit} is private")
            return False
        if info.quarantine:
            print(f"⚠️ r/{subreddit} is quarantined")
            return False
        if info.subscribers == 0:
            print(f"👻 r/{subreddit} has no subscribers")
            return False
        return True
    except (NotFound, Forbidden, Redirect) as e:
        print(f"❌ r/{subreddit} is banned or inaccessible: {str(e)}")
        return False
    except Exception as e:
        print(f"⚠️ Unexpected error for r/{subreddit}: {str(e)}")
        return False

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

def scrape_custom_subreddits(subreddits: list[str], query: str, user_id: str) -> dict:
    skipped = []
    inserted = 0

    for sub in subreddits:
        if not is_scrapable(sub):
            skipped.append(sub)
            print(f"⚠️ Skipping r/{sub}")
            continue

        try:
            subreddit = reddit.subreddit(sub)
            posts = subreddit.top(time_filter="day", limit=20)
        except Exception as e:
            print(f"❌ Failed to fetch r/{sub}: {str(e)}")
            skipped.append(sub)
            continue

        for post in posts:
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

            existing = supabase.table("raw_posts").select("id").eq("url", post_data["url"]).execute()
            if not existing.data:
                supabase.table("raw_posts").insert(post_data).execute()
                inserted += 1
                print(f"🪄 Inserted: {post.title}")

    return {
        "inserted_count": inserted,
        "skipped_subreddits": skipped,
        "scraped_subreddits": [s for s in subreddits if s not in skipped]
    }

if __name__ == "__main__":
    try:
        parser = argparse.ArgumentParser(description="Custom Reddit scraper for user-defined queries.")
        parser.add_argument("--query", required=True, help="Search query for the user")
        parser.add_argument("--user_id", required=True, help="Unique identifier for the user")
        args = parser.parse_args()

        subreddits = get_relevant_subreddits(args.query)
        print(f"🔍 Scraping subreddits: {subreddits}", file=sys.stderr)

        result = scrape_custom_subreddits(subreddits, args.query, args.user_id)

        print(json.dumps({
            "success": True,
            "inserted_count": result["inserted_count"],
            "skipped_subreddits": result["skipped_subreddits"],
            "scraped_subreddits": result["scraped_subreddits"]
        }))
        sys.exit(0)

    except Exception as e:
        error_message = f"💥 Fatal scraper error: {str(e)}"
        print(error_message, file=sys.stderr)
        print(json.dumps({
            "success": False,
            "error": error_message
        }))
        sys.exit(1)
