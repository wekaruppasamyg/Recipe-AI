import { useState } from "react";
import { api } from "../api/client";
import { useDraggable } from "../hooks/useDraggable";

const welcomeMessage = {
  role: "assistant",
  content: "Hi! Tell me what ingredients you have, and I'll suggest delicious recipes you can make!",
};

export default function IngredientsChat({ onClose }) {
  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { panelRef, style, handlers, isDragging } = useDraggable();

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
      const data = await api.ingredientsChat(nextMessages);
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
        aria-labelledby="ingredients-chat-title"
        onClick={(event) => event.stopPropagation()}
        style={style}
        {...handlers}
      >
        <div className="chat-header chat-drag-handle">
          <div>
            <span className="chat-kicker">RECIPE AI</span>
            <h2 id="ingredients-chat-title">Find Recipes by Ingredients</h2>
            <p className="chat-language-note">English · தமிழ் · മലയാളം · తెలుగు · हिन्दी</p>
          </div>
          <button
            type="button"
            aria-label="Close ingredients chat"
            onClick={onClose}
            className="chat-close-btn"
          >
            ✕
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message chat-message-${msg.role}`}>
              {msg.content}
            </div>
          ))}
          {loading && <div className="chat-message chat-message-assistant">Thinking...</div>}
          {error && <div className="chat-error">{error}</div>}
        </div>

        <form onSubmit={handleSubmit} className="chat-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me your ingredients in your language..."
            disabled={loading}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="chat-submit-btn"
          >
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
