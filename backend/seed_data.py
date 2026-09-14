"""
Run this once to create the SQLite DB and populate it with sample recipes:
    python seed_data.py
"""
import json
from pathlib import Path
from database import engine, Base, SessionLocal
import models


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    recipes_file = Path(__file__).resolve().parent / "sample_recipes.json"
    with open(recipes_file, "r", encoding="utf-8") as f:
        recipes = json.load(f)

    existing = {recipe.title: recipe for recipe in db.query(models.Recipe).all()}
    added = 0
    updated = 0
    for r in recipes:
        if r["title"] not in existing:
            db.add(models.Recipe(**r))
            added += 1
        elif r.get("image_url") and existing[r["title"]].image_url != r["image_url"]:
            existing[r["title"]].image_url = r["image_url"]
            updated += 1

    db.commit()
    print(f"Added {added} recipes and updated {updated} images in recipe_ai.db")
    db.close()


if __name__ == "__main__":
    seed()
