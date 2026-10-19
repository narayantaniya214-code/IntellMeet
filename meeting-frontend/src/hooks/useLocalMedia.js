import { useCallback, useEffect, useRef, useState } from "react";

export default function useLocalMedia({ audio = true, video = true } = {}) {
  const streamRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState("");

  const start = useCallback(async () => {
    setError("");
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio, video });
      streamRef.current = media;
      setStream(media);
      return media;
    } catch (err) {
      setError(err?.message || "Could not access camera or microphone.");
      throw err;
    }
  }, [audio, video]);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  return { stream, error, start, stop };
}
