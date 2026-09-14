from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from ml.recommender import RecipeRecommender

router = APIRouter(prefix="/recommend", tags=["recommend"])


def _get_recommender(db: Session) -> RecipeRecommender:
    recipes = db.query(models.Recipe).all()
    return RecipeRecommender(recipes)


@router.post("/by-ingredients", response_model=List[schemas.RecommendedRecipe])
def recommend_by_ingredients(payload: schemas.RecommendRequest, db: Session = Depends(get_db)):
    """'What's in my fridge' style recommendation: rank recipes by ingredient match."""
    recommender = _get_recommender(db)

    diet_pref, allergies = None, None
    if payload.user_id:
        user = db.query(models.User).filter(models.User.id == payload.user_id).first()
        if user:
            diet_pref, allergies = user.dietary_pref, user.allergies

    results = recommender.recommend_by_ingredients(
        payload.ingredients or [], top_n=payload.top_n or 10,
        diet_pref=diet_pref, allergies=allergies,
    )
    return [
        schemas.RecommendedRecipe(**schemas.RecipeOut.model_validate(r).model_dump(), score=round(s, 4))
        for r, s in results
    ]


@router.get("/for-user/{user_id}", response_model=List[schemas.RecommendedRecipe])
def recommend_for_user(user_id: int, top_n: int = 10, db: Session = Depends(get_db)):
    """Personalized feed based on the user's past likes/ratings (content-based)."""
    recommender = _get_recommender(db)

    user = db.query(models.User).filter(models.User.id == user_id).first()
    liked_ids = [
        i.recipe_id for i in db.query(models.UserInteraction)
        .filter(models.UserInteraction.user_id == user_id)
        .filter((models.UserInteraction.liked == 1) | (models.UserInteraction.rating >= 4))
        .all()
    ]

    diet_pref = user.dietary_pref if user else None
    allergies = user.allergies if user else None

    results = recommender.recommend_for_user(
        liked_ids, top_n=top_n, diet_pref=diet_pref, allergies=allergies
    )

    if not results:
        # cold-start fallback: just return top recipes matching diet pref
        recipes = db.query(models.Recipe).limit(top_n).all()
        return [
            schemas.RecommendedRecipe(**schemas.RecipeOut.model_validate(r).model_dump(), score=0.0)
            for r in recipes
        ]

    return [
        schemas.RecommendedRecipe(**schemas.RecipeOut.model_validate(r).model_dump(), score=round(s, 4))
        for r, s in results
    ]


@router.get("/similar/{recipe_id}", response_model=List[schemas.RecommendedRecipe])
def similar_recipes(recipe_id: int, top_n: int = 5, db: Session = Depends(get_db)):
    """'You might also like' — recipes similar to one the user is viewing."""
    recommender = _get_recommender(db)
    results = recommender.similar_recipes(recipe_id, top_n=top_n)
    return [
        schemas.RecommendedRecipe(**schemas.RecipeOut.model_validate(r).model_dump(), score=round(s, 4))
        for r, s in results
    ]
