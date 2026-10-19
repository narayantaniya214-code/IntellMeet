import { useCallback, useEffect, useRef, useState } from "react";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" }
];

export default function useWebRTC(socket, roomId, localStream) {
  const peersRef = useRef(new Map());
  const [remotePeers, setRemotePeers] = useState([]);
  const localStreamRef = useRef(localStream);

  useEffect(() => {
    localStreamRef.current = localStream;
    // If a participant's media becomes available after joining, add its tracks
    // to existing peer connections without tearing down signalling listeners.
    if (localStream) {
      for (const pc of peersRef.current.values()) {
        const senders = pc.getSenders();
        for (const track of localStream.getTracks()) {
          if (!senders.some((sender) => sender.track?.id === track.id)) {
            try { pc.addTrack(track, localStream); }
            catch (err) { console.warn("Could not add local media track:", err); }
          }
        }
      }
    }
  }, [localStream]);

  const updatePeer = useCallback((peerId, data) => {
    setRemotePeers((prev) => {
      const map = new Map(prev.map((p) => [p.socketId, p]));
      map.set(peerId, { ...(map.get(peerId) || {}), socketId: peerId, ...data });
      return [...map.values()];
    });
  }, []);

  const removePeer = useCallback((peerId) => {
    const pc = peersRef.current.get(peerId);
    if (pc) pc.close();
    peersRef.current.delete(peerId);
    setRemotePeers((prev) => prev.filter((p) => p.socketId !== peerId));
  }, []);

  const createPeer = useCallback((peerId, shouldOffer) => {
    if (peersRef.current.has(peerId)) return peersRef.current.get(peerId);
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peersRef.current.set(peerId, pc);

    localStreamRef.current?.getTracks().forEach((track) => {
      try { pc.addTrack(track, localStreamRef.current); }
      catch (err) { console.warn("Could not attach local media track:", err); }
    });

    pc.ontrack = (event) => {
      const stream = event.streams?.[0];
      if (stream) updatePeer(peerId, { stream });
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) socket.emit("webrtc-ice-candidate", {
        to: peerId, candidate: event.candidate
      });
    };

    pc.onconnectionstatechange = () => {
      if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
        // Keep disconnected peers visible briefly; user-left event removes them.
      }
    };

    if (shouldOffer) {
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer).then(() => offer))
        .then((offer) => socket.emit("webrtc-offer", { to: peerId, offer }))
        .catch((err) => console.error("Could not create WebRTC offer:", err));
    }
    return pc;
  }, [socket, updatePeer]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const onRoomUsers = (users) => {
      users.forEach((user) => {
        updatePeer(user.socketId, { displayName: user.displayName });
        createPeer(user.socketId, true);
      });
    };

    const onUserJoined = ({ socketId, displayName }) => {
      updatePeer(socketId, { displayName });
    };

    const onOffer = async ({ from, offer, displayName }) => {
      updatePeer(from, { displayName });
      const pc = createPeer(from, false);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc-answer", { to: from, answer });
      } catch (err) {
        console.error("Could not answer WebRTC offer:", err);
      }
    };

    const onAnswer = async ({ from, answer }) => {
      const pc = peersRef.current.get(from);
      if (pc && !pc.currentRemoteDescription) {
        try { await pc.setRemoteDescription(new RTCSessionDescription(answer)); }
        catch (err) { console.error("Could not set WebRTC answer:", err); }
      }
    };

    const onCandidate = async ({ from, candidate }) => {
      const pc = peersRef.current.get(from);
      if (!pc || !candidate) return;
      try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
      catch (err) { console.warn("ICE candidate could not be added:", err); }
    };

    const onUserLeft = ({ socketId }) => removePeer(socketId);

    socket.on("room-users", onRoomUsers);
    socket.on("user-joined", onUserJoined);
    socket.on("webrtc-offer", onOffer);
    socket.on("webrtc-answer", onAnswer);
    socket.on("webrtc-ice-candidate", onCandidate);
    socket.on("user-left", onUserLeft);

    socket.emit("join-room", {
      roomId,
      displayName: sessionStorage.getItem("intellmeet-name") || "Guest"
    });

    return () => {
      socket.off("room-users", onRoomUsers);
      socket.off("user-joined", onUserJoined);
      socket.off("webrtc-offer", onOffer);
      socket.off("webrtc-answer", onAnswer);
      socket.off("webrtc-ice-candidate", onCandidate);
      socket.off("user-left", onUserLeft);
      for (const pc of peersRef.current.values()) {
        try { pc.ontrack = null; pc.onicecandidate = null; pc.close(); }
        catch (err) { console.warn("Peer cleanup issue:", err); }
      }
      peersRef.current.clear();
      setRemotePeers([]);
    };
  }, [socket, roomId, createPeer, removePeer, updatePeer]);

  const replaceVideoTrack = useCallback(async (track) => {
    for (const pc of peersRef.current.values()) {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender) await sender.replaceTrack(track);
      else if (track && localStreamRef.current) pc.addTrack(track, localStreamRef.current);
    }
  }, []);

  return { remotePeers, replaceVideoTrack };
}
