import { useEffect, useRef, useState } from "react";

export function useDraggable() {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const panelRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handlePointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    if (!event.target.closest(".chat-drag-handle")) return;
    if (event.target.closest("button, input, textarea, select, a")) return;
    const panel = panelRef.current;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    dragOffset.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  useEffect(() => {
    if (!isDragging) return undefined;
    const move = (event) => {
      const panel = panelRef.current;
      if (!panel) return;
      const maxX = Math.max(0, window.innerWidth - panel.offsetWidth);
      const maxY = Math.max(0, window.innerHeight - panel.offsetHeight);
      setPosition({
        x: Math.max(0, Math.min(event.clientX - dragOffset.current.x, maxX)),
        y: Math.max(0, Math.min(event.clientY - dragOffset.current.y, maxY)),
      });
      setHasMoved(true);
    };
    const stop = () => setIsDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [isDragging]);

  const style = hasMoved
    ? {
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        margin: 0,
      }
    : {};

  return {
    panelRef,
    style,
    handlers: {
      onPointerDown: handlePointerDown,
    },
    isDragging,
  };
}
