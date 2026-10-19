import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createSocket } from "../services/socket.js";
import useWebRTC from "../hooks/useWebRTC.js";
import VideoTile from "../components/VideoTile.jsx";
import MeetingControls from "../components/MeetingControls.jsx";
import ChatPanel from "../components/ChatPanel.jsx";

export default function MeetingRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenTrackRef = useRef(null);
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [micOn, setMicOn] = useState(sessionStorage.getItem("intellmeet-mic") !== "false");
  const [cameraOn, setCameraOn] = useState(sessionStorage.getItem("intellmeet-camera") !== "false");
  const [sharing, setSharing] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [mediaError, setMediaError] = useState("");
  const { remotePeers, replaceVideoTrack } = useWebRTC(socket, roomId, localStream);

  useEffect(() => {
    const socket = createSocket();
    socketRef.current = socket;
    setSocket(socket);
    const onCount = (count) => setParticipantCount(count);
    socket.on("room-count", onCount);

    let cancelled = false;
    // Camera access is optional: some Android emulators/HTTP origins block it.
    // Keep the meeting UI usable even when media permissions are unavailable.
    const mediaRequest = navigator.mediaDevices?.getUserMedia
      ? navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      : Promise.reject(new Error("Camera and microphone APIs are unavailable in this browser."));

    mediaRequest
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        stream.getVideoTracks().forEach((t) => { t.enabled = cameraOn; });
        stream.getAudioTracks().forEach((t) => { t.enabled = micOn; });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.warn("Media access unavailable:", err);
        setMediaError("Camera/microphone access is unavailable. You can still use the meeting chat. Open this page in Chrome, allow camera/microphone permissions, and use localhost or HTTPS for camera access.");
      });
    return () => {
      cancelled = true;
      try { socket.emit("leave-room"); } catch {}
      try { socket.disconnect(); } catch {}
      socketRef.current = null;
      // Do not call setState during unmount cleanup.
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenTrackRef.current?.stop();
    };
    // Only initialise media/socket once per room mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  };

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
    }
  };

  const toggleShare = useCallback(async () => {
    if (sharing) {
      screenTrackRef.current?.stop();
      screenTrackRef.current = null;
      setSharing(false);
      const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
      await replaceVideoTrack(cameraTrack || null);
      return;
    }
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      screenTrackRef.current = screenTrack;
      await replaceVideoTrack(screenTrack);
      setSharing(true);
      screenTrack.onended = async () => {
        screenTrackRef.current = null;
        setSharing(false);
        const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
        await replaceVideoTrack(cameraTrack || null);
      };
    } catch (err) {
      if (err?.name !== "NotAllowedError") console.error("Screen sharing failed:", err);
    }
  }, [sharing, replaceVideoTrack]);

  const leaveMeeting = () => {
    navigate(`/summary/${encodeURIComponent(roomId)}`);
  };

  const myName = sessionStorage.getItem("intellmeet-name") || "You";

  return (
    <main className="meeting-page">
      <header className="meeting-header">
        <a className="brand" href="/join"><span className="brand-mark">I</span> IntellMeet</a>
        <div className="meeting-title"><strong>Team meeting</strong><span>Room: {decodeURIComponent(roomId || "")}</span></div>
        <div className="live-status"><span className="status-dot" /> LIVE · {participantCount} participant{participantCount === 1 ? "" : "s"}</div>
      </header>
      {mediaError && <div className="error-box meeting-error">{mediaError}</div>}
      {!mediaError && !localStream && <div className="meeting-loading">Starting your camera and microphone… If prompted, allow browser permissions.</div>}
      {!socket?.connected && <div className="meeting-loading">Connecting to meeting server… If this stays here, start the backend server on port 5000.</div>}
      <div className="meeting-layout">
        <section className="video-area">
          <div className="video-grid">
            <VideoTile stream={localStream} name={`${myName} (You)`} muted />
            {remotePeers.map((peer) => (
              <VideoTile key={peer.socketId} stream={peer.stream} name={peer.displayName || "Participant"} />
            ))}
          </div>
          {remotePeers.length === 0 && <div className="waiting-note">Waiting for someone to join with the same Meeting ID…</div>}
          <MeetingControls
            micOn={micOn}
            cameraOn={cameraOn}
            onToggleMic={toggleMic}
            onToggleCamera={toggleCamera}
            onShare={toggleShare}
            sharing={sharing}
            onLeave={leaveMeeting}
          />
        </section>
        <ChatPanel socket={socket} />
      </div>
      <div className="meeting-footnote">For reliable meetings across restrictive networks, a TURN server may be required.</div>
    </main>
  );
}
