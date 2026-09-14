# AI-Powered Smart Recipe Recommendation System

Final year project — React (Vite) frontend + FastAPI backend + SQLite database.

## Structure
```
recipe-ai/
├── backend/         FastAPI + SQLite + ML recommender
│   ├── main.py
│   ├── models.py            SQLAlchemy models (User, Recipe, UserInteraction)
│   ├── database.py          SQLite connection
│   ├── schemas.py           Pydantic request/response schemas
│   ├── auth_utils.py        Password hashing + JWT
│   ├── seed_data.py         Loads sample_recipes.json into the DB
│   ├── sample_recipes.json  15 sample recipes to seed
│   ├── routers/
│   │   ├── auth.py          /auth/register, /auth/login
│   │   ├── recipes.py       /recipes (CRUD, interactions, favorites)
│   │   └── recommend.py     /recommend (AI recommendation endpoints)
│   └── ml/
│       └── recommender.py   TF-IDF + cosine similarity recommender
└── frontend/        React (Vite)
    └── src/
        ├── pages/           Home, IngredientSearch, RecipeDetail, Favorites, Login, Register
        ├── components/      Navbar, RecipeCard
        ├── api/client.js    API wrapper
        └── AuthContext.jsx  Login state (localStorage)
```

## How the AI recommendation works
Content-based filtering using TF-IDF vectors built from each recipe's
ingredients + cuisine + diet type + tags, ranked by cosine similarity.

- **By ingredients** ("what's in my fridge") — vectorizes the ingredients you
  type and ranks recipes by overlap.
- **For a user** — builds a profile vector by averaging the TF-IDF vectors of
  recipes the user liked/rated highly, then recommends similar recipes.
- **Similar recipes** — "you might also like" on the recipe detail page.

All three respect the user's dietary preference and allergies.

## Full setup instructions
See the accompanying PDF (or run `pip install -r backend/requirements.txt`,
`python backend/seed_data.py`, `uvicorn main:app --reload` from `backend/`,
then `npm install && npm run dev` from `frontend/`).
