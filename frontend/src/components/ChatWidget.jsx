import { useEffect, useState } from "react";
import RecipeChat from "./RecipeChat";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const openChat = () => setIsOpen(true);
    window.addEventListener("open-recipe-chat", openChat);
    return () => window.removeEventListener("open-recipe-chat", openChat);
  }, []);

  return (
    <>
      <button
        type="button"
        className="floating-chat-button"
        aria-label="Open AI Chef chat"
        onClick={() => setIsOpen(true)}
      >
        <span className="floating-chat-spark" aria-hidden="true">✦</span>
        <span className="floating-chat-icon" aria-hidden="true">◌</span>
        <span className="floating-chat-label">Ask AI Chef</span>
      </button>
      {isOpen && <RecipeChat onClose={() => setIsOpen(false)} />}
    </>
  );
}
