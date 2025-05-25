import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client
from openai import OpenAI
from datetime import datetime

print("🔥 THIS FILE IS RUNNING")

# Load environment variables from .env
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

# Manually fallback if OPENAI_API_KEY not loaded properly
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize clients
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
client = OpenAI(api_key=OPENAI_API_KEY)

def process_post(post):
    prompt = f"""
Reddit Post from r/{post['subreddit']}:
Title: {post['title']}
Content: {post['content']}

Extract the following as a JSON object with exactly these keys:
- summary
- pain_point
- idea
- urgency_score (1-10 integer)
- novelty_score (1-10 integer)
- tone
- category
"""
    try:
        chat_response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        result = chat_response.choices[0].message.content.strip()

        # Remove triple backticks and language hint (e.g. ```json)
        if result.startswith("```json"):
            result = result.replace("```json", "").replace("```", "").strip()
        elif result.startswith("```"):
            result = result.replace("```", "").strip()

        parsed = json.loads(result)
        return parsed

    except json.JSONDecodeError:
        print("❌ JSON parse error — GPT response could not be parsed.")
        return None

    except Exception as e:
        print("❌ OpenAI API error:", e)
        return None


def run_insight_pipeline():
    print("🔄 Running insight pipeline...")
    posts = supabase.table("raw_posts").select("*").limit(10).execute().data
    print(f"📥 Fetched {len(posts)} posts from Supabase")
    for post in posts:
        print(f"🔍 Processing post: {post['title']}")
        # Skip if already processed
        existing = supabase.table("insights").select("id").eq("post_id", post["id"]).execute()
        if existing.data:
            continue

        print(f"🧠 Processing: {post['title']}")
        insight_data = process_post(post)

        if not insight_data:
            print("⚠️ No valid insight returned for this post. Skipping.")
            continue
        if insight_data:
            print("✅ Insight data processed successfully:", insight_data)
            try:
                supabase.table("insights").insert({
                    "post_id": post["url"],
                    "summary": insight_data["summary"],
                    "pain_point": insight_data["pain_point"],
                    "idea": insight_data["idea"],
                    "urgency_score": int(insight_data["urgency_score"]),
                    "novelty_score": int(insight_data["novelty_score"]),
                    "tone": insight_data["tone"],
                    "category": insight_data["category"],
                    "created_at": datetime.utcnow().isoformat()
                }).execute()
                print("✅ Inserted insight for:", post["title"])
            except Exception as e:
                print("❌ Supabase insert error:", e)

if __name__ == "__main__":
    print("⚙️ About to run pipeline")
    run_insight_pipeline()
