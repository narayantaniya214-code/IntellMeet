import { useEffect, useRef } from "react";

export default function VideoTile({ stream, name, muted = false, placeholder = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream || null;
  }, [stream]);

  return (
    <div className="video-tile">
      {stream && !placeholder ? (
        <video ref={videoRef} autoPlay playsInline muted={muted} />
      ) : (
        <div className="avatar-placeholder">{(name || "G").slice(0, 1).toUpperCase()}</div>
      )}
      <span className="video-name">{name || "Participant"}</span>
    </div>
  );
}
