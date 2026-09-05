# Viewly

![Viewly Logo](./assets/logo.png)

## What is Viewly?
Viewly is a **real‑time video conferencing and screen‑sharing** web application that runs entirely in the browser. Users can create a virtual “room”, invite participants via a short URL, and start high‑quality video calls with optional screen sharing—both from desktop and mobile devices. The app is built as a Single‑Page Application (SPA) and requires no native client or plug‑ins.

## Features
- **High‑definition video** – up to 1080p with adaptive bitrate to keep the stream smooth.
- **Screen sharing** – works on desktop browsers and falls back gracefully on mobile browsers.
- **Mobile‑friendly playback** – `playsInline`, `webkit‑playsinline`, and `x5‑playsinline` enable autoplay without user interaction.
- **Real‑time chat** – Socket.io powered text chat alongside video.
- **SPA routing** – Deep links (`/room/:id`) work on page reloads thanks to Vercel/Netlify rewrite rules.
- **Environment‑agnostic deployment** – Deploy on Vercel, Netlify, Render, Cloudflare, or any static‑host with a simple server for the backend.

## How the Application Works
1. A user creates a **room**; the backend generates a unique room ID.
2. Participants join the room by navigating to `/room/<room‑id>`.
3. When a user starts a call, a **WebRTC peer‑connection** is created.
4. **Socket.io** handles the signaling exchange (SDP offers/answers and ICE candidates) and routes chat messages.
5. The media streams (camera, microphone, or screen) are attached to the peer‑connection and rendered in `<video>` elements.
6. When a participant leaves or ends screen sharing, the connection is closed cleanly.

## Tech Stack
| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | **React + Vite** | Component‑based UI with fast dev/build tooling |
| | **Tailwind CSS** | Utility‑first styling for responsive design |
| | **WebRTC API** | Peer‑to‑peer media streaming |
| | **Socket.io client** | Signaling and real‑time chat |
| **Backend** | **Node.js (v18+)** | Server runtime |
| | **Express** | HTTP API and static file serving |
| | **Socket.io server** | Signaling channel for WebRTC |
| | **dotenv** | Load environment variables |
| **Deployment** | **Vercel** (with `vercel.json`) | SPA rewrite rules for static hosting |
| | **_redirects** (Netlify/Render/Cloudflare) | Fallback rule for other hosts |
| **Version Control** | **Git** | Source code management |

## Running Locally
### Prerequisites
- **Node.js** (>= 18)
- **npm** (>= 9) or **yarn**
- **Git**

### Steps
```bash
# Clone the repository
git clone <repository‑url>
cd watchParty

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

#### Environment variables
Create a `.env` file inside the **frontend** folder (copy from `.env.example` if present) with:
```env
VITE_API_URL=http://localhost:7000/api
VITE_SOCKET_URL=http://localhost:7000
```
The backend can read its own `.env` (e.g., `PORT=7000`).

#### Development mode
```bash
# Start backend
cd backend && npm run dev   # listens on PORT (default 7000)

# In a new terminal, start frontend
cd frontend && npm run dev   # Vite dev server (http://localhost:5173)
```
Open the Vite URL in a browser, create a room, and test video/screen‑share.

#### Production build
```bash
# Build frontend
cd frontend && npm run build
# Serve backend (you may also serve the static build with any static host)
cd ../backend && npm start
```
The built files are in `frontend/dist` (or `frontend/build`). Deploy that folder as a static site.

## Environment Variables Required
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL for the backend REST API (used by the frontend). |
| `VITE_SOCKET_URL` | URL of the Socket.io server for signaling and chat. |
| `PORT` (backend) | Port on which the Express server listens (default 7000). |
| `CORS_ORIGIN` (backend) | Allowed origin for Socket.io connections (e.g., `http://localhost:5173`). |

## How WebRTC + Socket.io Are Used
- **WebRTC** handles the actual media transport (camera, microphone, screen). It creates a `RTCPeerConnection` per participant and negotiates codecs, bitrate, and ICE candidates.
- **Socket.io** is the signaling layer: peers emit `webrtc-offer`, `webrtc-answer`, and `webrtc-ice-candidate` events, which the server forwards to the appropriate room participants.
- The server also broadcasts chat messages and room‑management events (join/leave).
- Custom helpers (`mungeSdpBitrate`, `applyHighQualitySenderParameters`) adjust SDP to enforce high‑quality video and maintain resolution on flaky networks.

## Deploying
1. **Static Frontend** – Push the `frontend/build` (or `dist`) folder to Vercel, Netlify, Render, or Cloudflare. The repository already contains:
   - `vercel.json` with a rewrite rule `{ "source": "/(.*)", "destination": "/index.html" }`
   - `frontend/public/_redirects` with `/*    /index.html   200`
2. **Backend** – Deploy the Express server to any Node‑compatible platform (Vercel Serverless Functions, Render, Railway, etc.). Ensure the environment variables (`PORT`, `CORS_ORIGIN`) are set.
3. **Configure URLs** – Update `VITE_API_URL` and `VITE_SOCKET_URL` in the frontend `.env` to point to the deployed backend.
4. **Optional** – Use a managed STUN/TURN service (e.g., `stun:stun.l.google.com:19302`) for better NAT traversal.

---
*Viewly – simple, high‑quality video calls and screen sharing, built for the modern web.*

## 1. Overview
A web app where a small group of friends can join a shared "room," watch a video together (synced playback + live video/screen sharing), and chat in real time. This is a beginner-friendly build, sequenced after your chat app project so you can reuse auth and get comfortable with real-time features before tackling media streaming.

## 2. Goals
- Let a host create a room and invite friends via a link/code.
- Let everyone in the room see the same video content at (roughly) the same time.
- Support actual live video/screen sharing between users (not just a synced link to an external video), using WebRTC.
- Include real-time text chat alongside the watch session.
- Ship a working v1 fast by reusing what you already know: React, Tailwind, Node.js, and your existing auth code.

## 3. Non-Goals (v1)
- No avatars (planned for a later version).
- No support for large rooms (100s of users) — target 2–10 people per room.
- No mobile app — responsive web only.
- No content licensing/DRM handling for copyrighted streaming platforms — screen share is user-driven, not a Netflix-style sync.
- No recording/playback-later feature.

## 4. Target User
You and your friend group: casual, beginner-tolerant, more about "hanging out and watching something together" than a polished commercial product.

## 5. Core User Flow
1. User logs in (reused auth).
2. User creates a room → gets a shareable room code/link.
3. Friends join via the link.
4. One person shares their screen/video (WebRTC) OR the group syncs playback of an uploaded/linked video.
5. Everyone chats in a side panel while watching.
6. Host can end the room; room closes for all.

## 6. Feature List (Prioritized)

### P0 — Must have for v1
| Feature | Details |
|---|---|
| Auth | Reuse existing auth code — login/signup, session handling. |
| Room creation | Host creates a room, gets unique room ID/link. |
| Room joining | Friends join via link; see who else is in the room. |
| Live text chat | Real-time chat scoped to the room (this is basically your chat-app stepping stone, reused). |
| Video/screen sharing | WebRTC-based sharing so one or more users can broadcast their screen or camera to the room. |
| Basic room state | Track who's in the room, who's sharing, room open/closed. |

### P1 — Nice to have once P0 works
| Feature | Details |
|---|---|
| Synced playback controls | Play/pause/seek sync if watching a shared external video (e.g., YouTube link) instead of a live share. |
| Reactions/emojis | Lightweight, fun, low effort to add. |
| Room persistence | Rejoin a room after refresh/disconnect. |

### P2 — Later
| Feature | Details |
|---|---|
| Avatars | Explicitly deferred. |
| Multiple simultaneous streams | More than one screen share at once, picture-in-picture. |
| Room history / saved rooms | List of past rooms. |

## 7. Suggested Tech Stack (matches what you already know)
- **Frontend:** React + Tailwind
- **Backend:** Node.js
- **Real-time chat + signaling:** WebSockets (e.g., Socket.io) — same pattern as your chat app
- **Video/screen sharing:** WebRTC for peer connections, with your Node/Socket.io server acting as the signaling server (it does NOT carry the video itself — it just helps peers find each other)
- **Auth:** reused from your previous app

## 8. Architecture Notes (beginner-level explanation)
- **Signaling server vs. media stream:** WebRTC video doesn't flow through your server — your server (Socket.io) just helps two browsers exchange connection info ("signaling"), then video flows peer-to-peer. This keeps your server lightweight.
- **Rooms:** Use Socket.io "rooms" (a built-in concept) to scope both chat messages and WebRTC signaling to the people in that specific party room.
- **Scaling reality check:** True peer-to-peer WebRTC works well for small groups (2–6). If you ever want bigger rooms, you'd need an SFU (media server) — explicitly out of scope for v1.

## 9. Milestones (Suggested Build Order)
1. **Chat app (stepping stone, separate project):** rooms/groups + real-time messaging + reused auth.
2. **Room shell:** create/join room, see participant list, no media yet.
3. **Chat inside room:** port your chat app's real-time messaging into the room.
4. **WebRTC screen/video sharing:** one-to-one first, then one-to-many in a room.
5. **Polish:** connection error handling, "user left" states, basic styling with Tailwind.
6. **(P1) Synced external video playback**, if you want it after WebRTC works.

## 10. Success Criteria for v1
- Two friends can join the same room and see/hear a shared screen or camera feed from another participant.
- Chat messages appear in real time for everyone in the room.
- A room can be created, joined, and closed without the server crashing or leaking connections.

## 11. API & Socket Endpoints

### REST API (Node/Express-style)

**Auth** (reused from your previous app)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Log in, returns session/token |
| POST | `/api/auth/logout` | End session |
| GET | `/api/auth/me` | Get current logged-in user |

**Rooms**
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/rooms` | Create a new room. Body: `{ name?: string }`. Returns `{ roomId, roomCode, hostId }`. |
| GET | `/api/rooms/:roomId` | Get room details (name, host, open/closed, participant count). |
| POST | `/api/rooms/:roomId/join` | Join a room by code/ID. Returns room state + participant list. |
| POST | `/api/rooms/:roomId/leave` | Leave a room. |
| DELETE | `/api/rooms/:roomId` | Host closes/ends the room. |
| GET | `/api/rooms/:roomId/participants` | List current participants. |

**Chat (P1 if you persist messages)**
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/rooms/:roomId/messages` | Fetch chat history for a room (only needed if chat is persisted, not ephemeral). |

### WebSocket Events (Socket.io — handles real-time chat + WebRTC signaling)

**Connection / room lifecycle**
| Event (client → server) | Payload | Description |
|---|---|---|
| `room:join` | `{ roomId, userId }` | Join the Socket.io room; triggers server to broadcast updated participant list. |
| `room:leave` | `{ roomId, userId }` | Leave the Socket.io room. |

| Event (server → client) | Payload | Description |
|---|---|---|
| `room:participants` | `{ participants: [...] }` | Broadcast current participant list to everyone in the room. |
| `room:userJoined` | `{ userId, name }` | Notify others a user joined. |
| `room:userLeft` | `{ userId }` | Notify others a user left. |
| `room:closed` | `{ roomId }` | Notify everyone the host ended the room. |

**Chat**
| Event (client → server) | Payload | Description |
|---|---|---|
| `chat:message` | `{ roomId, text }` | Send a chat message. |

| Event (server → client) | Payload | Description |
|---|---|---|
| `chat:message` | `{ userId, name, text, timestamp }` | Broadcast message to everyone in the room. |

**WebRTC signaling** (server just relays these between peers — no media touches your server)
| Event (client → server) | Payload | Description |
|---|---|---|
| `webrtc:offer` | `{ roomId, toUserId, sdp }` | Send connection offer to a specific peer. |
| `webrtc:answer` | `{ roomId, toUserId, sdp }` | Send connection answer back. |
| `webrtc:iceCandidate` | `{ roomId, toUserId, candidate }` | Exchange ICE candidates for NAT traversal. |
| `media:startShare` | `{ roomId }` | Announce you're starting a screen/video share. |
| `media:stopShare` | `{ roomId }` | Announce you've stopped sharing. |

| Event (server → client) | Payload | Description |
|---|---|---|
| `webrtc:offer` | `{ fromUserId, sdp }` | Relay offer to target peer. |
| `webrtc:answer` | `{ fromUserId, sdp }` | Relay answer to target peer. |
| `webrtc:iceCandidate` | `{ fromUserId, candidate }` | Relay ICE candidate to target peer. |
| `media:userStartedShare` | `{ userId }` | Notify room someone started sharing. |
| `media:userStoppedShare` | `{ userId }` | Notify room someone stopped sharing. |

### Notes for a beginner
- Keep REST for anything that's "state that should survive a refresh" (rooms, auth, chat history if persisted).
- Keep Socket.io for anything real-time (presence, chat messages live, WebRTC signaling).
- `webrtc:*` events are just message-passing — your server never decodes or touches actual video/audio data, it only forwards small text blobs (SDP/ICE) between two browsers so they can connect directly.

## 12. Open Questions
- Will screen sharing be from one designated host at a time, or can anyone share?
- Do you want text chat to persist (saved to a DB) or be ephemeral (lost on room close)?
- Any target for how many people max per room in v1 — 2, 4, 6?