import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Check, X } from "lucide-react";

const PRO_FEATURES = [
  "Unlimited demand analyses",
  "Advanced competitor benchmarking",
  "Historical trend comparisons",
  "Priority AI processing",
  "Team collaboration tools",
];

export default function UpgradeModal({ open, onClose, usageCount, freeLimit }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md border-[#27272a] p-0 overflow-hidden"
        style={{ background: "#18181b" }}
        data-testid="upgrade-modal"
      >
        {/* Header glow strip */}
        <div
          className="h-1 w-full"
          style={{ background: "linear-gradient(90deg, #1ed760, #17a34a)" }}
        />

        <div className="p-6">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ background: "rgba(30,215,96,0.1)" }}>
                <Crown size={22} style={{ color: "#1ed760" }} />
              </div>
              <DialogTitle
                className="text-xl font-bold text-white"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Upgrade to Pro
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Usage indicator */}
          <div
            className="flex items-center gap-3 rounded-lg px-4 py-3 mb-6 border"
            style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }}
            data-testid="upgrade-usage-display"
          >
            <div className="flex gap-1">
              {Array.from({ length: freeLimit }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{ background: i < usageCount ? "#ef4444" : "#27272a" }}
                />
              ))}
            </div>
            <p className="text-sm text-red-400 font-medium">
              {usageCount}/{freeLimit} free analyses used
            </p>
          </div>

          <p className="text-[#a1a1aa] text-sm mb-6 leading-relaxed">
            You've reached your free tier limit. Upgrade to Pro for unlimited access to BuildSignal's full AI analysis suite.
          </p>

          {/* Features list */}
          <ul className="space-y-3 mb-6">
            {PRO_FEATURES.map((feat) => (
              <li key={feat} className="flex items-center gap-3 text-sm text-white">
                <div
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(30,215,96,0.15)" }}
                >
                  <Check size={12} style={{ color: "#1ed760" }} />
                </div>
                {feat}
              </li>
            ))}
          </ul>

          {/* Pricing */}
          <div
            className="rounded-lg p-4 mb-6 border"
            style={{ background: "rgba(30,215,96,0.05)", borderColor: "rgba(30,215,96,0.2)" }}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white" style={{ fontFamily: "Outfit" }}>
                $29
              </span>
              <span className="text-[#a1a1aa] text-sm">/month</span>
            </div>
            <p className="text-xs text-[#52525b] mt-1">Billed monthly. Cancel anytime.</p>
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1 h-11 bg-[#1ed760] text-black hover:bg-[#17a34a] font-semibold rounded-md glow-btn"
              data-testid="upgrade-cta-btn"
            >
              Upgrade to Pro
            </Button>
            <Button
              variant="ghost"
              className="h-11 px-4 text-[#a1a1aa] hover:text-white hover:bg-[#27272a]"
              onClick={onClose}
              data-testid="upgrade-dismiss-btn"
            >
              <X size={18} />
            </Button>
          </div>

          <p className="text-center text-xs text-[#52525b] mt-3">
            No payment required in this demo
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
