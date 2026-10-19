import { Component } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import JoinMeeting from "./pages/JoinMeeting.jsx";
import Lobby from "./pages/Lobby.jsx";
import MeetingRoom from "./pages/MeetingRoom.jsx";
import MeetingSummary from "./pages/MeetingSummary.jsx";

class AppErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("IntellMeet page crashed:", error, info); }
  render() {
    if (this.state.error) return (
      <main className="runtime-error-page">
        <div className="runtime-error-card">
          <div className="brand"><span className="brand-mark">I</span> IntellMeet</div>
          <h1>Meeting page could not load</h1>
          <p>An application error occurred. Refresh the page once. If it continues, open DevTools → Console and share the red error with your project developer.</p>
          <pre>{String(this.state.error?.message || this.state.error)}</pre>
          <button className="primary-button" onClick={() => window.location.reload()}>Reload meeting <span>↻</span></button>
          <a className="text-button" href="/join">Back to home</a>
        </div>
      </main>
    );
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to="/join" replace />} />
        <Route path="/join" element={<JoinMeeting />} />
        <Route path="/lobby/:roomId" element={<Lobby />} />
        <Route path="/meeting/:roomId" element={<MeetingRoom />} />
        <Route path="/summary/:roomId" element={<MeetingSummary />} />
        <Route path="*" element={<Navigate to="/join" replace />} />
      </Routes>
    </AppErrorBoundary>
  );
}
