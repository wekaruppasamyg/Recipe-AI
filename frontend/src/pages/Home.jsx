import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../AuthContext";
import RecipeCard from "../components/RecipeCard";
import chefImg from "../ai.png";

export default function Home() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        if (user) {
          const data = await api.recommendForUser(user.id, 12);
          setRecipes(data);
        } else {
          const data = await api.listRecipes();
          setRecipes(data);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredRecipes = normalizedQuery
    ? recipes.filter((r) => {
        const searchableText = [r.title, r.ingredients, r.tags, r.cuisine]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchableText.includes(normalizedQuery);
      })
    : recipes;

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">Powered by AI</span>
          <h1 className="hero-title">
            {user ? (
              <>Cooked up for<br />you, {user.name}</>
            ) : (
              <>Recipes picked<br />by AI, just for you</>
            )}
          </h1>
          <p className="hero-subtitle">
            {user
              ? "Fresh recommendations based on what you love to cook."
              : "Log in and let our AI chef turn your ingredients and tastes into your next meal."}
          </p>
          <div className="hero-actions">
            <button type="button" className="hero-cta" onClick={() => window.dispatchEvent(new Event("open-recipe-chat"))}>
              Ask AI Chef
            </button>
            <Link to="/ingredients" className="hero-secondary-cta">
              Find recipes by ingredient
            </Link>
          </div>
          <div className="hero-search">
            <input
              type="text"
              placeholder="Search recipes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="hero-visual">
          <span className="hero-blob blob-a" />
          <span className="hero-blob blob-b" />
          <img src={chefImg} alt="AI chef preparing a dish" className="hero-image" />
        </div>
      </section>

      <section className="recipes-section">
        <h2 className="section-title">
          {normalizedQuery
            ? `Search results for "${query.trim()}"`
            : user
              ? "Recommended for you"
              : "All recipes"}
        </h2>

        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}

        <div className="recipe-grid">
          {filteredRecipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>

        {!loading && filteredRecipes.length === 0 && <p>No recipes found.</p>}
      </section>
    </div>
  );
}
