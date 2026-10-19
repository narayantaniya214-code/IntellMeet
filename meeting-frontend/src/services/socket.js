import { io } from "socket.io-client";

// Desktop localhost, Android emulator (10.0.2.2), and phones on the same Wi-Fi
// can all use the host serving the frontend. Override with VITE_SIGNALING_URL if needed.
const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || `http://${host}:5000`;

export function createSocket() {
  return io(SIGNALING_URL, {
    transports: ["websocket", "polling"],
    autoConnect: true
  });
}
