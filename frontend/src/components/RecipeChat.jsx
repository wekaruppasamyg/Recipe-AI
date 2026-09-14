import { useState, useRef, useEffect } from "react";
import { api } from "../api/client";

const welcomeMessage = {
  role: "assistant",
  content: "Hi! I am your AI Chef. Ask me what to cook, how to prepare a dish, or what you can make with the ingredients you have.",
};

export default function RecipeChat({ onClose }) {
  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const panelRef = useRef(null);

  const handleMouseDown = (e) => {
    if (!e.target.closest(".chat-header")) return;
    setIsDragging(true);
    const rect = panelRef.current.getBoundingClientRect();
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!panelRef.current) return;
      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;
      const maxX = window.innerWidth - panelRef.current.offsetWidth;
      const maxY = window.innerHeight - panelRef.current.offsetHeight;
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, offset]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || loading) return;

    const userMessage = { role: "user", content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const data = await api.chat(nextMessages);
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-overlay" role="presentation" onClick={onClose}>
      <section
        ref={panelRef}
        className={`chat-panel ${isDragging ? "dragging" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-title"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={handleMouseDown}
        style={position.x !== 0 || position.y !== 0 ? {
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          margin: 0,
          width: "min(540px, 100vw)",
        } : {}}
      >
        <div className="chat-header">
          <div>
            <span className="chat-kicker">RECIPE AI</span>
            <h2 id="chat-title">Ask your AI Chef</h2>
            <p className="chat-language-note">English · தமிழ் · മലയാളം · తెలుగు · हिन्दी</p>
          </div>
          <button className="chat-close-btn" type="button" onClick={onClose} aria-label="Close chat">
            ✕
          </button>
        </div>

        <div className="chat-messages" aria-live="polite">
          {messages.map((message, index) => (
            <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
              {message.content}
            </div>
          ))}
          {loading && <div className="chat-message assistant">Thinking about that recipe...</div>}
          {error && <p className="chat-error">{error}</p>}
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask in English, Tamil, Malayalam, Telugu, or Hindi..."
            aria-label="Ask the AI Chef"
            className="chat-input"
          />
          <button type="submit" className="chat-submit-btn" disabled={loading || !input.trim()} aria-label="Send message">
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
