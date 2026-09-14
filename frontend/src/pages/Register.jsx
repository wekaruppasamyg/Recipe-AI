import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../AuthContext";
import authBg from "../oe.jpg";

export default function Register() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", dietary_pref: "none", allergies: "",
  });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await api.register(form);
      login(data.user, data.access_token);
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <main className="auth-page account-page" style={{ backgroundImage: `url(${authBg})` }}>
      <div className="auth-card">
        <p className="auth-card-kicker">START COOKING</p>
        <h1>Create your account</h1>
        <p className="auth-card-copy">Save favourites and receive recipe ideas shaped around you.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Full name<input name="name" placeholder="Your name" value={form.name} onChange={handleChange} required /></label>
          <label>Email address<input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required /></label>
          <label>Password<input name="password" type="password" placeholder="Create a password" value={form.password} onChange={handleChange} required /></label>
          <label>Diet preference<select name="dietary_pref" value={form.dietary_pref} onChange={handleChange}>
            <option value="none">No preference</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="keto">Keto</option>
            <option value="non-veg">Non-Vegetarian</option>
          </select></label>
          <label>Allergies <span className="optional">(optional)</span><input name="allergies" placeholder="e.g. nuts, dairy" value={form.allergies} onChange={handleChange} /></label>
          <button type="submit" className="auth-submit">Create account</button>
        </form>

        {error && <p className="error">{error}</p>}
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </main>
  );
}
