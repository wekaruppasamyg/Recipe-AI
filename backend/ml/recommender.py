"""
Content-based recipe recommender.

Approach:
1. Build a "content soup" per recipe = ingredients + cuisine + diet_type + tags
2. Vectorize the corpus with TF-IDF
3. For a given user:
   - Build a user profile vector by averaging TF-IDF vectors of recipes
     they've liked / rated highly (collaborative-ish personalization)
   - OR, if the user supplies a list of ingredients ("what's in my fridge"),
     vectorize that list and rank by cosine similarity
4. Return top-N recipes ranked by similarity score, filtered by user's
   dietary preference and allergies.
"""

from typing import List, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def _build_soup(recipe) -> str:
    parts = [
        recipe.ingredients or "",
        recipe.cuisine or "",
        recipe.diet_type or "",
        recipe.tags or "",
    ]
    return " ".join(parts).lower()


class RecipeRecommender:
    def __init__(self, recipes: List):
        self.recipes = recipes
        self.corpus = [_build_soup(r) for r in recipes]
        self.vectorizer = TfidfVectorizer(stop_words="english")
        if self.corpus:
            self.tfidf_matrix = self.vectorizer.fit_transform(self.corpus)
        else:
            self.tfidf_matrix = None

    def _filter_indices(self, diet_pref: Optional[str], allergies: Optional[str]):
        """Return indices of recipes that respect diet preference / allergies."""
        allowed = list(range(len(self.recipes)))
        if diet_pref and diet_pref.lower() != "none":
            allowed = [
                i for i in allowed
                if diet_pref.lower() in (self.recipes[i].diet_type or "").lower()
            ]
        if allergies:
            allergy_list = [a.strip().lower() for a in allergies.split(",") if a.strip()]
            if allergy_list:
                allowed = [
                    i for i in allowed
                    if not any(a in (self.recipes[i].ingredients or "").lower() for a in allergy_list)
                ]
        return set(allowed)

    def recommend_by_ingredients(self, ingredients: List[str], top_n: int = 10,
                                  diet_pref: Optional[str] = None,
                                  allergies: Optional[str] = None):
        if self.tfidf_matrix is None:
            return []
        query = " ".join(ingredients).lower()
        query_vec = self.vectorizer.transform([query])
        sims = cosine_similarity(query_vec, self.tfidf_matrix).flatten()

        allowed = self._filter_indices(diet_pref, allergies)
        ranked = sorted(
            [(i, s) for i, s in enumerate(sims) if i in allowed],
            key=lambda x: x[1], reverse=True
        )
        return [(self.recipes[i], float(s)) for i, s in ranked[:top_n] if s > 0]

    def recommend_for_user(self, liked_recipe_ids: List[int], top_n: int = 10,
                            diet_pref: Optional[str] = None,
                            allergies: Optional[str] = None):
        """Personalized recommendations based on a user's liked/rated recipes."""
        if self.tfidf_matrix is None or not liked_recipe_ids:
            return []

        id_to_index = {r.id: idx for idx, r in enumerate(self.recipes)}
        liked_indices = [id_to_index[rid] for rid in liked_recipe_ids if rid in id_to_index]
        if not liked_indices:
            return []

        # user profile = average of TF-IDF vectors of liked recipes
        user_vector = np.asarray(self.tfidf_matrix[liked_indices].mean(axis=0))
        sims = cosine_similarity(user_vector, self.tfidf_matrix).flatten()

        allowed = self._filter_indices(diet_pref, allergies)
        # exclude recipes already liked
        ranked = sorted(
            [(i, s) for i, s in enumerate(sims)
             if i in allowed and i not in liked_indices],
            key=lambda x: x[1], reverse=True
        )
        return [(self.recipes[i], float(s)) for i, s in ranked[:top_n] if s > 0]

    def similar_recipes(self, recipe_id: int, top_n: int = 5):
        """Recipes similar to a given recipe (for 'you might also like')."""
        id_to_index = {r.id: idx for idx, r in enumerate(self.recipes)}
        if recipe_id not in id_to_index or self.tfidf_matrix is None:
            return []
        idx = id_to_index[recipe_id]
        sims = cosine_similarity(self.tfidf_matrix[idx], self.tfidf_matrix).flatten()
        ranked = sorted(
            [(i, s) for i, s in enumerate(sims) if i != idx],
            key=lambda x: x[1], reverse=True
        )
        return [(self.recipes[i], float(s)) for i, s in ranked[:top_n]]
