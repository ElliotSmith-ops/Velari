import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client
from openai import OpenAI
from datetime import datetime, timedelta



print("🔥 THIS FILE IS RUNNING")

# Load environment variables from .env
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

# Manually fallback if OPENAI_API_KEY not loaded properly
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize clients
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
client = OpenAI(api_key=OPENAI_API_KEY)

cutoff = (datetime.utcnow() - timedelta(days=3)).isoformat()

supabase.table("raw_posts").delete().lt("created_at", cutoff).execute()
supabase.table("insights").delete().lt("created_at", cutoff).execute()

def process_post(post):
    prompt = f"""
Reddit Post from r/{post['subreddit']}:
Title: {post['title']}
Content: {post['content']}

You are a trend intelligence analyst for an elite signal-detection AI called Occulta.

Your task is to extract powerful, actionable insights from Reddit posts. Your output should be bold, concise, and optimized for scanning.

Use this structure:

**🔍 Signal**  
A 1–2 sentence hook summarizing the key behavior, shift, or overlooked insight.

**🧨 Why It Matters**  
Explain the strategic significance. Who loses? Who wins? Why now?

**🛠 Action Angle**  
What should a founder, operator, or strategist *do* about this?
**📊 Sector**: (choose one of the following)
- SaaS
- Ecommerce
- Creator Tools
- Health
- AI
- Education
- Finance
- Consumer
- Other

**📌 Tone**: (choose one of the following)
- Curious
- Frustrated
- Excited
- Reflective
- Skeptical
- Hopeful
- Sarcastic 
**🔥 Urgency**: 1–10  
**💡 Novelty**: 1–10  
** Interesting**: An integer representing from a scale of 1-100 how interesting an entrepreneur may find the insight.
**🕒 Date**: [autofill with today’s date]

Extract the following as a JSON object with exactly these keys:
- signal
- why_it_matters
- action_angle
- sector
- tone
- urgency_score (1-10 integer)
- novelty_score (1-10 integer)
- interesting_score (1-100 integer)
- date

Rules:
- Skip weak or redundant posts where novelty < 3 or urgency < 5 and return null.
- Be opinionated. Take a stance.
- Avoid fluff. Say what matters.
- Only respond using the exact words above for 'sector' and 'tone'. If no good fit, choose 'Other'.
- Only give high urgency and novelty scores to insights with actionable potential, not just urgent musings.
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
    posts = supabase.table("raw_posts").select("*").limit(100).execute().data
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
                    "signal": insight_data["signal"],
                    "why_it_matters": insight_data["why_it_matters"],
                    "action_angle": insight_data["action_angle"],
                    "sector": insight_data["sector"], 
                    "urgency_score": int(insight_data["urgency_score"]),
                    "novelty_score": int(insight_data["novelty_score"]),
                    "interesting_score": int(insight_data["interesting_score"]),
                    "tone": insight_data["tone"],
                    "created_at": datetime.utcnow().isoformat()
                }).execute()
                print("✅ Inserted insight for:", post["title"])
            except Exception as e:
                print("❌ Supabase insert error:", e)

if __name__ == "__main__":
    print("⚙️ About to run pipeline")
    run_insight_pipeline()
