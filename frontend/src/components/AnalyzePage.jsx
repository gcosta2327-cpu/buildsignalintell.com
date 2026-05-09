import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ResultsDashboard from "@/components/ResultsDashboard";
import UpgradeModal from "@/components/UpgradeModal";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const FREE_LIMIT = 3;
const STORAGE_KEY = "demandiq_usage_count";

function getUsageCount() {
  return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
}
function incrementUsage() {
  const count = getUsageCount() + 1;
  localStorage.setItem(STORAGE_KEY, String(count));
  return count;
}

export default function AnalyzePage({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    niche: "",
    products: "",
    target_audience: "",
    price_range: "",
    sales_channels: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [usageCount] = useState(getUsageCount);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const count = getUsageCount();
    if (count >= FREE_LIMIT) {
      setShowUpgrade(true);
      return;
    }

    if (!form.niche.trim() || !form.products.trim()) {
      setError("Please fill in at least the niche and products fields.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(`${API}/analyze`, form);
      incrementUsage();
      setResult(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Analysis failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const remainingAnalyses = Math.max(0, FREE_LIMIT - getUsageCount());

  return (
    <div className="min-h-screen bg-[#09090b] text-white relative">
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 py-4 border-b border-[#27272a] backdrop-blur-xl bg-[#09090b]/80 sticky top-0">
        <div className="flex items-center gap-4">
          <button
            data-testid="back-btn"
            onClick={() => navigate("/")}
            className="p-2 rounded-lg text-[#a1a1aa] hover:text-white transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <span
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Demand<span style={{ color: "#1ed760" }}>IQ</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#a1a1aa] hidden sm:block">
            <span
              className={remainingAnalyses === 0 ? "text-red-400 font-medium" : ""}
              data-testid="usage-counter"
            >
              {remainingAnalyses} free {remainingAnalyses === 1 ? "analysis" : "analyses"} left
            </span>
          </span>
          <button
            data-testid="theme-toggle-analyze"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg border border-[#27272a] text-[#a1a1aa] hover:text-white hover:border-[#3f3f46] transition-colors"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {!result ? (
          <>
            {/* Header */}
            <div className="text-center mb-10">
              <p
                className="text-xs uppercase tracking-[0.2em] font-medium mb-3"
                style={{ color: "#1ed760" }}
              >
                Demand Analysis
              </p>
              <h1
                className="text-4xl sm:text-5xl font-bold tracking-tighter text-white mb-4"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Describe Your Business
              </h1>
              <p className="text-[#a1a1aa] text-base leading-relaxed">
                The more detail you provide, the sharper the insights. All fields help our AI give you accurate, actionable demand data.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              data-testid="analysis-form"
            >
              <div className="space-y-2">
                <Label htmlFor="niche" className="text-[#a1a1aa] text-sm font-medium">
                  Business Niche <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="niche"
                  name="niche"
                  value={form.niche}
                  onChange={handleChange}
                  placeholder="e.g. Sustainable home decor, Pet accessories, Fitness equipment"
                  className="bg-[#09090b] border-[#27272a] text-white placeholder:text-[#52525b] focus:border-[#1ed760] focus:ring-[#1ed760] h-11"
                  data-testid="input-niche"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="products" className="text-[#a1a1aa] text-sm font-medium">
                  Current Products <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id="products"
                  name="products"
                  value={form.products}
                  onChange={handleChange}
                  placeholder="e.g. Bamboo toothbrushes, organic cotton bags, reusable water bottles, eco-friendly candles"
                  className="bg-[#09090b] border-[#27272a] text-white placeholder:text-[#52525b] focus:border-[#1ed760] focus:ring-[#1ed760] min-h-[90px] resize-none"
                  data-testid="input-products"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_audience" className="text-[#a1a1aa] text-sm font-medium">
                  Target Audience
                </Label>
                <Input
                  id="target_audience"
                  name="target_audience"
                  value={form.target_audience}
                  onChange={handleChange}
                  placeholder="e.g. Eco-conscious millennials, 25-40, urban areas"
                  className="bg-[#09090b] border-[#27272a] text-white placeholder:text-[#52525b] focus:border-[#1ed760] focus:ring-[#1ed760] h-11"
                  data-testid="input-audience"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_range" className="text-[#a1a1aa] text-sm font-medium">
                  Price Range
                </Label>
                <Input
                  id="price_range"
                  name="price_range"
                  value={form.price_range}
                  onChange={handleChange}
                  placeholder="e.g. $10–$50 per item, average order $35"
                  className="bg-[#09090b] border-[#27272a] text-white placeholder:text-[#52525b] focus:border-[#1ed760] focus:ring-[#1ed760] h-11"
                  data-testid="input-price"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sales_channels" className="text-[#a1a1aa] text-sm font-medium">
                  Sales Channels
                </Label>
                <Input
                  id="sales_channels"
                  name="sales_channels"
                  value={form.sales_channels}
                  onChange={handleChange}
                  placeholder="e.g. Shopify store, Amazon, Instagram, Etsy"
                  className="bg-[#09090b] border-[#27272a] text-white placeholder:text-[#52525b] focus:border-[#1ed760] focus:ring-[#1ed760] h-11"
                  data-testid="input-channels"
                />
              </div>

              {error && (
                <div
                  className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3"
                  data-testid="error-message"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#1ed760] text-black hover:bg-[#17a34a] font-semibold text-base rounded-md transition-all duration-200 glow-btn disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="analyze-submit-btn"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Analyzing your market...
                  </span>
                ) : (
                  "Analyze My Business"
                )}
              </Button>

              <p className="text-center text-xs text-[#52525b]">
                {remainingAnalyses} of {FREE_LIMIT} free analyses remaining
              </p>
            </form>
          </>
        ) : (
          <ResultsDashboard
            data={result}
            formData={form}
            onNewAnalysis={() => setResult(null)}
          />
        )}
      </div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        usageCount={getUsageCount()}
        freeLimit={FREE_LIMIT}
      />
    </div>
  );
}
