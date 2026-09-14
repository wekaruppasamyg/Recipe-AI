import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import IngredientSearch from "./pages/IngredientSearch";
import RecipeDetail from "./pages/RecipeDetail";
import Favorites from "./pages/Favorites";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatWidget from "./components/ChatWidget";
import "./index.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ingredients" element={<IngredientSearch />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        <footer className="site-footer">© {new Date().getFullYear()} Smart Recipe AI</footer>
        <ChatWidget />
      </BrowserRouter>
    </AuthProvider>
  );
}
