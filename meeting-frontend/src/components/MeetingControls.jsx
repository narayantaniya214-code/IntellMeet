export default function MeetingControls({
  micOn, cameraOn, onToggleMic, onToggleCamera,
  onShare, sharing, onLeave
}) {
  return (
    <div className="meeting-controls">
      <button className={micOn ? "control-button" : "control-button off"} onClick={onToggleMic}>
        {micOn ? "🎙 Mic on" : "🔇 Mic off"}
      </button>
      <button className={cameraOn ? "control-button" : "control-button off"} onClick={onToggleCamera}>
        {cameraOn ? "📷 Camera on" : "🚫 Camera off"}
      </button>
      <button className="control-button" onClick={onShare}>
        {sharing ? "Stop sharing" : "🖥 Share screen"}
      </button>
      <button className="control-button leave-button" onClick={onLeave}>Leave meeting</button>
    </div>
  );
}
