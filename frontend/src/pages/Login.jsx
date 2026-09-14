import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../AuthContext";
import authBg from "../oe.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await api.login({ email, password });
      login(data.user, data.access_token);
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <main className="auth-page account-page" style={{ backgroundImage: `url(${authBg})` }}>
      <div className="auth-card">
        <p className="auth-card-kicker">WELCOME BACK</p>
        <h1>Log in to SmartRecipe</h1>
        <p className="auth-card-copy">Your saved recipes and preferences are waiting for you.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email address<input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Password<input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          <button type="submit" className="auth-submit">Log in</button>
        </form>

        {error && <p className="error">{error}</p>}
        <p className="auth-footer">
          No account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </main>
  );
}
