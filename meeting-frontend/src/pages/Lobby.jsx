import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Lobby() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [error, setError] = useState("");
  const [mediaReady, setMediaReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera preview is not available in this browser or HTTP address. You can still join and use chat; for camera, open in Chrome on localhost or HTTPS.");
      return () => { cancelled = true; };
    }
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setMediaReady(true);
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setError("Camera/microphone access was blocked or this page is not in a secure context. Use localhost or HTTPS, allow permissions, then reload."));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function toggle(kind) {
    const track = kind === "video"
      ? streamRef.current?.getVideoTracks()[0]
      : streamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    if (kind === "video") setCameraOn(track.enabled);
    else setMicOn(track.enabled);
  }

  function join() {
    const stream = streamRef.current;
    if (stream) {
      sessionStorage.setItem("intellmeet-camera", String(cameraOn));
      sessionStorage.setItem("intellmeet-mic", String(micOn));
      // Stop lobby tracks; MeetingRoom will request its own media stream.
      stream.getTracks().forEach((t) => t.stop());
    }
    navigate(`/meeting/${encodeURIComponent(roomId)}`);
  }

  return (
    <main className="app-page">
      <header className="app-header"><a className="brand" href="/join"><span className="brand-mark">I</span> IntellMeet</a><span className="header-chip">MEETING LOBBY</span></header>
      <section className="lobby-layout">
        <div>
          <div className="eyebrow">YOU'RE ALMOST THERE</div>
          <h1>Check your setup</h1>
          <p className="muted">Make sure you look and sound ready before joining.</p>
          <div className="preview-frame">
            <video ref={videoRef} autoPlay muted playsInline />
            {!cameraOn && <div className="camera-off-overlay">Camera is off</div>}
            <div className="preview-name">{sessionStorage.getItem("intellmeet-name") || "You"} · You</div>
          </div>
          {error && <div className="error-box">{error}</div>}
          {!error && !mediaReady && <div className="media-hint">Preparing camera and microphone…</div>}
          <div className="device-row">
            <button className={micOn ? "device-button active" : "device-button"} onClick={() => toggle("audio")}>{micOn ? "🎙 Microphone on" : "🔇 Microphone off"}</button>
            <button className={cameraOn ? "device-button active" : "device-button"} onClick={() => toggle("video")}>{cameraOn ? "📷 Camera on" : "🚫 Camera off"}</button>
          </div>
        </div>
        <aside className="lobby-side-card">
          <div className="room-icon">⌘</div><span className="eyebrow">MEETING ID</span><h2>{roomId}</h2>
          <p className="muted">Share this ID with teammates so they can join the same meeting.</p>
          <div className="lobby-divider" />
          <div className="check-line"><span>✓</span><div><strong>Camera and microphone</strong><small>Browser permission required</small></div></div>
          <div className="check-line"><span>✓</span><div><strong>Live meeting</strong><small>Connect with your team</small></div></div>
          <button className="primary-button" onClick={join}>Join meeting <span>→</span></button>
          <button className="text-button" onClick={() => navigate("/join")}>Back</button>
        </aside>
      </section>
    </main>
  );
}
