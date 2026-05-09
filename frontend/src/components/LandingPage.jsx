import { useNavigate } from "react-router-dom";
import { Moon, Sun, TrendingUp, BarChart2, Zap, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Demand Intelligence",
    desc: "AI-powered analysis of market trends to identify what products are gaining and losing traction in your niche.",
  },
  {
    icon: BarChart2,
    title: "Confidence Charts",
    desc: "Visual confidence scores for every product recommendation so you can prioritize with data, not gut feel.",
  },
  {
    icon: Zap,
    title: "Instant Insights",
    desc: "Get actionable seasonal trends and strategic recommendations in seconds — not days.",
  },
  {
    icon: Download,
    title: "Export Ready",
    desc: "Download full reports as PDF with charts or CSV for deeper analysis in your own tools.",
  },
];

export default function LandingPage({ darkMode, setDarkMode }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#09090b] text-white relative overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay pointer-events-none" />

      {/* Glow blob */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, #1ed760 0%, transparent 70%)" }}
      />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-[#27272a]">
        <span
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "Outfit, sans-serif" }}
          data-testid="nav-logo"
        >
          Demand<span style={{ color: "#1ed760" }}>IQ</span>
        </span>
        <div className="flex items-center gap-3">
          <button
            data-testid="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg border border-[#27272a] text-[#a1a1aa] hover:text-white hover:border-[#3f3f46] transition-colors"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Button
            data-testid="nav-cta-btn"
            onClick={() => navigate("/analyze")}
            className="bg-[#1ed760] text-black hover:bg-[#17a34a] font-semibold text-sm px-5 py-2 rounded-md transition-all duration-200"
          >
            Start Free Analysis
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col lg:flex-row items-center gap-12 px-6 md:px-12 pt-20 pb-24 max-w-7xl mx-auto">
        <div className="flex-1 text-center lg:text-left">
          <p
            className="text-xs uppercase tracking-[0.2em] font-medium mb-4 fade-in-up fade-in-up-1"
            style={{ color: "#1ed760" }}
          >
            AI-Powered E-Commerce Intelligence
          </p>
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-white mb-6 fade-in-up fade-in-up-2"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Know What to Sell{" "}
            <span style={{ color: "#1ed760" }}>Before</span>{" "}
            Your Competitors Do
          </h1>
          <p className="text-base sm:text-lg text-[#a1a1aa] mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed fade-in-up fade-in-up-3">
            Describe your store, get instant AI-driven demand analysis — high-demand winners, low-demand traps, seasonal trends, and 3 strategic actions. Free to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start fade-in-up fade-in-up-4">
            <Button
              data-testid="hero-cta-btn"
              onClick={() => navigate("/analyze")}
              className="glow-btn bg-[#1ed760] text-black hover:bg-[#17a34a] font-semibold text-base px-8 py-3 rounded-md transition-all duration-200 h-auto"
            >
              Analyze My Store — Free
            </Button>
            <Button
              variant="outline"
              className="border-[#27272a] text-[#a1a1aa] hover:text-white hover:border-[#3f3f46] bg-transparent text-base px-8 py-3 h-auto"
            >
              See Sample Report
            </Button>
          </div>
          <p className="mt-4 text-sm text-[#52525b] fade-in-up fade-in-up-5">
            3 free analyses • No credit card required
          </p>
        </div>

        {/* Hero image */}
        <div className="flex-1 relative fade-in-up fade-in-up-3">
          <div
            className="absolute inset-0 rounded-2xl opacity-30 blur-2xl"
            style={{ background: "radial-gradient(ellipse, #1ed760 0%, transparent 60%)" }}
          />
          <img
            src="https://images.unsplash.com/photo-1586880244406-556ebe35f282?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=800"
            alt="E-commerce entrepreneur"
            className="relative rounded-2xl border border-[#27272a] w-full max-w-lg mx-auto shadow-2xl"
          />
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 md:px-12 py-20 border-t border-[#27272a] max-w-7xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] font-medium text-center mb-3" style={{ color: "#1ed760" }}>
          What You Get
        </p>
        <h2
          className="text-3xl sm:text-4xl font-semibold tracking-tight text-white text-center mb-12"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          Everything you need to make demand-driven decisions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="bg-[#18181b] border border-[#27272a] hover:border-[#1ed760]/40 rounded-lg p-6 transition-all duration-300 hover:-translate-y-1 fade-in-up"
              style={{ animationDelay: `${i * 0.1}s`, opacity: 0, animation: "fadeInUp 0.5s ease-out forwards" }}
              data-testid={`feature-card-${i}`}
            >
              <f.icon size={24} className="mb-4" style={{ color: "#1ed760" }} />
              <h3
                className="text-lg font-semibold text-white mb-2"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                {f.title}
              </h3>
              <p className="text-sm text-[#a1a1aa] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 px-6 md:px-12 py-16 max-w-7xl mx-auto">
        <div
          className="rounded-2xl border border-[#1ed760]/20 p-10 text-center"
          style={{ background: "linear-gradient(135deg, rgba(30,215,96,0.05) 0%, rgba(9,9,11,0) 100%)" }}
        >
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Ready to outsmart your market?
          </h2>
          <p className="text-[#a1a1aa] mb-8 text-base">
            Join thousands of store owners using DemandIQ to stay ahead.
          </p>
          <Button
            data-testid="bottom-cta-btn"
            onClick={() => navigate("/analyze")}
            className="glow-btn bg-[#1ed760] text-black hover:bg-[#17a34a] font-semibold text-base px-10 py-3 rounded-md h-auto"
          >
            Get My Free Analysis
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#27272a] px-6 md:px-12 py-6 text-center">
        <p className="text-sm text-[#52525b]">
          © 2025 DemandIQ — AI-powered demand intelligence for e-commerce
        </p>
      </footer>
    </div>
  );
}
