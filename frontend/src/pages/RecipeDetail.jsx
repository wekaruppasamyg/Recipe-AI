import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../AuthContext";
import RecipeCard from "../components/RecipeCard";

export default function RecipeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.getRecipe(id).then(setRecipe).catch(() => {});
    api.similarRecipes(id, 4).then(setSimilar).catch(() => {});
  }, [id]);

  const handleInteract = async (rating, liked) => {
    if (!user) {
      setMessage("Please log in to rate or favorite recipes.");
      return;
    }
    try {
      await api.interact({ user_id: user.id, recipe_id: Number(id), rating, liked });
      setMessage(liked ? "Added to favorites!" : `Rated ${rating} stars`);
    } catch (e) {
      setMessage(e.message);
    }
  };

  if (!recipe) return <div className="page">Loading...</div>;

  const ingredients = recipe.ingredients
    .split(",")
    .map((ingredient) => ingredient.trim())
    .filter(Boolean);
  const steps = recipe.instructions
    .split(/\s*\d+\.\s*/)
    .map((step) => step.trim())
    .filter(Boolean);

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="page">
      <img
        className="detail-image"
        src={recipe.image_url || FALLBACK_IMAGE}
        alt={recipe.title}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = FALLBACK_IMAGE;
        }}
      />
      <h1>{recipe.title}</h1>
      <p className="meta">
        {recipe.cuisine} • {recipe.diet_type} • {recipe.prep_time} min • {recipe.calories} kcal
      </p>

      <h3>Ingredients</h3>
      <ul className="ingredient-list">
        {ingredients.map((ingredient) => (
          <li key={ingredient}>{ingredient}</li>
        ))}
      </ul>

      <h3>Instructions</h3>
      <ol className="instructions">
        {steps.map((step, index) => (
          <li key={`${recipe.id}-step-${index}`}>{step}</li>
        ))}
      </ol>

      <div className="actions">
        <button onClick={() => handleInteract(0, 1)}>❤️ Favorite</button>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => handleInteract(n, 0)}>
            {n}★
          </button>
        ))}
      </div>
      {message && <p className="hint">{message}</p>}

      {similar.length > 0 && (
        <>
          <h3>You might also like</h3>
          <div className="recipe-grid">
            {similar.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
