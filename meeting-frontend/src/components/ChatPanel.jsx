import { useEffect, useRef, useState } from "react";

export default function ChatPanel({ socket }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    const onMessage = (message) => setMessages((prev) => [...prev, message]);
    socket.on("chat-message", onMessage);
    return () => {
      socket.off("chat-message", onMessage);
    };
  }, [socket]);

  useEffect(() => {
    // Keep the effect cleanup contract explicit: effects must return either
    // nothing or a cleanup function, never a DOM API return value.
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(event) {
    event.preventDefault();
    if (!draft.trim() || !socket) return;
    socket.emit("chat-message", { text: draft });
    setDraft("");
  }

  return (
    <aside className="chat-panel">
      <div className="panel-heading"><h2>Meeting chat</h2><span>{messages.length} messages</span></div>
      <div className="chat-messages">
        {messages.length === 0 && <p className="empty-state">Messages from this meeting will appear here.</p>}
        {messages.map((msg) => (
          <div className="chat-message" key={msg.id}>
            <div className="chat-meta"><strong>{msg.displayName}</strong><time>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></div>
            <p>{msg.text}</p>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form className="chat-form" onSubmit={sendMessage}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message…" aria-label="Chat message" />
        <button type="submit">Send</button>
      </form>
    </aside>
  );
}
