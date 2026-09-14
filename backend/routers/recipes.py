from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
import models
import schemas

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.get("/", response_model=List[schemas.RecipeOut])
def list_recipes(search: Optional[str] = None, cuisine: Optional[str] = None,
                  diet_type: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(models.Recipe)
    if search:
        like = f"%{search.lower()}%"
        q = q.filter(models.Recipe.title.ilike(like))
    if cuisine:
        q = q.filter(models.Recipe.cuisine.ilike(f"%{cuisine}%"))
    if diet_type:
        q = q.filter(models.Recipe.diet_type.ilike(f"%{diet_type}%"))
    return q.all()


@router.get("/{recipe_id}", response_model=schemas.RecipeOut)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@router.post("/", response_model=schemas.RecipeOut)
def create_recipe(payload: schemas.RecipeCreate, db: Session = Depends(get_db)):
    recipe = models.Recipe(**payload.model_dump())
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe


@router.post("/interact")
def record_interaction(payload: schemas.InteractionCreate, db: Session = Depends(get_db)):
    """Record a rating / like / view — this feedback improves future recommendations."""
    interaction = models.UserInteraction(
        user_id=payload.user_id,
        recipe_id=payload.recipe_id,
        rating=payload.rating,
        liked=payload.liked,
    )
    db.add(interaction)
    db.commit()
    return {"status": "ok"}


@router.get("/user/{user_id}/favorites", response_model=List[schemas.RecipeOut])
def get_favorites(user_id: int, db: Session = Depends(get_db)):
    liked_ids = [
        i.recipe_id for i in db.query(models.UserInteraction)
        .filter(models.UserInteraction.user_id == user_id, models.UserInteraction.liked == 1)
        .all()
    ]
    if not liked_ids:
        return []
    return db.query(models.Recipe).filter(models.Recipe.id.in_(liked_ids)).all()


@router.delete("/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    db.delete(recipe)
    db.commit()
    return {"status": "ok", "message": f"Recipe {recipe_id} deleted"}


@router.post("/seed/populate")
def populate_recipes(db: Session = Depends(get_db)):
    from pathlib import Path
    import json
    recipes_file = Path(__file__).resolve().parent.parent / "sample_recipes.json"
    if not recipes_file.exists():
        raise HTTPException(status_code=404, detail="sample_recipes.json not found")

    with open(recipes_file, "r", encoding="utf-8") as f:
        recipes = json.load(f)

    existing = {r.title: r for r in db.query(models.Recipe).all()}
    added = 0
    for r in recipes:
        title = r.get("title")
        if title not in existing:
            db.add(models.Recipe(**r))
            added += 1

    db.commit()
    return {"status": "ok", "added": added}

