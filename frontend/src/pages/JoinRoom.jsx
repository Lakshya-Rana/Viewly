import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import api from "../api/api";

const JoinRoom = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [roomCode, setRoomCode] = useState(
    searchParams.get("code")?.toUpperCase() || ""
  );
  const [displayName, setDisplayName] = useState(
    localStorage.getItem("displayName") || ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!roomCode.trim() || !displayName.trim()) {
      setError("Room code and your display name are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/rooms/join-room", {
        roomCode: roomCode.trim().toUpperCase(),
        displayName: displayName.trim(),
      });

      const { roomId, roomName } = response.data.data;

      const myRooms = JSON.parse(localStorage.getItem("myRooms") || "[]");
      const alreadySaved = myRooms.some(
        (r) => r.roomCode === roomCode.trim().toUpperCase()
      );
      if (!alreadySaved) {
        myRooms.unshift({
          roomId,
          roomCode: roomCode.trim().toUpperCase(),
          roomName: roomName || "Untitled Room",
          displayName: displayName.trim(),
          role: "guest",
          createdAt: Date.now(),
        });
        localStorage.setItem("myRooms", JSON.stringify(myRooms.slice(0, 20)));
      }
      localStorage.setItem("displayName", displayName.trim());

      navigate(`/room/${roomCode.trim().toUpperCase()}`);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Couldn't find that room. Check the code and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#08090d] text-white">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-[#08090d]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-600/20">
              <span className="text-lg">▶</span>
            </div>
            <span className="text-lg font-bold">
              Watch<span className="text-violet-400">Party</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-gray-400 md:flex">
            <Link to="/" className="transition hover:text-white">
              Home
            </Link>
            <Link to="/rooms" className="transition hover:text-white">
              My Rooms
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 px-6 py-16">
        <div className="mx-auto max-w-lg">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold sm:text-4xl">Join a room</h1>
            <p className="mt-3 text-sm text-gray-500">
              Enter the room code your friend shared with you.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.025] p-7"
          >
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Room code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. 7F3KQD"
                maxLength={8}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-lg font-semibold tracking-[0.3em] text-white placeholder-gray-600 outline-none transition focus:border-violet-500/50 focus:bg-white/[0.05]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Your display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How others will see you"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition focus:border-violet-500/50 focus:bg-white/[0.05]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-7 py-3.5 font-semibold shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? "Joining..." : "Join Room →"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have a code?{" "}
            <Link
              to="/create-room"
              className="text-violet-400 hover:underline"
            >
              Create a room
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default JoinRoom;
