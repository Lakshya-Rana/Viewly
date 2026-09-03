import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Play, Video, Trash2 } from "lucide-react";

const MyRooms = () => {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const savedRooms = JSON.parse(
      localStorage.getItem("myRooms") || "[]"
    );

    setRooms(savedRooms);
  }, []);

  const removeRoom = (roomId) => {
    const updatedRooms = rooms.filter(
      (room) => room.roomId !== roomId
    );

    setRooms(updatedRooms);

    localStorage.setItem(
      "myRooms",
      JSON.stringify(updatedRooms)
    );
  };

  const clearRooms = () => {
    localStorage.removeItem("myRooms");
    setRooms([]);
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

          <div className="flex items-center gap-6 text-sm">
            <Link
              to="/"
              className="text-gray-400 transition hover:text-white"
            >
              Home
            </Link>

            <Link
              to="/create-room"
              className="text-violet-400 transition hover:text-violet-300"
            >
              Create Room
            </Link>
          </div>

        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-16">

        {/* Header */}
        <div className="mb-10 flex items-end justify-between">

          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              My Rooms
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Rooms you've created on this browser.
            </p>
          </div>

          {rooms.length > 0 && (
            <button
              onClick={clearRooms}
              className="text-sm text-gray-500 transition hover:text-red-400"
            >
              Clear all
            </button>
          )}

        </div>

        {/* Empty state */}
        {rooms.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-20 text-center">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-400/10 via-blue-500/10 to-violet-500/10 shadow-lg shadow-violet-500/5">
              <Video size={28} className="text-violet-300" strokeWidth={1.8} />
            </div>

            <h2 className="text-xl font-semibold">
              No rooms yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Create your first WatchParty room and it will appear here.
            </p>

            <button
              onClick={() => navigate("/create-room")}
              className="mt-6 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold transition hover:bg-violet-500"
            >
              Create a Room →
            </button>

          </div>
        ) : (

          /* Room grid */
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {rooms.map((room) => (

              <div
                key={room.roomId}
                className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:-translate-y-1 hover:border-violet-500/30 hover:bg-white/[0.04]"
              >

                {/* Room icon */}
                <div className="mb-5 flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-cyan-400/10 via-blue-500/10 to-violet-500/10 shadow-lg shadow-violet-500/5">
                    <Play size={18} fill="currentColor" strokeWidth={1.8} className="text-violet-300 ml-0.5" />
                  </div>

                  <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-400">
                    Host
                  </span>

                </div>

                {/* Room info */}
                <h2 className="truncate text-lg font-semibold">
                  {room.roomName}
                </h2>

                <p className="mt-2 text-xs text-gray-500">
                  Room code
                </p>

                <p className="mt-1 font-mono text-sm text-gray-300">
                  {room.roomCode}
                </p>

                <p className="mt-3 text-xs text-gray-600">
                  Created{" "}
                  {new Date(room.createdAt).toLocaleDateString()}
                </p>

                {/* Actions */}
                <div className="mt-5 flex gap-3">

                  <button
                    onClick={() =>
                      navigate(`/room/${room.roomCode}`)
                    }
                    className="flex-1 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium transition hover:bg-violet-500"
                  >
                    Open Room
                  </button>

                  <button
                    onClick={() => removeRoom(room.roomId)}
                    className="flex items-center justify-center rounded-lg border border-white/10 px-3 py-2.5 text-sm text-gray-500 transition hover:border-red-500/30 hover:text-red-400"
                    title="Remove from My Rooms"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

      </main>
    </div>
  );
};

export default MyRooms;