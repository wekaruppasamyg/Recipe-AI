from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    dietary_pref = Column(String, default="none")   # e.g. vegetarian, vegan, keto
    allergies = Column(String, default="")           # comma separated

    interactions = relationship("UserInteraction", back_populates="user")


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    ingredients = Column(Text, nullable=False)     # comma separated raw text
    instructions = Column(Text, nullable=False)
    cuisine = Column(String, default="")
    diet_type = Column(String, default="")          # vegetarian/vegan/non-veg/etc
    prep_time = Column(Integer, default=0)           # minutes
    calories = Column(Integer, default=0)
    image_url = Column(String, default="")
    tags = Column(String, default="")                # comma separated

    interactions = relationship("UserInteraction", back_populates="recipe")


class UserInteraction(Base):
    __tablename__ = "user_interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    recipe_id = Column(Integer, ForeignKey("recipes.id"))
    rating = Column(Float, default=0)      # 1-5, 0 = not rated
    liked = Column(Integer, default=0)     # 1 = liked/favorited
    viewed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="interactions")
    recipe = relationship("Recipe", back_populates="interactions")
