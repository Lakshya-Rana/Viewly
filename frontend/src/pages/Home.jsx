import { Link } from "react-router";
import {
  Play,
  MonitorUp,
  MessageCircle,
  Zap,
  Lock,
  Smartphone,
  Volume2,
  Maximize,
} from "lucide-react";

const features = [
  {
    icon: Play,
    title: "Real-Time Video Sync",
    description:
      "Watch YouTube videos or movies together with your friends in perfect synchronization.",
  },
  {
    icon: MonitorUp,
    title: "Screen Sharing",
    description:
      "Share your display or specific application window so everyone in the room can watch along.",
  },
  {
    icon: MessageCircle,
    title: "Live Chat & Bubbles",
    description:
      "Chat with friends, react in real time, and view floating chat bubbles while watching.",
  },
  {
    icon: Zap,
    title: "No Signup Required",
    description:
      "Jump straight into rooms without filling out registration forms. Just pick a name and join.",
  },
  {
    icon: Lock,
    title: "Private Rooms",
    description:
      "Each room gets a unique room code. Only people with your link or code can join.",
  },
  {
    icon: Smartphone,
    title: "Works on Any Device",
    description:
      "Enjoy a clean experience across desktop computers, laptops, tablets, and phones.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create a Room",
    description: "Click to start a room instantly—no passwords or accounts needed.",
  },
  {
    step: "02",
    title: "Share the Link",
    description: "Copy your room code or link and send it to your friends.",
  },
  {
    step: "03",
    title: "Watch & Chat",
    description: "Share your screen or stream videos while chatting together in real time.",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-[#08090d] text-white">
      {/* Background Gradients */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-violet-600/20 to-purple-600/10 blur-[150px]" />
        <div className="absolute right-0 top-[400px] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-blue-600/15 to-indigo-600/10 blur-[140px]" />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-20 border-b border-white/10 bg-[#08090d]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
  src="/logo.png"
  alt="Watchly"
  className="rounded-full object-cover h-9 w-9"
/>

            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight">
                Watchly<span className="text-violet-400"></span>
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden items-center gap-8 text-sm font-medium text-gray-400 md:flex">
            <Link to="/" className="text-white transition hover:text-violet-400">
              Home
            </Link>
            <Link to="/rooms" className="transition hover:text-white">
              My Rooms
            </Link>
            <a href="#how-it-works" className="transition hover:text-white">
              How it Works
            </a>
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/join-room"
              className="hidden rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10 sm:inline-block"
            >
              Join Room
            </Link>
            <Link
              to="/create-room"
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
            >
              Create Room
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="px-4 pb-16 pt-20 sm:px-6 md:pt-24">
          <div className="mx-auto max-w-4xl text-center">
            {/* Status Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-1.5 text-xs font-medium text-violet-300">
              <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
              Watch together in real time
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl md:text-7xl">
              Watch videos & share screens.
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                Together with friends.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg">
              Create a room, invite your friends, and enjoy movies, screen sharing, and live chat together. No registration required.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/create-room"
                className="group flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-7 py-3.5 text-base font-semibold shadow-xl shadow-violet-600/20 transition hover:bg-violet-500"
              >
                <span>Create a Room</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>

              <Link
                to="/join-room"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-7 py-3.5 text-base font-semibold text-gray-200 backdrop-blur-md transition hover:bg-white/[0.08]"
              >
                <span>Join a Room</span>
              </Link>
            </div>

            {/* Practical Stats Bar */}
            <div className="mt-12 grid grid-cols-2 gap-4 border-y border-white/10 py-6 sm:grid-cols-4">
              <div>
                <p className="text-2xl font-bold text-white sm:text-3xl">Instant</p>
                <p className="text-xs text-gray-400 font-medium">Room Creation</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-400 sm:text-3xl">HD</p>
                <p className="text-xs text-gray-400 font-medium">Screen Sharing</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white sm:text-3xl">100%</p>
                <p className="text-xs text-gray-400 font-medium">No Signup Needed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-indigo-400 sm:text-3xl">Free</p>
                <p className="text-xs text-gray-400 font-medium">Unlimited Use</p>
              </div>
            </div>
          </div>

          {/* PRODUCT MOCKUP PREVIEW */}
          <div className="relative mx-auto mt-14 max-w-5xl">
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#101117] shadow-2xl shadow-black/80">
              {/* Window Title Bar */}
              <div className="flex h-10 items-center justify-between border-b border-white/10 bg-[#0d0e13] px-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>

                <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 py-1 text-xs font-mono text-gray-400">
                  <span>watchly.app/room/movie-night-892</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  Live Room
                </div>
              </div>

              {/* Window Body Grid */}
              <div className="grid min-h-[400px] md:grid-cols-[1fr_280px]">
                {/* Screen Share Stage */}
                <div className="relative flex flex-col bg-[#08090d]">
                  <div className="relative flex flex-1 items-center justify-center p-8">
                    <div className="text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-lg shadow-violet-500/5">
                        <img
                          src="/logo.png"
                          alt="Watchly"
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-white">Movie Night</h3>
                      <p className="mt-1 text-xs text-gray-500">Sharing Screen • 3 Viewers</p>
                    </div>

                    {/* Floating Chat Bubbles Preview */}
                    <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 max-w-xs">
                      <div className="flex items-center gap-2 rounded-full bg-black/70 border border-white/15 px-3 py-1 text-xs text-white backdrop-blur-md">
                        <span className="font-semibold text-violet-400">X:</span>
                        <span>This scene is great! 🍿</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-black/70 border border-white/15 px-3 py-1 text-xs text-white backdrop-blur-md">
                        <span className="font-semibold text-blue-400">Y:</span>
                        <span>Turn up the volume! 🔊</span>
                      </div>
                    </div>
                  </div>

                  {/* Player Controls Bar */}
                  <div className="flex items-center justify-between border-t border-white/10 bg-[#0d0e13] px-5 py-3 text-xs text-gray-400">
                    <div className="flex items-center gap-3">
                      <button
                        aria-label="Play"
                        className="text-white transition hover:text-violet-400"
                      >
                        <Play size={15} fill="currentColor" strokeWidth={1.8} />
                      </button>
                      <button
                        aria-label="Volume"
                        className="text-white transition hover:text-violet-400"
                      >
                        <Volume2 size={15} strokeWidth={1.8} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-white transition hover:bg-white/10">
                        <Maximize size={13} strokeWidth={1.8} />
                        <span>Fullscreen</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sidebar Preview */}
                <div className="border-t border-white/10 bg-[#101117] md:border-l md:border-t-0 flex flex-col">
                  {/* Participants Header */}
                  <div className="border-b border-white/10 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Participants (3)</h3>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { name: "X (Host)", isMe: true, status: "Sharing Screen" },
                        { name: "Y", isMe: false, status: "Watching" },
                        { name: "Z", isMe: false, status: "Watching" },
                      ].map((user) => (
                        <div key={user.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="relative">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-[10px] font-bold text-white">
                                {user.name[0]}
                              </div>
                              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-400 border border-[#101117]" />
                            </div>
                            <span className="font-medium text-gray-200">{user.name}</span>
                          </div>

                          <span className="text-[10px] text-gray-500">{user.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chat Section */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Live Chat</h3>
                      <div className="space-y-2 text-xs">
                        <p><span className="font-semibold text-violet-400">X:</span> <span className="text-gray-300">Welcome everyone!</span></p>
                        <p><span className="font-semibold text-blue-400">Y:</span> <span className="text-gray-300">Ready for movie night 🍿</span></p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-gray-500">
                      Type a message...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="border-t border-white/10 bg-white/[0.01] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Simple Process</p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">How Watchly Works</h2>
              <p className="mt-3 text-gray-400 text-sm">No downloads or account setup required.</p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {steps.map((item) => (
                <div key={item.step} className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition hover:border-violet-500/30">
                  <span className="text-3xl font-bold text-violet-400/40">{item.step}</span>
                  <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="border-t border-white/10 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Features</p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Everything You Need</h2>
              <p className="mt-3 text-gray-400 text-sm">Simple, clean tools to make watching together fun and easy.</p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-white/[0.04]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-cyan-400/10 via-blue-500/10 to-violet-500/10 shadow-lg shadow-violet-500/5">
                    <feature.icon
                      size={20}
                      strokeWidth={1.8}
                      className="text-violet-300"
                    />
                  </div>
                  <h3 className="mt-5 text-base font-bold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA BANNER */}
        <section className="px-4 py-16 sm:px-6">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-900/20 via-purple-900/10 to-transparent p-10 text-center sm:p-14">
            <h2 className="text-3xl font-bold sm:text-4xl">Ready to Watch Together?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-gray-400">
              Create a room, invite your friends, and start watching in seconds.
            </p>

            <Link
              to="/create-room"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
            >
              <span>Create Your Room →</span>
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#06070a]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs text-gray-500 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white">Watchly</span>
            <span>© 2026 Watch Together.</span>
          </div>

          <div className="flex gap-6 text-gray-400">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/rooms" className="hover:text-white">My Rooms</Link>
            <a href="#features" className="hover:text-white">Features</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;