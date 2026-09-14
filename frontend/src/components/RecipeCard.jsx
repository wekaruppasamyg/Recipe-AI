import { Link } from "react-router-dom";

export default function RecipeCard({ recipe }) {
  return (
    <Link to={`/recipe/${recipe.id}`} className="recipe-card">
      <img
        src={recipe.image_url || "https://placehold.co/300x200?text=Recipe"}
        alt={recipe.title}
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
