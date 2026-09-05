
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Play } from "lucide-react";
import api from "../api/api";

const JoinRoom = () => {
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState("");
  const [displayName, setDisplayName] = useState(
    localStorage.getItem("displayName") || ""
  );
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const code = roomCode.trim().toUpperCase();
    const name = displayName.trim();

    if (!code || !name) {
      setError("Room code and your display name are required.");
      return;
    }

    setLoading(true);

    try {
      // Backend expects roomId and password in req.body
      const response = await api.post("/rooms/join-room", {
        roomId: roomCode,
        password: password.trim() || undefined,
      });

      console.log("Join room response:", response.data);

      const data = response.data.data;

      // Save display name
      localStorage.setItem("displayName", name);

      // Save room locally
      const myRooms = JSON.parse(
        localStorage.getItem("myRooms") || "[]"
      );

      const alreadySaved = myRooms.some(
        (room) => room.roomCode === data.roomCode
      );

      if (!alreadySaved) {
        myRooms.unshift({
          roomId: data.roomId,
          roomCode: data.roomCode,
          roomName: data.name || "Untitled Room",
          displayName: name,
          role: "guest",
          createdAt: Date.now(),
        });

        localStorage.setItem(
          "myRooms",
          JSON.stringify(myRooms.slice(0, 20))
        );
      }

      // Go to /room/:roomCode
      navigate(`/room/${data.roomCode}`);

    } catch (err) {
      console.error("Join room error:", err);

      setError(
        err?.response?.data?.message ||
          "Couldn't join the room. Check the room code and password."
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

          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <img
  src="/logo.png"
  alt="Viewly"
  width={50}
  height={50}
  className="rounded-full object-cover"
/>

            <span className="text-lg font-bold">
              Viewly
              <span className="text-violet-400">
              
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-gray-400 md:flex">

            <Link
              to="/"
              className="transition hover:text-white"
            >
              Home
            </Link>

            <Link
              to="/rooms"
              className="transition hover:text-white"
            >
              My Rooms
            </Link>

          </div>

        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 px-6 py-16">

        <div className="mx-auto max-w-lg">

          <div className="mb-8 text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-400/10 via-blue-500/10 to-violet-500/10 shadow-lg shadow-violet-500/5">
              <Play size={22} fill="currentColor" className="text-violet-300 ml-0.5" strokeWidth={1.8} />
            </div>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Join a room
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              Enter the room code your friend shared with you.
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.025] p-7"
          >

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Room Code */}
            <div>

              <label className="mb-2 block text-sm font-medium text-gray-300">
                Room code
              </label>

              <input
                type="text"
                value={roomCode}
                onChange={(e) =>
                  setRoomCode(
                    e.target.value
                  )
                }
                placeholder="e.g. 7F3KQD"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-lg font-semibold tracking-[0.3em] text-white placeholder-gray-600 outline-none transition focus:border-violet-500/50 focus:bg-white/[0.05]"
              />

            </div>

            {/* Display Name */}
            <div>

              <label className="mb-2 block text-sm font-medium text-gray-300">
                Your display name
              </label>

              <input
                type="text"
                value={displayName}
                onChange={(e) =>
                  setDisplayName(e.target.value)
                }
                placeholder="How others will see you"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition focus:border-violet-500/50 focus:bg-white/[0.05]"
              />

            </div>

            {/* Password */}
            <div>

              <label className="mb-2 block text-sm font-medium text-gray-300">
                Room password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Leave empty for public rooms"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition focus:border-violet-500/50 focus:bg-white/[0.05]"
              />

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-7 py-3.5 font-semibold shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading
                ? "Joining..."
                : "Join Room →"}
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
