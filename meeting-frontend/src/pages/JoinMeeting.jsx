import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JoinMeeting() {
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  function submit(event) {
    event.preventDefault();
    if (!name.trim() || !roomId.trim()) return;
    sessionStorage.setItem("intellmeet-name", name.trim());
    navigate(`/lobby/${encodeURIComponent(roomId.trim())}`);
  }

  function createRoom() {
    const generated = Math.random().toString(36).slice(2, 10).toUpperCase();
    setRoomId(generated);
  }

  return (
    <main className="join-page">
      <nav className="topbar"><div className="brand-mark">I</div><span>IntellMeet</span><span className="topbar-tag">TEAM COLLABORATION</span></nav>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="status-dot" /> YOUR TEAM, IN SYNC</div>
          <h1>Meet better.<br /><span>Work smarter.</span></h1>
          <p>Bring your team together with secure video meetings, live chat, and a shared space for decisions.</p>
          <div className="feature-pills"><span>● HD video</span><span>● Live chat</span><span>● Screen sharing</span></div>
        </div>
        <form className="join-card" onSubmit={submit}>
          <div className="card-icon">↗</div>
          <h2>Join your meeting</h2>
          <p>Enter your details to continue to the meeting lobby.</p>
          <label>Your name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Devi" required maxLength={50} />
          <label>Meeting ID</label>
          <div className="meeting-id-row"><input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Enter meeting ID" required maxLength={100} /><button type="button" className="generate-button" onClick={createRoom} title="Generate an ID">Generate</button></div>
          <button className="primary-button" type="submit">Continue to lobby <span>→</span></button>
          <div className="secure-note">🔒 Camera and microphone permissions are requested in the lobby.</div>
        </form>
      </section>
      <footer className="page-footer"><span>INTELLMEET · MEMBER 2 MODULE</span><span>Built for focused collaboration</span></footer>
    </main>
  );
}
