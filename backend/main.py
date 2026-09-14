from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path

from database import engine, Base
import models
from routers import auth, chat, recipes, recommend, ingredients_chat

load_dotenv(Path(__file__).resolve().parent / ".env", override=True)

Base.metadata.create_all(bind=engine)

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
