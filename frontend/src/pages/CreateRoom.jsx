import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Video } from "lucide-react";
import api from "../api/api";

const CreateRoom = () => {
  const navigate = useNavigate();

  const [roomName, setRoomName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState(10);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!roomName.trim() || !displayName.trim()) {
      setError("Room name and your display name are required.");
      return;
    }

    if (isPrivate && !password.trim()) {
      setError("Password is required for a private room.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/rooms/create-room", {
        name: roomName.trim(),
        password: isPrivate ? password.trim() : null,
        isPrivate,
        maxParticipants,
      });

      const { roomCode, roomId, name } = response.data.data;

      // Save room locally because there is no authentication
      const myRooms = JSON.parse(
        localStorage.getItem("myRooms") || "[]"
      );

      myRooms.unshift({
        roomId,
        roomCode,
        roomName: name,
        displayName: displayName.trim(),
        maxParticipants,
        createdAt: Date.now(),
      });

      localStorage.setItem(
        "myRooms",
        JSON.stringify(myRooms.slice(0, 20))
      );

      // Remember display name for future rooms
      localStorage.setItem(
        "displayName",
        displayName.trim()
      );

      navigate(`/room/${roomCode}`);
    } catch (err) {
      console.error("Create room error:", err);

      setError(
        err?.response?.data?.message ||
          "Couldn't create the room. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#08090d] text-white">

      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[140px]" />

        <div className="absolute right-0 top-[500px] h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[130px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-[#08090d]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          <Link to="/" className="flex items-center gap-3">
            <img
  src="/logo.png"
  alt="Watchly"
  width={50}
  height={50}
  className="rounded-full object-cover"
/>

            <span className="text-lg font-bold">
              Watchly<span className="text-violet-400"></span>
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

      <main className="relative z-10 px-6 py-16">
        <div className="mx-auto max-w-lg">

          {/* Heading */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-400/10 via-blue-500/10 to-violet-500/10 shadow-lg shadow-violet-500/5">
              <Video size={24} className="text-violet-300" strokeWidth={1.8} />
            </div>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Create a room
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              Create a room, share the code, and watch together.
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

            {/* Room name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Room name
              </label>

              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Movie Night"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition focus:border-violet-500/50 focus:bg-white/[0.05]"
              />
            </div>

            {/* Display name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Your display name
              </label>

              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How friends will see you"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition focus:border-violet-500/50 focus:bg-white/[0.05]"
              />
            </div>

            {/* Maximum participants */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Maximum participants
              </label>

              <select
                value={maxParticipants}
                onChange={(e) =>
                  setMaxParticipants(Number(e.target.value))
                }
                className="w-full rounded-lg border border-white/10 bg-[#111218] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500/50"
              >
                <option value={2}>2 people</option>
                <option value={3}>3 people</option>
                <option value={4}>4 people</option>
                <option value={5}>5 people</option>
                <option value={6}>6 people</option>
                <option value={8}>8 people</option>
                <option value={10}>10 people</option>
              </select>

              <p className="mt-2 text-xs text-gray-600">
                Maximum number of people allowed in the room.
              </p>
            </div>

            {/* Private room */}
            <label className="flex items-center gap-3 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => {
                  setIsPrivate(e.target.checked);

                  if (!e.target.checked) {
                    setPassword("");
                  }
                }}
                className="h-4 w-4 rounded border-white/20 bg-white/[0.03] accent-violet-600"
              />

              Private room
            </label>

            {/* Password */}
            {isPrivate && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Room password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a room password"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition focus:border-violet-500/50 focus:bg-white/[0.05]"
                />

                <p className="mt-2 text-xs text-gray-600">
                  Friends will need this password to join.
                </p>
              </div>
            )}

            {/* Create button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-7 py-3.5 font-semibold shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? "Creating room..." : "Create Room →"}
            </button>

          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have a code?{" "}

            <Link
              to="/join-room"
              className="text-violet-400 hover:underline"
            >
              Join a room
            </Link>
          </p>

        </div>
      </main>
    </div>
  );
};

export default CreateRoom;