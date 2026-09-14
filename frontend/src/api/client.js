const BASE_URL = "https://recipe-ai-da9m.onrender.com";
const API_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  register: (data) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  listRecipes: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/recipes/${qs ? `?${qs}` : ""}`);
  },

  getRecipe: (id) => request(`/recipes/${id}`),

  interact: (data) =>
    request("/recipes/interact", { method: "POST", body: JSON.stringify(data) }),

  getFavorites: (userId) => request(`/recipes/user/${userId}/favorites`),

  recommendByIngredients: (data) =>
    request("/recommend/by-ingredients", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  recommendForUser: (userId, topN = 10) =>
    request(`/recommend/for-user/${userId}?top_n=${topN}`),

  similarRecipes: (recipeId, topN = 5) =>
    request(`/recommend/similar/${recipeId}?top_n=${topN}`),

  chat: (messages) =>
    request("/chat", { method: "POST", body: JSON.stringify({ messages }) }),

  ingredientsChat: (messages) =>
    request("/ingredients-chat", { method: "POST", body: JSON.stringify({ messages }) }),
};
