import os
import json
import argparse
from dotenv import load_dotenv
from supabase import create_client, Client
from openai import OpenAI
from datetime import datetime, timedelta

print("🔥 THIS FILE IS RUNNING")

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

# Initialize API clients
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
client = OpenAI(api_key=OPENAI_API_KEY)

# Clean up posts older than 3 days
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

**📊 Sector**: (choose one)
- SaaS
- Ecommerce
- Creator Tools
- Health
- AI
- Education
- Finance
- Consumer
- Other

**📌 Tone**: (choose one)
- Curious
- Frustrated
- Excited
- Reflective
- Skeptical
- Hopeful
- Sarcastic

**🔥 Urgency**: 1–10  
**💡 Novelty**: 1–10  
**Interesting**: A score from 1–100  
**🕒 Date**: [autofill with today’s date]

Return this as a JSON object with these keys:
- signal
- why_it_matters
- action_angle
- sector
- tone
- urgency_score
- novelty_score
- interesting_score
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
        if result.startswith("```json"):
            result = result.replace("```json", "").replace("```", "").strip()
        elif result.startswith("```"):
            result = result.replace("```", "").strip()
        return json.loads(result)
    except Exception as e:
        print("❌ Error:", e)
        return None

def run_insight_pipeline(user_id=None):
    def run_insight_pipeline(user_id=None):
    print("🧠🧠🧠 GPT INSIGHTS RUNNING 🧠🧠🧠", flush=True)
    raise Exception("INTENTIONALLY CRASHING TO PROVE FUNCTION RAN")

    query = supabase.table("raw_posts").select("*").limit(100)
    query = query.eq("custom_user_id", user_id) if user_id else query.is_("custom_user_id", None)
    posts = query.execute().data
    print(f"📥 {len(posts)} posts fetched for user '{user_id}'")


    print(f"📥 {len(posts)} posts fetched")
    for post in posts:
        print(f"🔍 {post['title']}")
        if supabase.table("insights").select("id").eq("post_id", post["url"]).execute().data:
            continue

        insight_data = process_post(post)
        print("🧠 Insight GPT response:", insight_data)

        if not insight_data:
            continue

        try:
            supabase.table("insights").insert({
                "post_id": post["url"],
                "signal": insight_data["signal"],
                "why_it_matters": insight_data["why_it_matters"],
                "action_angle": insight_data["action_angle"],
                "sector": insight_data["sector"],
                "tone": insight_data["tone"],
                "urgency_score": int(insight_data["urgency_score"]),
                "novelty_score": int(insight_data["novelty_score"]),
                "interesting_score": int(insight_data["interesting_score"]),
                "created_at": datetime.utcnow().isoformat(),
                "custom_user_id": user_id if user_id else None
            }).execute()
            print("✅ Inserted insight:", post["url"])
        except Exception as e:
            print("❌ DB insert error:", e)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--user_id", help="Optional custom user ID")
    args = parser.parse_args()
    run_insight_pipeline(user_id=args.user_id)
