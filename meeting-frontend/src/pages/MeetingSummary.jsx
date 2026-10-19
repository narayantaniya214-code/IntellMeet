import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// A transparent client-side draft helper for demos. Real AI summaries require a protected backend API.
function makeDraft(text) {
  const clean = text.trim();
  if (!clean) return { summary: "Add meeting notes or a transcript to create a meeting recap.", actions: [] };
  const sentences = clean.split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
  const summary = sentences.slice(0, 4).join(" ");
  const actionPattern = /\b(todo|action|task|follow[- ]?up|will |need to |should |must |deadline|by (monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow))\b/i;
  const actions = sentences.filter((s) => actionPattern.test(s)).slice(0, 6);
  return { summary, actions };
}

export default function MeetingSummary() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");
  const [generated, setGenerated] = useState(false);
  const draft = useMemo(() => makeDraft(notes), [notes]);

  function generateDraft() { setGenerated(true); }

  return (
    <main className="app-page summary-page">
      <header className="app-header"><a className="brand" href="/join"><span className="brand-mark">I</span> IntellMeet</a><span className="header-chip">MEETING WRAP-UP</span></header>
      <section className="summary-container">
        <div className="success-icon">✓</div>
        <div className="eyebrow">MEETING ENDED</div>
        <h1>Nice work, team.</h1>
        <p className="muted">Room {roomId} · Review notes and capture next steps.</p>
        <div className="summary-grid">
          <article className="summary-card">
            <div className="card-topline"><span>✦</span><span className="header-chip">MEETING NOTES</span></div>
            <h2>Transcript &amp; summary</h2>
            <p className="muted">Paste your meeting transcript or notes below. IntellMeet creates a quick local draft and highlights possible action items. This demo does not automatically record or transcribe audio.</p>
            <textarea value={notes} onChange={(e) => { setNotes(e.target.value); setGenerated(false); }} placeholder="Paste meeting notes or transcript here…" rows={7} aria-label="Meeting notes or transcript" />
            <button className="primary-button" onClick={generateDraft}>Create meeting recap <span>→</span></button>
            {generated && <div className="demo-output" aria-live="polite">
              <strong>Summary draft</strong><p>{draft.summary}</p>
              <strong>Possible action items ({draft.actions.length})</strong>
              {draft.actions.length ? <ul>{draft.actions.map((action, i) => <li key={`${i}-${action}`}>{action}</li>)}</ul> : <p>No clear action phrases found. Review the notes and add agreed tasks manually.</p>}
              <small>Draft generated from the text entered on this page; verify before sharing.</small>
            </div>}
          </article>
          <article className="summary-card action-card">
            <div className="card-topline"><span>✓</span><span className="header-chip">NEXT STEPS</span></div>
            <h2>Meeting checklist</h2>
            <div className="action-item"><span className="checkbox" /><div><strong>Review meeting notes</strong><small>Confirm key decisions</small></div></div>
            <div className="action-item"><span className="checkbox" /><div><strong>Assign action owners</strong><small>Add owners and due dates</small></div></div>
            <div className="action-item"><span className="checkbox" /><div><strong>Share decisions with the team</strong><small>Send the recap to participants</small></div></div>
            <button className="secondary-button" onClick={() => navigate("/join")}>Return to IntellMeet</button>
          </article>
        </div>
      </section>
    </main>
  );
}
