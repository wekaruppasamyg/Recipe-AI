import { Link } from "react-router-dom";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80";

export default function RecipeCard({ recipe }) {
  return (
    <Link to={`/recipe/${recipe.id}`} className="recipe-card">
      <img
        src={recipe.image_url || FALLBACK_IMAGE}
        alt={recipe.title}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = FALLBACK_IMAGE;
        }}
      />
      <div className="recipe-card-body">
        <h3>{recipe.title}</h3>
        <p className="meta">
          {recipe.cuisine} • {recipe.prep_time} min • {recipe.calories} kcal
        </p>
        <p className="recipe-ingredients">{recipe.ingredients}</p>
        {recipe.score !== undefined && (
          <p className="score">Match: {(recipe.score * 100).toFixed(0)}%</p>
        )}
      </div>
    </Link>
  );
}
