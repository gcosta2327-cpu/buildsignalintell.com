import { useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Zap,
  FileDown,
  FileSpreadsheet,
  RotateCcw,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Papa from "papaparse";

const CONFIDENCE_VALUE = { high: 3, medium: 2, low: 1 };
const CONFIDENCE_COLORS = {
  high: "#1ed760",
  medium: "#facc15",
  low: "#ef4444",
};

function ConfidenceBadge({ level }) {
  const colors = {
    high: "bg-[#1ed760]/10 text-[#1ed760] border-[#1ed760]/20",
    medium: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    low: "bg-red-400/10 text-red-400 border-red-400/20",
  };
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${colors[level] || colors.low}`}
    >
      {level}
    </span>
  );
}

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-3 shadow-xl text-sm">
        <p className="text-white font-medium mb-1">{d.product}</p>
        <p className="text-[#a1a1aa]">
          Confidence:{" "}
          <span style={{ color: CONFIDENCE_COLORS[d.originalConfidence] }}>
            {d.originalConfidence}
          </span>
        </p>
        <p className="text-[#a1a1aa]">
          Type: <span className={d.type === "high" ? "text-[#1ed760]" : "text-red-400"}>{d.type === "high" ? "High Demand" : "Low Demand"}</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function ResultsDashboard({ data, formData, onNewAnalysis }) {
  const dashboardRef = useRef(null);
  const chartRef = useRef(null);

  // Build chart data
  const chartData = [
    ...(data.high_demand || []).map((p) => ({
      product: p.product.length > 18 ? p.product.slice(0, 18) + "…" : p.product,
      fullProduct: p.product,
      confidence: CONFIDENCE_VALUE[p.confidence] || 1,
      originalConfidence: p.confidence,
      type: "high",
    })),
    ...(data.low_demand || []).map((p) => ({
      product: p.product.length > 18 ? p.product.slice(0, 18) + "…" : p.product,
      fullProduct: p.product,
      confidence: CONFIDENCE_VALUE[p.confidence] || 1,
      originalConfidence: p.confidence,
      type: "low",
    })),
  ];

  // Export CSV
  const exportCSV = () => {
    const rows = [
      ...( data.high_demand || []).map((p) => ({
        Type: "High Demand",
        Product: p.product,
        Reason: p.reason,
        Confidence: p.confidence,
      })),
      ...(data.low_demand || []).map((p) => ({
        Type: "Low Demand",
        Product: p.product,
        Reason: p.reason,
        Confidence: p.confidence,
      })),
    ];

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "demandiq-analysis.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export PDF
  const exportPDF = async () => {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = 210;
    const margin = 15;
    let y = margin;

    // Title
    pdf.setFontSize(24);
    pdf.setTextColor(30, 215, 96);
    pdf.text("DemandIQ Analysis Report", margin, y);
    y += 10;

    // Business info
    pdf.setFontSize(10);
    pdf.setTextColor(160, 160, 160);
    pdf.text(`Niche: ${formData.niche}`, margin, y);
    y += 5;
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, y);
    y += 10;

    // Summary
    pdf.setFontSize(14);
    pdf.setTextColor(248, 249, 250);
    pdf.text("Summary", margin, y);
    y += 6;
    pdf.setFontSize(10);
    pdf.setTextColor(160, 160, 160);
    const summaryLines = pdf.splitTextToSize(data.summary || "", pageW - 2 * margin);
    pdf.text(summaryLines, margin, y);
    y += summaryLines.length * 5 + 8;

    // Chart
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, { backgroundColor: "#18181b", scale: 1.5 });
        const imgData = canvas.toDataURL("image/png");
        const imgW = pageW - 2 * margin;
        const imgH = (canvas.height / canvas.width) * imgW;
        if (y + imgH > 280) { pdf.addPage(); y = margin; }
        pdf.setFontSize(14);
        pdf.setTextColor(248, 249, 250);
        pdf.text("Confidence Chart", margin, y);
        y += 6;
        pdf.addImage(imgData, "PNG", margin, y, imgW, imgH);
        y += imgH + 10;
      } catch (err) {
        console.error("Chart capture failed:", err);
      }
    }

    // High Demand
    if (y + 10 > 280) { pdf.addPage(); y = margin; }
    pdf.setFontSize(14);
    pdf.setTextColor(30, 215, 96);
    pdf.text("High Demand Products", margin, y);
    y += 7;
    (data.high_demand || []).forEach((p) => {
      if (y + 15 > 280) { pdf.addPage(); y = margin; }
      pdf.setFontSize(11);
      pdf.setTextColor(248, 249, 250);
      pdf.text(`• ${p.product} [${p.confidence}]`, margin, y);
      y += 5;
      pdf.setFontSize(9);
      pdf.setTextColor(160, 160, 160);
      const lines = pdf.splitTextToSize(p.reason, pageW - 2 * margin - 5);
      pdf.text(lines, margin + 4, y);
      y += lines.length * 4 + 4;
    });

    y += 4;

    // Low Demand
    if (y + 10 > 280) { pdf.addPage(); y = margin; }
    pdf.setFontSize(14);
    pdf.setTextColor(239, 68, 68);
    pdf.text("Low Demand Products", margin, y);
    y += 7;
    (data.low_demand || []).forEach((p) => {
      if (y + 15 > 280) { pdf.addPage(); y = margin; }
      pdf.setFontSize(11);
      pdf.setTextColor(248, 249, 250);
      pdf.text(`• ${p.product} [${p.confidence}]`, margin, y);
      y += 5;
      pdf.setFontSize(9);
      pdf.setTextColor(160, 160, 160);
      const lines = pdf.splitTextToSize(p.reason, pageW - 2 * margin - 5);
      pdf.text(lines, margin + 4, y);
      y += lines.length * 4 + 4;
    });

    y += 4;

    // Seasonality
    if (y + 10 > 280) { pdf.addPage(); y = margin; }
    pdf.setFontSize(14);
    pdf.setTextColor(248, 249, 250);
    pdf.text("Seasonality Insights", margin, y);
    y += 7;
    (data.seasonality || []).forEach((s) => {
      if (y + 12 > 280) { pdf.addPage(); y = margin; }
      pdf.setFontSize(11);
      pdf.setTextColor(248, 249, 250);
      pdf.text(`• ${s.period}`, margin, y);
      y += 5;
      pdf.setFontSize(9);
      pdf.setTextColor(160, 160, 160);
      const lines = pdf.splitTextToSize(s.insight, pageW - 2 * margin - 5);
      pdf.text(lines, margin + 4, y);
      y += lines.length * 4 + 4;
    });

    y += 4;

    // Actions
    if (y + 10 > 280) { pdf.addPage(); y = margin; }
    pdf.setFontSize(14);
    pdf.setTextColor(248, 249, 250);
    pdf.text("Recommended Actions", margin, y);
    y += 7;
    (data.actions || []).forEach((a, i) => {
      if (y + 10 > 280) { pdf.addPage(); y = margin; }
      pdf.setFontSize(10);
      pdf.setTextColor(160, 160, 160);
      const lines = pdf.splitTextToSize(`${i + 1}. ${a}`, pageW - 2 * margin);
      pdf.text(lines, margin, y);
      y += lines.length * 5 + 4;
    });

    pdf.save("demandiq-report.pdf");
  };

  return (
    <div ref={dashboardRef} data-testid="results-dashboard">
      {/* Header */}
      <div className="text-center mb-8 fade-in-up">
        <p className="text-xs uppercase tracking-[0.2em] font-medium mb-2" style={{ color: "#1ed760" }}>
          Analysis Complete
        </p>
        <h1
          className="text-4xl sm:text-5xl font-bold tracking-tighter text-white mb-3"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          Demand Report
        </h1>
        <p className="text-[#a1a1aa] text-sm">
          Niche: <span className="text-white font-medium">{formData.niche}</span>
        </p>
      </div>

      {/* Export buttons */}
      <div className="flex flex-wrap gap-3 justify-end mb-6 fade-in-up fade-in-up-1">
        <Button
          onClick={exportCSV}
          variant="outline"
          className="flex items-center gap-2 border-[#27272a] text-[#a1a1aa] hover:text-white hover:border-[#3f3f46] bg-transparent text-sm h-9"
          data-testid="export-csv-btn"
        >
          <FileSpreadsheet size={15} />
          Export CSV
        </Button>
        <Button
          onClick={exportPDF}
          variant="outline"
          className="flex items-center gap-2 border-[#27272a] text-[#a1a1aa] hover:text-white hover:border-[#3f3f46] bg-transparent text-sm h-9"
          data-testid="export-pdf-btn"
        >
          <FileDown size={15} />
          Export PDF
        </Button>
        <Button
          onClick={onNewAnalysis}
          className="flex items-center gap-2 bg-[#1ed760] text-black hover:bg-[#17a34a] font-semibold text-sm h-9"
          data-testid="new-analysis-btn"
        >
          <RotateCcw size={15} />
          New Analysis
        </Button>
      </div>

      {/* Summary Card */}
      <div
        className="rounded-lg border p-6 mb-6 fade-in-up fade-in-up-1"
        style={{ background: "#18181b", borderColor: "#27272a" }}
        data-testid="summary-card"
      >
        <p
          className="text-xs uppercase tracking-[0.2em] font-medium mb-3"
          style={{ color: "#1ed760" }}
        >
          Summary
        </p>
        <p className="text-[#a1a1aa] leading-relaxed text-base">{data.summary}</p>
      </div>

      {/* High / Low Demand columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* High Demand */}
        <div
          className="rounded-lg border p-5 fade-in-up fade-in-up-2"
          style={{ background: "#18181b", borderColor: "rgba(30,215,96,0.2)" }}
          data-testid="high-demand-section"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} style={{ color: "#1ed760" }} />
            <h3
              className="text-lg font-semibold text-white"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              High Demand
            </h3>
            <span
              className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(30,215,96,0.1)", color: "#1ed760", border: "1px solid rgba(30,215,96,0.2)" }}
            >
              {(data.high_demand || []).length} products
            </span>
          </div>
          <div className="space-y-3">
            {(data.high_demand || []).map((p, i) => (
              <div
                key={i}
                className="rounded-md p-3 border"
                style={{ background: "rgba(30,215,96,0.04)", borderColor: "rgba(30,215,96,0.1)" }}
                data-testid={`high-demand-item-${i}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-white text-sm font-medium">{p.product}</p>
                  <ConfidenceBadge level={p.confidence} />
                </div>
                <p className="text-[#a1a1aa] text-xs leading-relaxed">{p.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Low Demand */}
        <div
          className="rounded-lg border p-5 fade-in-up fade-in-up-3"
          style={{ background: "#18181b", borderColor: "rgba(239,68,68,0.2)" }}
          data-testid="low-demand-section"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={18} className="text-red-400" />
            <h3
              className="text-lg font-semibold text-white"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Low Demand
            </h3>
            <span
              className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              {(data.low_demand || []).length} products
            </span>
          </div>
          <div className="space-y-3">
            {(data.low_demand || []).map((p, i) => (
              <div
                key={i}
                className="rounded-md p-3 border"
                style={{ background: "rgba(239,68,68,0.04)", borderColor: "rgba(239,68,68,0.1)" }}
                data-testid={`low-demand-item-${i}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-white text-sm font-medium">{p.product}</p>
                  <ConfidenceBadge level={p.confidence} />
                </div>
                <p className="text-[#a1a1aa] text-xs leading-relaxed">{p.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confidence Bar Chart */}
      <div
        ref={chartRef}
        className="rounded-lg border p-5 mb-6 fade-in-up fade-in-up-3"
        style={{ background: "#18181b", borderColor: "#27272a" }}
        data-testid="confidence-chart"
      >
        <p
          className="text-xs uppercase tracking-[0.2em] font-medium mb-1"
          style={{ color: "#1ed760" }}
        >
          Confidence Levels
        </p>
        <h3
          className="text-lg font-semibold text-white mb-4"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          Product Demand Confidence
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="product"
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              domain={[0, 3]}
              ticks={[1, 2, 3]}
              tickFormatter={(v) => ["", "Low", "Med", "High"][v]}
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="confidence" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.type === "high" ? "#1ed760" : "#ef4444"}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 justify-center mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ background: "#1ed760" }} />
            <span className="text-xs text-[#a1a1aa]">High Demand</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ background: "#ef4444" }} />
            <span className="text-xs text-[#a1a1aa]">Low Demand</span>
          </div>
        </div>
      </div>

      {/* Seasonality Timeline */}
      <div
        className="rounded-lg border p-5 mb-6 fade-in-up fade-in-up-4"
        style={{ background: "#18181b", borderColor: "#27272a" }}
        data-testid="seasonality-section"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} style={{ color: "#1ed760" }} />
          <p
            className="text-xs uppercase tracking-[0.2em] font-medium"
            style={{ color: "#1ed760" }}
          >
            Seasonality
          </p>
        </div>
        <h3
          className="text-lg font-semibold text-white mb-4"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          Seasonal Demand Insights
        </h3>
        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-3 top-0 bottom-0 w-px"
            style={{ background: "linear-gradient(to bottom, #1ed760, rgba(30,215,96,0.1))" }}
          />
          <div className="space-y-6 pl-10">
            {(data.seasonality || []).map((s, i) => (
              <div key={i} className="relative" data-testid={`seasonality-item-${i}`}>
                {/* Timeline dot */}
                <div
                  className="absolute -left-7 top-1 w-3 h-3 rounded-full border-2"
                  style={{ background: "#09090b", borderColor: "#1ed760" }}
                />
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  <span style={{ color: "#1ed760" }}>{s.period}</span>
                </p>
                <p className="text-[#a1a1aa] text-sm leading-relaxed">{s.insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div
        className="rounded-lg border p-5 mb-4 fade-in-up fade-in-up-5"
        style={{ background: "#18181b", borderColor: "#27272a" }}
        data-testid="actions-section"
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} style={{ color: "#1ed760" }} />
          <p
            className="text-xs uppercase tracking-[0.2em] font-medium"
            style={{ color: "#1ed760" }}
          >
            Recommended Actions
          </p>
        </div>
        <h3
          className="text-lg font-semibold text-white mb-4"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          Your Next 3 Moves
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(data.actions || []).slice(0, 3).map((action, i) => (
            <div
              key={i}
              className="rounded-lg p-4 border hover:border-[#1ed760]/40 transition-colors duration-300 group"
              style={{ background: "rgba(30,215,96,0.03)", borderColor: "#27272a" }}
              data-testid={`action-card-${i}`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 font-bold text-sm"
                style={{ background: "rgba(30,215,96,0.12)", color: "#1ed760", fontFamily: "Outfit" }}
              >
                {i + 1}
              </div>
              <p className="text-[#a1a1aa] text-sm leading-relaxed group-hover:text-white transition-colors">
                {action}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
