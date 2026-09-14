import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../AuthContext";
import RecipeCard from "../components/RecipeCard";

export default function Favorites() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    if (user) api.getFavorites(user.id).then(setRecipes).catch(() => {});
  }, [user]);

  if (!user) return <div className="page">Please log in to see favorites.</div>;

  return (
    <div className="page">
      <h1>Your Favorites</h1>
      <div className="recipe-grid">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>
      {recipes.length === 0 && <p>No favorites yet — go like some recipes!</p>}
    </div>
  );
}
