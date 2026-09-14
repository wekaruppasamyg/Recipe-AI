from pydantic import BaseModel, EmailStr
from typing import Optional, List


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    dietary_pref: Optional[str] = "none"
    allergies: Optional[str] = ""


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    dietary_pref: str
    allergies: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class RecipeOut(BaseModel):
    id: int
    title: str
    ingredients: str
    instructions: str
    cuisine: str
    diet_type: str
    prep_time: int
    calories: int
    image_url: str
    tags: str

    class Config:
        from_attributes = True


class RecipeCreate(BaseModel):
    title: str
    ingredients: str
    instructions: str
    cuisine: Optional[str] = ""
    diet_type: Optional[str] = ""
    prep_time: Optional[int] = 0
    calories: Optional[int] = 0
    image_url: Optional[str] = ""
    tags: Optional[str] = ""


class InteractionCreate(BaseModel):
    user_id: int
    recipe_id: int
    rating: Optional[float] = 0
    liked: Optional[int] = 0


class RecommendRequest(BaseModel):
    user_id: Optional[int] = None
    ingredients: Optional[List[str]] = None
    top_n: Optional[int] = 10


class RecommendedRecipe(RecipeOut):
    score: float
