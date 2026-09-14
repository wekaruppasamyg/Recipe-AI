import { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../AuthContext";
import RecipeCard from "../components/RecipeCard";
import IngredientsChat from "../components/IngredientsChat";

export default function IngredientSearch() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [showIngredientsChat, setShowIngredientsChat] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const ingredients = input
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);
    if (ingredients.length === 0) return;

    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const data = await api.recommendByIngredients({
        user_id: user ? user.id : null,
        ingredients,
        top_n: 50,
      });
      setRecipes(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>What's in your fridge?</h1>
      <p className="hint">
        Enter ingredients you have, separated by commas (e.g. chicken, rice, tomato)
      </p>
      <form onSubmit={handleSearch} className="ingredient-form">
        <input
          type="text"
          placeholder="chicken, rice, tomato..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Find Recipes</button>
        <button
          type="button"
          onClick={() => setShowIngredientsChat(true)}
          className="ai-chat-btn"
        >
          🤖 Ask AI Chef
        </button>
      </form>

      {loading && <p>Searching...</p>}
      {error && <p className="error">{error}</p>}

      <div className="recipe-grid">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>
      {searched && !loading && recipes.length === 0 && (
        <p>No matching recipes found. Try different ingredients.</p>
      )}

      {showIngredientsChat && (
        <IngredientsChat onClose={() => setShowIngredientsChat(false)} />
      )}
    </div>
  );
}
