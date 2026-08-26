import { Link } from "react-router";

const features = [
  {
    icon: "▶",
    title: "Watch Together",
    description:
      "Stay perfectly synchronized while watching videos with your friends.",
  },
  {
    icon: "💬",
    title: "Live Chat",
    description:
      "Talk, react, and share your thoughts without leaving the room.",
  },
  {
    icon: "⌁",
    title: "Screen Share",
    description:
      "Share your screen and enjoy games, videos, presentations, and more.",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-[#08090d] text-white">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[140px]" />

        <div className="absolute right-0 top-[500px] h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[130px]" />

        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-[#08090d]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-600/20">
              <span className="text-lg">▶</span>
            </div>

            <span className="text-lg font-bold">
              Watch<span className="text-violet-400">Party</span>
            </span>
          </Link>

          {/* Navigation */}
          <div className="hidden items-center gap-8 text-sm text-gray-400 md:flex">
            <Link
              to="/"
              className="text-white transition hover:text-violet-400"
            >
              Home
            </Link>

            <Link to="/rooms" className="transition hover:text-white">
              My Rooms
            </Link>

            <a href="#features" className="transition hover:text-white">
              Features
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/create-room"
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold transition hover:bg-violet-500"
            >
              Create Room
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero */}
        <section className="px-6 pb-24 pt-24 md:pt-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/5 px-4 py-2 text-sm text-violet-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />

              Watch together in real time
            </div>

            {/* Heading */}
            <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl md:text-7xl">
              Watch together.
              <br />

              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Anywhere.
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
              Create a room, invite your friends, and enjoy movies, videos,
              games, and screen sharing together in real time.
            </p>

            {/* Buttons */}
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/create-room"
                className="group flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-7 py-3.5 font-semibold shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-500"
              >
                <span>+</span>

                Create a Room

                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                to="/join-room"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-7 py-3.5 font-semibold text-gray-200 backdrop-blur transition hover:bg-white/[0.07]"
              >
                Join a Room
              </Link>
            </div>
          </div>

          {/* Product Preview */}
          <div className="relative mx-auto mt-20 max-w-5xl">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-violet-600/20 blur-3xl" />

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101117] shadow-2xl shadow-black/50">
              {/* Browser top bar */}
              <div className="flex h-11 items-center gap-2 border-b border-white/10 px-4">
                <div className="h-3 w-3 rounded-full bg-red-400/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
                <div className="h-3 w-3 rounded-full bg-green-400/70" />

                <div className="ml-5 h-6 flex-1 rounded-md bg-white/[0.04]" />
              </div>

              {/* Main preview */}
              <div className="grid min-h-[400px] md:grid-cols-[1fr_270px]">
                {/* Video */}
                <div className="flex flex-col bg-[#0b0c10]">
                  <div className="flex flex-1 items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-600/10 text-3xl text-violet-400">
                        ▶
                      </div>

                      <h3 className="mt-5 font-semibold">Movie Night</h3>

                      <p className="mt-1 text-sm text-gray-500">
                        3 people watching
                      </p>
                    </div>
                  </div>

                  {/* Video controls */}
                  <div className="border-t border-white/10 px-5 py-4">
                    <div className="mb-3 h-1 rounded-full bg-white/10">
                      <div className="h-1 w-[38%] rounded-full bg-violet-500" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-gray-400">
                        <span>◀</span>
                        <span className="text-white">=</span>
                        <span>▶</span>
                        <span>🔊</span>
                      </div>

                      <span className="text-xs text-gray-500">
                        24:18 / 1:42:30
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="border-t border-white/10 bg-[#101117] md:border-l md:border-t-0">
                  {/* Participants */}
                  <div className="border-b border-white/10 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Participants</h3>

                      <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-gray-400">
                        3
                      </span>
                    </div>

                    <div className="space-y-3">
                      {["Lakshya", "Saurabh", "Aadi"].map((user, index) => (
                        <div key={user} className="flex items-center gap-3">
                          <div className="relative">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-bold">
                              {user[0]}
                            </div>

                            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#101117] bg-green-400" />
                          </div>

                          <span className="text-sm text-gray-300">
                            {user}

                            {index === 0 && (
                              <span className="ml-2 text-xs text-violet-400">
                                You
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chat */}
                  <div className="p-5">
                    <h3 className="mb-4 text-sm font-semibold">Live Chat</h3>

                    <div className="space-y-3 text-xs">
                      <p>
                        <span className="font-semibold text-violet-400">
                          Lakshya
                        </span>{" "}
                        <span className="text-gray-400">
                          This movie is 🔥
                        </span>
                      </p>

                      <p>
                        <span className="font-semibold text-blue-400">
                          Aadi
                        </span>{" "}
                        <span className="text-gray-400">
                          Wait for this scene 😂
                        </span>
                      </p>
                    </div>

                    <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-gray-600">
                      Type a message...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="border-y border-white/10 bg-white/[0.015]"
        >
          <div className="mx-auto max-w-7xl px-6 py-24">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
                Everything you need
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                More than just watching
              </h2>

              <p className="mt-4 text-gray-500">
                Everything you need to make watching together feel like
                you're actually in the same room.
              </p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-white/10 bg-white/[0.025] p-7 transition duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-white/[0.04]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-lg text-violet-400 transition group-hover:bg-violet-500/20">
                    {feature.icon}
                  </div>

                  <h3 className="mt-6 text-lg font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-5xl rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/15 via-purple-600/10 to-transparent px-6 py-20 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to watch together?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-gray-400">
              Create a room, invite your friends, and start your next watch
              party.
            </p>

            <Link
              to="/create-room"
              className="mt-8 inline-flex rounded-xl bg-violet-600 px-7 py-3.5 font-semibold shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
            >
              Create Your Room →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-gray-500 sm:flex-row">
          <p>© 2026 WatchParty. Built for watching together.</p>

          <div className="flex gap-6">
            <a href="#" className="transition hover:text-white">
              GitHub
            </a>

            <a href="#" className="transition hover:text-white">
              About
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
