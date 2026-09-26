import { useEffect, useRef, useState } from "react";

function Meeting({ onBack }) {
    const videoRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [showChat, setShowChat] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const streamRef = useRef(null);
    const toggleMute = () => {
  if (!streamRef.current) return;

  const audioTrack = streamRef.current.getAudioTracks()[0];

  if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled;
    setIsMuted(!audioTrack.enabled);
  }
};



    const toggleCamera = () => {
      if (!streamRef.current) return;

    const videoTrack = streamRef.current.getVideoTracks()[0];

      if (videoTrack) {
       videoTrack.enabled = !videoTrack.enabled;
       setIsCameraOff(!videoTrack.enabled);
  }
};
    const sendMessage = () => {
  if (message.trim() === "") return;

  setMessages([...messages, message]);
  setMessage("");
};
    const toggleScreenShare = async () => {
  try {
    if (!isScreenSharing) {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      videoRef.current.srcObject = screenStream;
      setIsScreenSharing(true);

      screenStream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
      };
    } else {
      const cameraStream = streamRef.current;

      if (cameraStream) {
        videoRef.current.srcObject = cameraStream;
      }

      setIsScreenSharing(false);
    }
  } catch (error) {
    console.log("Screen sharing cancelled:", error);
  }
};

    useEffect(() => {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
  streamRef.current = stream;
  videoRef.current.srcObject = stream;
  videoRef.current.muted = true;
})
    .catch((error) => {
      console.log("Camera access error:", error);
    });
}, []);
  return (
    <div className="meeting-page">
      <header className="meeting-header">
        <h1>IntellMeet Meeting</h1>

        <button onClick={onBack}>
          Leave Meeting
        </button>
      </header>

      <main className="meeting-content">
        <div className="video-section">
          <div className="video-box">
  <h2>🎥 Your Video</h2>

  <video
    ref={videoRef}
    autoPlay
    playsInline
    muted
    style={{
      width: "100%",
      borderRadius: "10px",
      background: "black",
    }}
  />
</div>

    {showChat && (
  <div className="chat-box">
    <h2>💬 Meeting Chat</h2>

    <div className="chat-messages">
      {messages.map((msg, index) => (
        <p key={index}>{msg}</p>
      ))}
    </div>

    <input
      type="text"
      placeholder="Type a message..."
      value={message}
      onChange={(e) => setMessage(e.target.value)}
    />

    <button onClick={sendMessage}>
      Send
    </button>
  </div>
)}

          <div className="video-box">
            <h2>👤 Participant</h2>
            <p>Participant video will appear here</p>
          </div>
        </div>

        <div className="meeting-controls">
          <button onClick={toggleMute}>
           {isMuted ? "🔇 Unmute" : "🎤 Mute"}
          </button>
          <button onClick={toggleCamera}>
           {isCameraOff ? "📹 Camera On" : "📹 Camera Off"}
          </button>
          <button onClick={toggleScreenShare}>
           {isScreenSharing ? "🛑 Stop Sharing" : "🖥️ Share Screen"}
          </button>
          <button onClick={() => setShowChat(!showChat)}>
           💬 Chat
          </button>
        </div>
      </main>
    </div>
  );
}

export default Meeting;