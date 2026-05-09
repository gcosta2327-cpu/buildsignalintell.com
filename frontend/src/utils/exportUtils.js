import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Papa from "papaparse";

export function exportCSV(data) {
  const rows = [
    ...(data.high_demand || []).map((p) => ({
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
  a.download = "buildsignal-analysis.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportPDF(data, formData, chartRef) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 15;
  let y = margin;

  // Title
  pdf.setFontSize(24);
  pdf.setTextColor(30, 215, 96);
  pdf.text("BuildSignal Analysis Report", margin, y);
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
    } catch {
      // Chart capture failed — continue without chart image
    }
  }

  // High Demand
  if (y + 10 > 280) { pdf.addPage(); y = margin; }
  pdf.setFontSize(14);
  pdf.setTextColor(30, 215, 96);
  pdf.text("High Demand Products", margin, y);
  y += 7;
  for (const p of (data.high_demand || [])) {
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
  }

  y += 4;

  // Low Demand
  if (y + 10 > 280) { pdf.addPage(); y = margin; }
  pdf.setFontSize(14);
  pdf.setTextColor(239, 68, 68);
  pdf.text("Low Demand Products", margin, y);
  y += 7;
  for (const p of (data.low_demand || [])) {
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
  }

  y += 4;

  // Seasonality
  if (y + 10 > 280) { pdf.addPage(); y = margin; }
  pdf.setFontSize(14);
  pdf.setTextColor(248, 249, 250);
  pdf.text("Seasonality Insights", margin, y);
  y += 7;
  for (const s of (data.seasonality || [])) {
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
  }

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

  pdf.save("buildsignal-report.pdf");
}

export function buildChartData(highDemand = [], lowDemand = []) {
  const CONFIDENCE_VALUE = { high: 3, medium: 2, low: 1 };
  return [
    ...highDemand.map((p) => ({
      product: p.product.length > 18 ? p.product.slice(0, 18) + "…" : p.product,
      fullProduct: p.product,
      confidence: CONFIDENCE_VALUE[p.confidence] || 1,
      originalConfidence: p.confidence,
      type: "high",
    })),
    ...lowDemand.map((p) => ({
      product: p.product.length > 18 ? p.product.slice(0, 18) + "…" : p.product,
      fullProduct: p.product,
      confidence: CONFIDENCE_VALUE[p.confidence] || 1,
      originalConfidence: p.confidence,
      type: "low",
    })),
  ];
}
