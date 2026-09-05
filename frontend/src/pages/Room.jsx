
import socket from "../api/socket";
import api from "../api/api";

import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useParams } from "react-router";
import {
  Play,
  Volume1,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  MonitorUp,
  MonitorOff,
  Users,
  MessageSquare,
  Copy,
  Check,
  AlertCircle,
  X,
  Send,
  LogOut,
  Lock,
  Mic,
  MicOff,
} from "lucide-react";

const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
    { urls: "stun:stun.services.mozilla.com" },
  ],
  sdpSemantics: "unified-plan",
};

// Helper: Munge SDP to force higher video bandwidth (in kbps)
const mungeSdpBitrate = (sdp, bitrateKbps = 8000) => {
  if (!sdp) return sdp;
  let lines = sdp.split("\r\n");
  const videoIndex = lines.findIndex((line) => line.startsWith("m=video"));
  if (videoIndex === -1) return sdp;

  const hasBandwidth = lines.some((line, idx) => idx > videoIndex && line.startsWith("b=AS:"));
  if (!hasBandwidth) {
    lines.splice(videoIndex + 1, 0, `b=AS:${bitrateKbps}`);
  }

  const fmtpLineIndex = lines.findIndex((line, idx) => idx > videoIndex && line.startsWith("a=fmtp:"));
  if (fmtpLineIndex !== -1) {
    lines[fmtpLineIndex] += `;x-google-max-bitrate=${bitrateKbps};x-google-min-bitrate=2500;x-google-start-bitrate=5000`;
  }

  return lines.join("\r\n");
};

// Helper: Apply WebRTC video sender encoding parameters (maintain resolution + max bitrate)
const applyHighQualitySenderParameters = async (pc) => {
  const senders = pc.getSenders();
  const videoSender = senders.find((s) => s.track && s.track.kind === "video");
  if (!videoSender || !videoSender.getParameters) return;

  try {
    const parameters = videoSender.getParameters();
    if (!parameters.encodings || parameters.encodings.length === 0) {
      parameters.encodings = [{}];
    }
    parameters.encodings[0].maxBitrate = 8000000; // 8 Mbps max
    parameters.encodings[0].minBitrate = 2500000; // 2.5 Mbps minimum to prevent low-res degradation
    parameters.encodings[0].scaleResolutionDownBy = 1.0; // Force 100% resolution scaling
    parameters.degradationPreference = "maintain-resolution"; // Prevent WebRTC from dropping 1080p resolution

    await videoSender.setParameters(parameters);
  } catch (err) {
    console.warn("Could not apply WebRTC sender parameters:", err);
  }
};

const Room = () => {
  const { roomId } = useParams();
  const displayName = localStorage.getItem("displayName") || "guest";

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(true);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Screen Share States
  const [screenStream, setScreenStream] = useState(null);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [activePresenter, setActivePresenter] = useState(null);

  // Audio, Voice Volume, Fullscreen, Copy & Private Room States
  const [volume, setVolume] = useState(1);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [voiceVolume, setVoiceVolume] = useState(1);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFsInput, setShowFsInput] = useState(false);
  const [copied, setCopied] = useState(false);

  // Private room unlock states
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  // Voice call states & refs
  const [isMicOn, setIsMicOn] = useState(false);
  const micStreamRef = useRef(null);
  const audioPeerConnections = useRef({});
  const remoteAudioElements = useRef({});
  const pendingAudioCandidates = useRef({});

  const localStreamRef = useRef(null);
  const peerConnections = useRef({});
  const pendingCandidates = useRef({});
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const chatBottomRef = useRef(null);
  const fsBubbleContainerRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    fsBubbleContainerRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream;
      videoRef.current.play().catch((err) => {
        console.warn("Video playback interrupted, retrying muted...", err);
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsAudioMuted(true);
          videoRef.current.play();
        }
      });
    }
  }, [screenStream]);

  // Sync Volume & Mute state to <video> element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isSharingScreen || isAudioMuted;
    }
  }, [volume, isAudioMuted, isSharingScreen]);

  // Sync Voice Call Volume & Mute to remote audio elements
  useEffect(() => {
    Object.values(remoteAudioElements.current).forEach((audioEl) => {
      if (audioEl) {
        audioEl.volume = voiceVolume;
        audioEl.muted = isVoiceMuted;
      }
    });
  }, [voiceVolume, isVoiceMuted]);

  // Fullscreen state listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) {
        setShowFsInput(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Fetch Room Data
  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) {
        setError("Room ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/rooms/get-room/${roomId}`);
        const roomData = response.data.data;
        setRoom(roomData);

        if (roomData.isPrivate) {
          const myRooms = JSON.parse(localStorage.getItem("myRooms") || "[]");
          const alreadySaved = myRooms.some(
            (r) => r.roomCode?.toLowerCase() === roomData.roomCode?.toLowerCase()
          );
          setIsUnlocked(alreadySaved);
        } else {
          setIsUnlocked(true);
        }
      } catch (err) {
        console.error("Get room error:", err);
        setError(err?.response?.data?.message || "Room not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  // Handle Private Room Unlock
  const handleUnlockRoom = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!passwordInput.trim()) {
      setPasswordError("Password is required.");
      return;
    }

    setUnlocking(true);

    try {
      const response = await api.post("/rooms/join-room", {
        roomId: room?.roomCode || roomId,
        password: passwordInput.trim(),
      });

      const data = response.data.data;

      // Save room locally
      const myRooms = JSON.parse(localStorage.getItem("myRooms") || "[]");
      const alreadySaved = myRooms.some((r) => r.roomCode === data.roomCode);

      if (!alreadySaved) {
        myRooms.unshift({
          roomId: data.roomId,
          roomCode: data.roomCode,
          roomName: data.name || "Untitled Room",
          displayName,
          role: "guest",
          createdAt: Date.now(),
        });

        localStorage.setItem("myRooms", JSON.stringify(myRooms.slice(0, 20)));
      }

      setIsUnlocked(true);
    } catch (err) {
      console.error("Unlock room error:", err);
      setPasswordError(
        err?.response?.data?.message || "Incorrect room password."
      );
    } finally {
      setUnlocking(false);
    }
  };

  // Socket Connection
  useEffect(() => {
    if (!roomId || !isUnlocked) return;

    socket.connect();

    const handleConnect = () => {
      socket.emit("join-room", { roomId, displayName });
    };

    socket.on("connect", handleConnect);
    return () => {
      socket.off("connect", handleConnect);
      socket.disconnect();
    };
  }, [roomId, displayName, isUnlocked]);

  // Process queued ICE candidates
  const processPendingCandidates = async (peerSocketId, pc) => {
    if (pendingCandidates.current[peerSocketId]) {
      for (const candidate of pendingCandidates.current[peerSocketId]) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding queued ICE candidate:", err);
        }
      }
      delete pendingCandidates.current[peerSocketId];
    }
  };

  // Stop Screen Share
  const stopScreenShare = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    Object.values(peerConnections.current).forEach((pc) => pc.close());
    peerConnections.current = {};
    pendingCandidates.current = {};

    setScreenStream(null);
    setIsSharingScreen(false);
    setActivePresenter(null);

    socket.emit("stop-screen-share", { roomId });
  }, [roomId]);

  // Presenter: Initiate Offer
  const initiateOffer = useCallback(async (viewerSocketId, stream) => {
    try {
      if (peerConnections.current[viewerSocketId]) {
        peerConnections.current[viewerSocketId].close();
      }

      const pc = new RTCPeerConnection(RTC_CONFIG);
      peerConnections.current[viewerSocketId] = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc-ice-candidate", {
            targetSocketId: viewerSocketId,
            candidate: event.candidate,
            senderSocketId: socket.id,
          });
        }
      };

      const offer = await pc.createOffer({
        offerToReceiveVideo: false,
        offerToReceiveAudio: false,
      });

      const mungedSdp = mungeSdpBitrate(offer.sdp, 8000);
      const mungedOffer = new RTCSessionDescription({
        type: offer.type,
        sdp: mungedSdp,
      });

      await pc.setLocalDescription(mungedOffer);
      await applyHighQualitySenderParameters(pc);

      socket.emit("webrtc-offer", {
        targetSocketId: viewerSocketId,
        offer: mungedOffer,
        senderSocketId: socket.id,
      });
    } catch (err) {
      console.error("Error initiating WebRTC offer:", err);
    }
  }, []);

  // Presenter: Start Sharing Screen
  const handleStartScreenShare = async () => {
    if (activePresenter && activePresenter.socketId !== socket.id) {
      alert(`${activePresenter.displayName} is currently sharing screen.`);
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      alert(
        "Screen sharing is not supported on this browser. On mobile devices, please use modern Chrome for Android or Safari on iOS 13+."
      );
      return;
    }

    let stream = null;

    try {
      // Primary Attempt: Try ideal resolution constraints with audio
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
          displaySurface: "browser",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (primaryErr) {
      console.warn("Primary screen share request failed, attempting mobile fallback...", primaryErr);
      if (primaryErr.name === "NotAllowedError") {
        return; // User canceled the screen share dialog
      }

      try {
        // Fallback Attempt for Mobile (iOS Safari & Android Chrome): video-only without audio or rigid constraints
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
      } catch (fallbackErr) {
        console.error("Mobile fallback screen share error:", fallbackErr);
        if (fallbackErr.name === "NotAllowedError") {
          return;
        }
        alert(
          "Could not start screen share on your mobile device. Please ensure screen recording permissions are allowed in system settings."
        );
        return;
      }
    }

    if (!stream) return;

    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack && "contentHint" in videoTrack) {
      videoTrack.contentHint = "motion";
    }

    localStreamRef.current = stream;
    setScreenStream(stream);
    setIsSharingScreen(true);
    setActivePresenter({ socketId: socket.id, displayName });

    if (videoTrack) {
      videoTrack.onended = () => {
        stopScreenShare();
      };
    }

    socket.emit("start-screen-share", { roomId, displayName });
  };

  // Initiate Audio WebRTC Offer for Voice Call
  const initiateAudioOffer = useCallback(async (targetSocketId, stream) => {
    try {
      if (audioPeerConnections.current[targetSocketId]) {
        audioPeerConnections.current[targetSocketId].close();
      }

      const pc = new RTCPeerConnection(RTC_CONFIG);
      audioPeerConnections.current[targetSocketId] = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("audio-webrtc-ice-candidate", {
            targetSocketId,
            candidate: event.candidate,
            senderSocketId: socket.id,
          });
        }
      };

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          let audioEl = remoteAudioElements.current[targetSocketId];
          if (!audioEl) {
            audioEl = new Audio();
            audioEl.autoplay = true;
            remoteAudioElements.current[targetSocketId] = audioEl;
          }
          audioEl.volume = voiceVolume;
          audioEl.muted = isVoiceMuted;
          audioEl.srcObject = event.streams[0];
          audioEl.play().catch((err) => console.warn("Remote audio play warning:", err));
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("audio-webrtc-offer", {
        targetSocketId,
        offer,
        senderSocketId: socket.id,
      });
    } catch (err) {
      console.error("Error initiating audio WebRTC offer:", err);
    }
  }, []);

  // Toggle Microphone (Voice Call)
  const toggleMicrophone = async () => {
    if (isMicOn) {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
        micStreamRef.current = null;
      }

      Object.values(audioPeerConnections.current).forEach((pc) => pc.close());
      audioPeerConnections.current = {};

      Object.values(remoteAudioElements.current).forEach((audioEl) => {
        audioEl.pause();
        audioEl.srcObject = null;
      });
      remoteAudioElements.current = {};

      setIsMicOn(false);
      setParticipants((prev) =>
        prev.map((p) => (p.socketId === socket.id ? { ...p, isMicOn: false } : p))
      );
      socket.emit("voice-state-changed", { roomId, isMicOn: false });
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;

        stream.getAudioTracks()[0].onended = () => {
          setIsMicOn(false);
          socket.emit("voice-state-changed", { roomId, isMicOn: false });
        };

        setIsMicOn(true);
        setParticipants((prev) =>
          prev.map((p) => (p.socketId === socket.id ? { ...p, isMicOn: true } : p))
        );
        socket.emit("voice-state-changed", { roomId, isMicOn: true });

        // Offer audio stream to all other participants
        participants.forEach((p) => {
          if (p.socketId !== socket.id) {
            initiateAudioOffer(p.socketId, stream);
          }
        });
      } catch (err) {
        console.error("Microphone access error:", err);
        alert("Could not access microphone. Please allow microphone access in your browser.");
      }
    }
  };

  // Volume & Fullscreen Controls
  const handleVolumeChange = (newVal) => {
    const val = Math.max(0, Math.min(1, parseFloat(newVal)));
    setVolume(val);
    setIsAudioMuted(val === 0);
  };

  const adjustVolume = (delta) => {
    handleVolumeChange(volume + delta);
  };

  const toggleMute = () => {
    setIsAudioMuted((prev) => !prev);
  };

  const handleVoiceVolumeChange = (newVal) => {
    const val = Math.max(0, Math.min(1, parseFloat(newVal)));
    setVoiceVolume(val);
    setIsVoiceMuted(val === 0);
  };

  const toggleVoiceMute = () => {
    setIsVoiceMuted((prev) => !prev);
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;

    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch((err) => {
        console.error("Error entering fullscreen:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Error exiting fullscreen:", err);
      });
    }
  };

  // Listen for Participants
  useEffect(() => {
    const handleRoomParticipants = (users) => setParticipants(users);

    const handleUserJoined = (user) => {
      if (!user?.socketId) return;
      setParticipants((prev) => {
        const exists = prev.some((p) => p.socketId === user.socketId);
        return exists ? prev : [...prev, user];
      });
    };

    const handleUserLeft = ({ socketId }) => {
      setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
      if (peerConnections.current[socketId]) {
        peerConnections.current[socketId].close();
        delete peerConnections.current[socketId];
      }
      if (audioPeerConnections.current[socketId]) {
        audioPeerConnections.current[socketId].close();
        delete audioPeerConnections.current[socketId];
      }
      if (remoteAudioElements.current[socketId]) {
        remoteAudioElements.current[socketId].pause();
        remoteAudioElements.current[socketId].srcObject = null;
        delete remoteAudioElements.current[socketId];
      }
    };

    socket.on("room-participants", handleRoomParticipants);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.off("room-participants", handleRoomParticipants);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
    };
  }, []);

  // Audio WebRTC Signaling Listeners (Voice Call)
  useEffect(() => {
    const handleVoiceStateChanged = ({ socketId, isMicOn }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isMicOn } : p))
      );
    };

    const handleAudioOffer = async ({ senderSocketId, offer }) => {
      try {
        if (audioPeerConnections.current[senderSocketId]) {
          audioPeerConnections.current[senderSocketId].close();
        }

        const pc = new RTCPeerConnection(RTC_CONFIG);
        audioPeerConnections.current[senderSocketId] = pc;

        if (micStreamRef.current) {
          micStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, micStreamRef.current));
        }

        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            let audioEl = remoteAudioElements.current[senderSocketId];
            if (!audioEl) {
              audioEl = new Audio();
              audioEl.autoplay = true;
              remoteAudioElements.current[senderSocketId] = audioEl;
            }
            audioEl.volume = voiceVolume;
            audioEl.muted = isVoiceMuted;
            audioEl.srcObject = event.streams[0];
            audioEl.play().catch((e) => console.warn("Remote audio play warning:", e));
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("audio-webrtc-ice-candidate", {
              targetSocketId: senderSocketId,
              candidate: event.candidate,
              senderSocketId: socket.id,
            });
          }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        if (pendingAudioCandidates.current[senderSocketId]) {
          for (const cand of pendingAudioCandidates.current[senderSocketId]) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (e) {
              console.error("Error adding audio candidate:", e);
            }
          }
          delete pendingAudioCandidates.current[senderSocketId];
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("audio-webrtc-answer", {
          targetSocketId: senderSocketId,
          answer,
          senderSocketId: socket.id,
        });
      } catch (err) {
        console.error("Error handling audio offer:", err);
      }
    };

    const handleAudioAnswer = async ({ senderSocketId, answer }) => {
      const pc = audioPeerConnections.current[senderSocketId];
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          if (pendingAudioCandidates.current[senderSocketId]) {
            for (const cand of pendingAudioCandidates.current[senderSocketId]) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
              } catch (e) {
                console.error("Error adding audio candidate:", e);
              }
            }
            delete pendingAudioCandidates.current[senderSocketId];
          }
        } catch (err) {
          console.error("Audio answer error:", err);
        }
      }
    };

    const handleAudioIceCandidate = async ({ senderSocketId, candidate }) => {
      const pc = audioPeerConnections.current[senderSocketId];
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Audio ICE candidate error:", err);
        }
      } else {
        if (!pendingAudioCandidates.current[senderSocketId]) {
          pendingAudioCandidates.current[senderSocketId] = [];
        }
        pendingAudioCandidates.current[senderSocketId].push(candidate);
      }
    };

    socket.on("user-voice-state-changed", handleVoiceStateChanged);
    socket.on("audio-webrtc-offer", handleAudioOffer);
    socket.on("audio-webrtc-answer", handleAudioAnswer);
    socket.on("audio-webrtc-ice-candidate", handleAudioIceCandidate);

    return () => {
      socket.off("user-voice-state-changed", handleVoiceStateChanged);
      socket.off("audio-webrtc-offer", handleAudioOffer);
      socket.off("audio-webrtc-answer", handleAudioAnswer);
      socket.off("audio-webrtc-ice-candidate", handleAudioIceCandidate);
    };
  }, []);

  // WebRTC Signaling Listeners
  useEffect(() => {
    const handleScreenShareStarted = ({ presenterSocketId, displayName }) => {
      setActivePresenter({ socketId: presenterSocketId, displayName });

      if (presenterSocketId !== socket.id) {
        socket.emit("request-screen-stream", { presenterSocketId });
      }
    };

    const handleRequestScreenStream = ({ viewerSocketId }) => {
      if (localStreamRef.current) {
        initiateOffer(viewerSocketId, localStreamRef.current);
      }
    };

    const handleScreenShareStopped = () => {
      setActivePresenter(null);
      setScreenStream(null);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      setIsSharingScreen(false);
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
      pendingCandidates.current = {};
    };

    const handleOffer = async ({ senderSocketId, offer }) => {
      try {
        if (peerConnections.current[senderSocketId]) {
          peerConnections.current[senderSocketId].close();
        }

        const pc = new RTCPeerConnection(RTC_CONFIG);
        peerConnections.current[senderSocketId] = pc;

        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            setScreenStream(event.streams[0]);
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("webrtc-ice-candidate", {
              targetSocketId: senderSocketId,
              candidate: event.candidate,
              senderSocketId: socket.id,
            });
          }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await processPendingCandidates(senderSocketId, pc);

        const answer = await pc.createAnswer();
        const mungedSdp = mungeSdpBitrate(answer.sdp, 8000);
        const mungedAnswer = new RTCSessionDescription({
          type: answer.type,
          sdp: mungedSdp,
        });

        await pc.setLocalDescription(mungedAnswer);

        socket.emit("webrtc-answer", {
          targetSocketId: senderSocketId,
          answer: mungedAnswer,
          senderSocketId: socket.id,
        });
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    };

    const handleAnswer = async ({ senderSocketId, answer }) => {
      const pc = peerConnections.current[senderSocketId];
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          await processPendingCandidates(senderSocketId, pc);
          await applyHighQualitySenderParameters(pc);
        } catch (err) {
          console.error("Error setting answer remote description:", err);
        }
      }
    };

    const handleIceCandidate = async ({ senderSocketId, candidate }) => {
      const pc = peerConnections.current[senderSocketId];
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ice candidate:", err);
        }
      } else {
        if (!pendingCandidates.current[senderSocketId]) {
          pendingCandidates.current[senderSocketId] = [];
        }
        pendingCandidates.current[senderSocketId].push(candidate);
      }
    };

    socket.on("screen-share-started", handleScreenShareStarted);
    socket.on("request-screen-stream", handleRequestScreenStream);
    socket.on("screen-share-stopped", handleScreenShareStopped);
    socket.on("webrtc-offer", handleOffer);
    socket.on("webrtc-answer", handleAnswer);
    socket.on("webrtc-ice-candidate", handleIceCandidate);

    return () => {
      socket.off("screen-share-started", handleScreenShareStarted);
      socket.off("request-screen-stream", handleRequestScreenStream);
      socket.off("screen-share-stopped", handleScreenShareStopped);
      socket.off("webrtc-offer", handleOffer);
      socket.off("webrtc-answer", handleAnswer);
      socket.off("webrtc-ice-candidate", handleIceCandidate);
    };
  }, [initiateOffer]);

  // Chat Effect
  useEffect(() => {
    const handleReceiveMessage = (data) => setMessages((prev) => [...prev, data]);
    socket.on("receive-message", handleReceiveMessage);
    return () => socket.off("receive-message", handleReceiveMessage);
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;

    socket.emit("send-message", {
      roomId,
      displayName,
      message: text,
      socketId: socket.id,
    });
    setMessage("");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090d] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-violet-500" />
          <p className="mt-4 text-sm text-gray-400">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090d] px-5 text-white">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-pink-500/10 shadow-lg text-red-400">
            <AlertCircle size={32} />
          </div>
          <h2 className="mt-5 text-xl font-semibold">Room not found</h2>
          <p className="mt-2 text-sm text-gray-500">{error || "This room does not exist."}</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-violet-500"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!isUnlocked && room?.isPrivate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090d] px-5 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.025] p-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-400/10 via-blue-500/10 to-violet-500/10 shadow-lg shadow-violet-500/5">
            <Lock size={26} className="text-violet-300" strokeWidth={1.8} />
          </div>

          <h2 className="text-2xl font-bold">This Room is Private</h2>
          <p className="mt-2 text-xs text-gray-400">
            Enter the password to access <span className="font-semibold text-white">{room.roomName}</span>.
          </p>

          <form onSubmit={handleUnlockRoom} className="mt-6 space-y-4 text-left">
            {passwordError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                {passwordError}
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-300">
                Room Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                autoFocus
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition focus:border-violet-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={unlocking}
              className="w-full rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold shadow-lg transition hover:bg-violet-500 disabled:opacity-60"
            >
              {unlocking ? "Verifying..." : "Unlock Room →"}
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-4 text-center">
            <Link to="/" className="text-xs text-gray-500 hover:text-white transition">
              ← Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090d] text-white">
      {/* NAVBAR */}
      <nav className="border-b border-white/10 bg-[#08090d]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-5">
          {/* Viewly Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
                          src="/logo.png"
                          alt="Viewly"
                          className="h-11 w-11 rounded-full object-cover"
                        />
            <span className="text-lg font-black tracking-tight text-white sm:text-xl">
              Viewly</span>

          </Link>

          {/* Room Code Pill */}
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Room Code</span>
            <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 font-mono text-sm text-violet-300">
              {room.roomCode}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(room.roomCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy Code"}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMicrophone}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition ${
                isMicOn
                  ? "border border-green-500/30 bg-green-500/15 text-green-400 hover:bg-green-500/25"
                  : "border border-white/10 bg-white/[0.04] text-gray-300 hover:bg-white/10"
              }`}
              title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
            >
              {isMicOn ? (
                <Mic size={16} className="text-green-400 animate-pulse" />
              ) : (
                <MicOff size={16} />
              )}
              <span className="hidden sm:inline">{isMicOn ? "Mic On" : "Mic Off"}</span>
            </button>

            <button
              onClick={() => setShowParticipants((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs sm:text-sm font-medium transition hover:bg-white/10"
            >
              <Users size={16} className="text-violet-400" />
              <span>{participants.length}</span>
            </button>
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs sm:text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
            >
              <LogOut size={15} />
              <span>Leave</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <main className="mx-auto max-w-[1400px] p-3 sm:p-5 lg:p-6">
        <div
          className={`grid gap-4 lg:gap-5 ${
            showParticipants ? "lg:grid-cols-[minmax(0,1fr)_320px]" : "lg:grid-cols-1"
          }`}
        >
          {/* LEFT COLUMN: VIDEO + CHAT */}
          <div className="min-w-0 space-y-4 sm:space-y-5">
            {/* VIDEO SECTION */}
            <section className="overflow-hidden rounded-xl border border-white/10 bg-[#101117] sm:rounded-2xl shadow-xl">
              <div
                ref={videoContainerRef}
                className="group relative aspect-video max-h-[380px] sm:max-h-[440px] w-full bg-black mx-auto flex items-center justify-center"
              >
                {screenStream ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      webkit-playsinline="true"
                      x5-playsinline="true"
                      className="h-full w-full object-contain"
                    />

                    {/* MOBILE / VIEWER TAP TO UNMUTE OVERLAY BADGE */}
                    {isAudioMuted && !isSharingScreen && (
                      <button
                        onClick={() => {
                          setIsAudioMuted(false);
                          setVolume(1);
                        }}
                        className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-600/90 px-3.5 py-1.5 text-xs font-bold text-white shadow-xl backdrop-blur transition hover:bg-violet-500 active:scale-95"
                      >
                        <VolumeX size={15} />
                        <span>Tap for Audio</span>
                      </button>
                    )}

                    {/* FULLSCREEN FLOATING LIVE CHAT */}
                    {isFullscreen && (
                      <div className="absolute bottom-16 right-4 z-30 flex max-w-sm sm:max-w-md flex-col items-end gap-2.5 pointer-events-auto">
                        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto no-scrollbar pr-1 w-full items-end">
                          {messages.slice(-5).map((msg, i) => {
                            const isMe = msg.socketId === socket.id;
                            return (
                              <div
                                key={i}
                                className={`flex items-start gap-2.5 rounded-2xl px-4 py-2.5 text-sm sm:text-base font-medium shadow-2xl backdrop-blur-xl transition-all ${
                                  isMe
                                    ? "bg-violet-600/85 border border-violet-400/40 text-white"
                                    : "bg-black/80 border border-white/20 text-gray-100"
                                }`}
                              >
                                <span className={`font-bold shrink-0 ${isMe ? "text-violet-200" : "text-cyan-300"}`}>
                                  {isMe ? "You" : msg.displayName}:
                                </span>
                                <span className="break-words leading-snug">{msg.message}</span>
                              </div>
                            );
                          })}
                          <div ref={fsBubbleContainerRef} />
                        </div>

                        {/* Fullscreen Input Trigger */}
                        {showFsInput ? (
                          <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
                            <input
                              type="text"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Type a message..."
                              autoFocus
                              className="min-w-0 flex-1 rounded-xl border border-white/25 bg-black/90 px-4 py-2.5 text-sm text-white placeholder-gray-400 outline-none backdrop-blur-md focus:border-violet-500"
                            />
                            <button
                              type="submit"
                              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-violet-500"
                            >
                              Send
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowFsInput(false)}
                              className="rounded-xl bg-white/10 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/20"
                            >
                              <X size={16} />
                            </button>
                          </form>
                        ) : (
                          <button
                            onClick={() => setShowFsInput(true)}
                            className="flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs sm:text-sm font-semibold text-white/90 backdrop-blur-md transition hover:bg-black/85 hover:text-white"
                          >
                            <MessageSquare size={15} className="text-violet-400" />
                            <span>Send chat message...</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* VIDEO CONTROLS OVERLAY WITH DUAL SOUND BARS & MIC TOGGLE */}
                    <div className="absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:p-4">
                      
                      {/* LEFT: DUAL SOUND BARS (VIDEO + VOICE CALL) */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        
                        {/* 1. SCREEN VIDEO SOUND CONTROL */}
                        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-md" title="Screen Shared Video Volume">
                          <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">Video</span>
                          <button
                            onClick={toggleMute}
                            className="p-0.5 text-gray-300 transition hover:text-white"
                            title={isAudioMuted ? "Unmute Video" : "Mute Video"}
                          >
                            {isAudioMuted || isSharingScreen || volume === 0 ? (
                              <VolumeX size={15} className="text-red-400" />
                            ) : (
                              <Volume2 size={15} className="text-violet-400" />
                            )}
                          </button>

                          {!isSharingScreen && (
                            <div className="relative flex items-center w-16 sm:w-24 cursor-pointer group/bar">
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.02"
                                value={isAudioMuted ? 0 : volume}
                                onChange={(e) => handleVolumeChange(e.target.value)}
                                className="absolute inset-0 z-10 w-full opacity-0 cursor-pointer"
                                title="Video Volume"
                              />
                              <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-75"
                                  style={{ width: `${isAudioMuted ? 0 : volume * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                          <span className="w-8 font-mono text-[11px] text-gray-300 text-right font-medium">
                            {isAudioMuted ? "Mute" : `${Math.round(volume * 100)}%`}
                          </span>
                        </div>

                        {/* 2. FRIENDS VOICE CALL SOUND CONTROL */}
                        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-md" title="Friends Voice Call Volume">
                          <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Voice</span>
                          <button
                            onClick={toggleVoiceMute}
                            className="p-0.5 text-gray-300 transition hover:text-white"
                            title={isVoiceMuted ? "Unmute Voice Call" : "Mute Voice Call"}
                          >
                            {isVoiceMuted || voiceVolume === 0 ? (
                              <VolumeX size={15} className="text-red-400" />
                            ) : (
                              <Volume2 size={15} className="text-cyan-400" />
                            )}
                          </button>

                          <div className="relative flex items-center w-16 sm:w-24 cursor-pointer group/bar">
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.02"
                              value={isVoiceMuted ? 0 : voiceVolume}
                              onChange={(e) => handleVoiceVolumeChange(e.target.value)}
                              className="absolute inset-0 z-10 w-full opacity-0 cursor-pointer"
                              title="Friends Voice Call Volume"
                            />
                            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-75"
                                style={{ width: `${isVoiceMuted ? 0 : voiceVolume * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="w-8 font-mono text-[11px] text-gray-300 text-right font-medium">
                            {isVoiceMuted ? "Mute" : `${Math.round(voiceVolume * 100)}%`}
                          </span>
                        </div>
                      </div>

                      {/* RIGHT: MIC ON/OFF & FULLSCREEN TOGGLE */}
                      <div className="flex items-center gap-2">
                        {/* MIC ON/OFF IN FULLSCREEN/OVERLAY */}
                        <button
                          onClick={toggleMicrophone}
                          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-md backdrop-blur ${
                            isMicOn
                              ? "border border-green-500/40 bg-green-600/80 text-white hover:bg-green-500"
                              : "border border-white/20 bg-white/10 text-gray-200 hover:bg-white/20"
                          }`}
                          title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                        >
                          {isMicOn ? (
                            <Mic size={15} className="text-white animate-pulse" />
                          ) : (
                            <MicOff size={15} />
                          )}
                          <span>{isMicOn ? "Mic On" : "Mic Off"}</span>
                        </button>

                        {/* FULLSCREEN TOGGLE */}
                        <button
                          onClick={toggleFullscreen}
                          className="flex items-center gap-1.5 rounded-xl bg-violet-600/90 px-3.5 py-2 text-xs font-bold text-white shadow-lg backdrop-blur transition hover:bg-violet-500"
                          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        >
                          {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
                          <span className="hidden sm:inline">
                            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="px-5 text-center">
                      <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 shadow-lg text-violet-400">
                        <Play size={32} fill="currentColor" className="ml-1" />
                      </div>
                      <h2 className="mt-4 text-lg font-semibold sm:mt-5 sm:text-xl">
                        {room.roomName}
                      </h2>
                      <p className="mt-2 text-xs text-gray-500 sm:text-sm">
                        No screen sharing active
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* VIDEO INFO BAR */}
              <div className="flex flex-col gap-3 border-t border-white/10 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-bold sm:text-base">
                    {room.roomName}
                  </h2>
                  <p className="mt-1 flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                    <span>{participants.length} people in room</span>
                    {activePresenter && (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-violet-500/20 px-2 py-0.5 text-violet-400 font-medium">
                        <MonitorUp size={13} /> {activePresenter.displayName} is sharing screen
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  {isSharingScreen ? (
                    <button
                      onClick={stopScreenShare}
                      className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:bg-red-500"
                    >
                      <MonitorOff size={16} />
                      <span>Stop Sharing</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStartScreenShare}
                      disabled={!!activePresenter}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition shadow-lg ${
                        activePresenter
                          ? "cursor-not-allowed bg-gray-800 text-gray-500"
                          : "bg-violet-600 text-white hover:bg-violet-500"
                      }`}
                    >
                      <MonitorUp size={16} />
                      <span>{activePresenter ? "Screen Share Active" : "Share Screen"}</span>
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* LIVE CHAT */}
            <section className="flex h-[360px] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#101117] sm:h-[420px] sm:rounded-2xl shadow-xl">
              <div className="shrink-0 border-b border-white/10 p-4 sm:p-5">
                <h2 className="font-bold flex items-center gap-2">
                  <MessageSquare size={16} className="text-violet-400" />
                  Live Room Chat
                </h2>
              </div>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto no-scrollbar p-4 sm:p-5">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-center text-xs text-gray-600 sm:text-sm">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.socketId === socket.id;
                    return (
                      <div
                        key={index}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div className="max-w-[85%] sm:max-w-[75%]">
                          <p
                            className={`mb-1 text-xs font-semibold ${
                              isMe ? "text-right text-violet-400" : "text-left text-cyan-400"
                            }`}
                          >
                            {isMe ? "You" : msg.displayName}
                          </p>
                          <div
                            className={`rounded-xl px-3.5 py-2 text-sm leading-relaxed ${
                              isMe
                                ? "rounded-tr-xs bg-violet-600 text-white"
                                : "rounded-tl-xs bg-white/[0.06] text-gray-200"
                            }`}
                          >
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              <form
                onSubmit={handleSendMessage}
                className="flex shrink-0 gap-2 border-t border-white/10 p-3 sm:p-4"
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#08090d] px-3.5 py-3 text-sm outline-none placeholder:text-gray-600 focus:border-violet-500/50 sm:px-4"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-violet-500 sm:px-5"
                >
                  <Send size={15} />
                  <span>Send</span>
                </button>
              </form>
            </section>
          </div>

          {/* PARTICIPANTS SIDEBAR */}
          {showParticipants && (
            <aside className="h-fit overflow-hidden rounded-xl border border-white/10 bg-[#101117] sm:rounded-2xl shadow-xl">
              <div className="border-b border-white/10 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold flex items-center gap-2">
                      <Users size={16} className="text-violet-400" />
                      Participants
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">{participants.length} people</p>
                  </div>
                  <button
                    onClick={() => setShowParticipants(false)}
                    className="p-1 text-gray-500 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3.5 p-4 sm:p-5">
                {participants.map((user) => (
                  <div key={user.socketId} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-bold text-white">
                          {user.displayName?.[0]?.toUpperCase()}
                        </div>
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#101117] bg-green-400" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{user.displayName}</p>
                        {user.socketId === socket.id && (
                          <p className="text-xs font-semibold text-violet-400">You</p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {user.isMicOn || (user.socketId === socket.id && isMicOn) ? (
                        <span className="flex items-center gap-1 rounded-md border border-green-500/30 bg-green-500/15 px-2 py-0.5 text-[11px] font-medium text-green-400">
                          <Mic size={11} className="animate-pulse text-green-400" /> Speaking
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-md border border-white/5 bg-white/[0.04] px-1.5 py-0.5 text-[11px] text-gray-500">
                          <MicOff size={11} /> Muted
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
};

export default Room;
