import { useState } from "react";
import { Link } from "react-router";

const Room = () => {
  const [showParticipants, setShowParticipants] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [message, setMessage] = useState("");

  const participants = ["Lakshya", "Saurabh", "Aadi"];

  const handleShareScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      setIsSharing(true);

      stream.getVideoTracks()[0].onended = () => {
        setIsSharing(false);
      };
    } catch (error) {
      console.log("Screen sharing cancelled");
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    console.log(message);

    setMessage("");
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-white">

      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#08090d]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-600/20">
              ▶
            </div>

            <span className="text-lg font-bold">
              Watch<span className="text-violet-400">Party</span>
            </span>

          </Link>

          {/* Room */}
          <div className="hidden items-center gap-2 sm:flex">

            <span className="text-sm text-gray-500">
              Room
            </span>

            <span className="rounded-lg bg-white/[0.04] px-3 py-2 text-sm">
              a8f32c91
            </span>

            <button className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 transition hover:bg-white/5 hover:text-white">
              Copy
            </button>

          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">

            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                showParticipants
                  ? "border-violet-500/30 bg-violet-500/10 text-violet-400"
                  : "border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              👥 {participants.length}
            </button>

            <Link
              to="/"
              className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
            >
              Leave
            </Link>

          </div>

        </div>
      </nav>

      {/* Main */}
      <main className="mx-auto max-w-[1400px] p-4 sm:p-6">

        <div
          className={`grid gap-5 ${
            showParticipants
              ? "lg:grid-cols-[1fr_320px]"
              : "lg:grid-cols-1"
          }`}
        >

          {/* LEFT */}
          <div className="space-y-5">

            {/* Video */}
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101117]">

              <div className="relative aspect-video bg-black">

                {isSharing ? (
                  <div className="absolute inset-0 flex items-center justify-center">

                    <div className="text-center">

                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-500/10 text-3xl text-violet-400">
                        ⌁
                      </div>

                      <h2 className="mt-5 text-xl font-semibold">
                        Screen sharing active
                      </h2>

                      <p className="mt-2 text-sm text-gray-500">
                        Your screen is being shared.
                      </p>

                    </div>

                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">

                    <div className="text-center">

                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-500/10 text-3xl text-violet-400">
                        ▶
                      </div>

                      <h2 className="mt-5 text-xl font-semibold">
                        Movie Night
                      </h2>

                      <p className="mt-2 text-sm text-gray-500">
                        No video playing
                      </p>

                    </div>

                  </div>
                )}

              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 p-4">

                <div>
                  <h2 className="font-semibold">
                    Movie Night
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    {participants.length} people watching
                  </p>
                </div>

                <div className="flex items-center gap-2">

                  {/* Play */}
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
                  >
                    {isPlaying ? "⏸" : "▶"}
                  </button>

                  {/* Mute */}
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
                  >
                    {isMuted ? "🔇" : "🔊"}
                  </button>

                  {/* Share */}
                  <button
                    onClick={handleShareScreen}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm hover:bg-white/[0.07]"
                  >
                    {isSharing ? "Sharing" : "Share Screen"}
                  </button>

                </div>

              </div>

            </section>

            {/* Progress */}
            <div className="rounded-2xl border border-white/10 bg-[#101117] p-5">

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>24:18</span>
                <span>1:42:30</span>
              </div>

              <div className="mt-3 h-1.5 rounded-full bg-white/10">
                <div className="h-1.5 w-[38%] rounded-full bg-violet-500" />
              </div>

            </div>

            {/* Chat */}
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101117]">

              <div className="border-b border-white/10 p-5">
                <h2 className="font-semibold">
                  Live Chat
                </h2>
              </div>

              {/* Messages */}
              <div className="min-h-[220px] space-y-5 p-5">

                <div>
                  <p className="text-xs font-semibold text-violet-400">
                    Lakshya
                  </p>

                  <div className="mt-1 inline-block rounded-xl rounded-tl-sm bg-white/[0.05] px-4 py-2 text-sm">
                    This movie is 🔥
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-blue-400">
                    Aadi
                  </p>

                  <div className="mt-1 inline-block rounded-xl rounded-tl-sm bg-white/[0.05] px-4 py-2 text-sm">
                    Wait for this scene 😂
                  </div>
                </div>

              </div>

              {/* Chat Input */}
              <form
                onSubmit={handleSendMessage}
                className="flex gap-2 border-t border-white/10 p-4"
              >

                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-gray-600 focus:border-violet-500/50"
                />

                <button
                  type="submit"
                  className="rounded-xl bg-violet-600 px-5 font-medium hover:bg-violet-500"
                >
                  Send
                </button>

              </form>

            </section>

          </div>

          {/* RIGHT - PARTICIPANTS */}
          {showParticipants && (
            <aside className="h-fit overflow-hidden rounded-2xl border border-white/10 bg-[#101117]">

              <div className="border-b border-white/10 p-5">

                <div className="flex items-center justify-between">

                  <div>
                    <h2 className="font-semibold">
                      Participants
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      {participants.length} people
                    </p>
                  </div>

                  <button
                    onClick={() => setShowParticipants(false)}
                    className="text-gray-500 hover:text-white"
                  >
                    ✕
                  </button>

                </div>

              </div>

              <div className="space-y-4 p-5">

                {participants.map((user, index) => (

                  <div
                    key={user}
                    className="flex items-center gap-3"
                  >

                    <div className="relative">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-bold">
                        {user[0]}
                      </div>

                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#101117] bg-green-400" />

                    </div>

                    <div>

                      <p className="text-sm font-medium">
                        {user}
                      </p>

                      {index === 0 && (
                        <p className="text-xs text-violet-400">
                          You
                        </p>
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