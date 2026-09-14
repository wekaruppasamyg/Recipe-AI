from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path

import json
from database import engine, Base, SessionLocal
import models
from routers import auth, chat, recipes, recommend, ingredients_chat

load_dotenv(Path(__file__).resolve().parent / ".env", override=True)


def auto_seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Clean up any dummy test records
        db.query(models.Recipe).filter(models.Recipe.title == "Test Seed").delete()

        recipes_file = Path(__file__).resolve().parent / "sample_recipes.json"
        if recipes_file.exists():
            with open(recipes_file, "r", encoding="utf-8") as f:
                recipes_data = json.load(f)

            existing = {r.title: r for r in db.query(models.Recipe).all()}
            added = 0
            for r in recipes_data:
                title = r.get("title")
                if title not in existing:
                    db.add(models.Recipe(**r))
                    added += 1
                elif r.get("image_url") and existing[title].image_url != r["image_url"]:
                    existing[title].image_url = r["image_url"]

            db.commit()
            if added > 0:
                print(f"Auto-seeded {added} recipes into database.")
    except Exception as e:
        print(f"Auto-seed warning: {e}")
    finally:
        db.close()


auto_seed_db()

app = FastAPI(title="AI Smart Recipe Recommendation System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(recipes.router)
app.include_router(recommend.router)
app.include_router(chat.router)
app.include_router(ingredients_chat.router)


@app.get("/")
def root():
    return {"message": "AI Smart Recipe Recommendation API is running"}
