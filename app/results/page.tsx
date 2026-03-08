"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { calculateAllocation, formatRupiah } from "@/lib/calculator";
import type { CalculatorInput, CalculatorResult } from "@/types/calculator";

// Simple SVG Pie Chart component
function PieChart({ categories }: { categories: CalculatorResult["categories"] }) {
  let cumulativePercent = 0;

  function getCoordinatesForPercent(percent: number) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  }

  return (
    <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full max-w-xs mx-auto">
      {categories.map((cat, i) => {
        const startPercent = cumulativePercent;
        const slicePercent = cat.percentage / 100;
        cumulativePercent += slicePercent;

        const [startX, startY] = getCoordinatesForPercent(startPercent);
        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
        const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

        const pathData = [
          `M ${startX} ${startY}`,
          `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
          `L 0 0`,
        ].join(" ");

        return (
          <path
            key={i}
            d={pathData}
            fill={cat.color}
            stroke="white"
            strokeWidth="0.02"
            className="hover:opacity-80 transition-opacity cursor-pointer"
          >
            <title>{cat.name}: {cat.percentage}%</title>
          </path>
        );
      })}
      {/* Center circle for donut effect */}
      <circle cx="0" cy="0" r="0.55" fill="white" />
      <text
        x="0"
        y="-0.05"
        textAnchor="middle"
        className="text-[0.12px] font-bold fill-slate-800"
      >
        Total
      </text>
      <text
        x="0"
        y="0.12"
        textAnchor="middle"
        className="text-[0.09px] fill-slate-500"
      >
        100%
      </text>
    </svg>
  );
}

// Generate and download PDF
function downloadPDF(result: CalculatorResult, categories: CalculatorResult["categories"]) {
  const modeLabel = result.mode === "monthly" ? "Monthly" : "Annual";
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  // Build SVG-based PDF content as an HTML page for printing
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SalarySplit - ${modeLabel} Budget Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0; }
        .logo { font-size: 28px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
        .logo span { color: #2563eb; }
        .subtitle { font-size: 14px; color: #64748b; }
        .date { font-size: 12px; color: #94a3b8; margin-top: 8px; }
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
        .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
        .summary-box h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 12px; }
        .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
        .summary-row:last-child { border-bottom: none; }
        .summary-label { font-size: 13px; color: #64748b; }
        .summary-value { font-size: 13px; font-weight: 600; color: #1e293b; }
        .highlight-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 32px; }
        .highlight-label { font-size: 12px; color: #2563eb; font-weight: 600; }
        .highlight-amount { font-size: 24px; font-weight: 800; color: #1d4ed8; margin: 4px 0; }
        .highlight-sub { font-size: 12px; color: #3b82f6; }
        .breakdown { margin-bottom: 32px; }
        .breakdown h2 { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
        .category-row { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .category-row:last-child { border-bottom: none; }
        .cat-color { width: 12px; height: 12px; border-radius: 4px; margin-right: 12px; flex-shrink: 0; }
        .cat-name { flex: 1; font-size: 14px; font-weight: 500; }
        .cat-amount { font-size: 14px; font-weight: 700; margin-right: 16px; min-width: 140px; text-align: right; }
        .cat-pct { font-size: 13px; color: #64748b; min-width: 40px; text-align: right; }
        .total-row { display: flex; justify-content: space-between; padding: 16px 0; border-top: 2px solid #1e293b; margin-top: 8px; font-weight: 700; font-size: 15px; }
        .footer { text-align: center; padding-top: 24px; border-top: 1px solid #e2e8f0; margin-top: 32px; }
        .footer p { font-size: 11px; color: #94a3b8; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Salary<span>Split</span></div>
        <div class="subtitle">${modeLabel} Budget Allocation Report</div>
        <div class="date">Generated on ${dateStr}</div>
      </div>

      <div class="summary-grid">
        <div class="summary-box">
          <h3>Income Details</h3>
          <div class="summary-row">
            <span class="summary-label">Monthly Salary</span>
            <span class="summary-value">${formatRupiah(result.input.monthlyIncome)}</span>
          </div>
          ${result.input.annualBonus > 0 ? `
          <div class="summary-row">
            <span class="summary-label">Annual Bonus</span>
            <span class="summary-value">${formatRupiah(result.input.annualBonus)}</span>
          </div>` : ''}
          ${result.input.monthlyAllowances > 0 ? `
          <div class="summary-row">
            <span class="summary-label">Monthly Allowances</span>
            <span class="summary-value">${formatRupiah(result.input.monthlyAllowances)}</span>
          </div>` : ''}
          <div class="summary-row">
            <span class="summary-label">Total ${modeLabel} Income</span>
            <span class="summary-value" style="color: #2563eb;">${formatRupiah(result.totalIncome)}</span>
          </div>
        </div>
        <div class="summary-box">
          <h3>Your Profile</h3>
          <div class="summary-row">
            <span class="summary-label">Status</span>
            <span class="summary-value">${result.input.maritalStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Housing</span>
            <span class="summary-value">${result.input.housingType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Tax</span>
            <span class="summary-value">${result.input.taxCovered ? 'Company-paid' : 'Self-paid'}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Medical</span>
            <span class="summary-value">${result.input.medicalCovered ? 'Company-covered' : 'Self-paid'}</span>
          </div>
        </div>
      </div>

      <div class="highlight-box">
        <div class="highlight-label">Savings + Investments + Emergency Fund</div>
        <div class="highlight-amount">${formatRupiah(
          categories
            .filter(c => ["Savings", "Investments", "Emergency Fund"].includes(c.name))
            .reduce((sum, c) => sum + c.amount, 0)
        )}</div>
        <div class="highlight-sub">${
          categories
            .filter(c => ["Savings", "Investments", "Emergency Fund"].includes(c.name))
            .reduce((sum, c) => sum + c.percentage, 0)
        }% of your income goes to building wealth</div>
      </div>

      <div class="breakdown">
        <h2>Budget Breakdown</h2>
        ${categories.map(cat => `
          <div class="category-row">
            <div class="cat-color" style="background-color: ${cat.color};"></div>
            <div class="cat-name">${cat.emoji} ${cat.name}</div>
            <div class="cat-amount">${formatRupiah(cat.amount)}</div>
            <div class="cat-pct">${cat.percentage}%</div>
          </div>
        `).join('')}
        <div class="total-row">
          <span>Total</span>
          <span>${formatRupiah(result.totalIncome)} — 100%</span>
        </div>
      </div>

      <div class="footer">
        <p>Generated by SalarySplit — Smart Salary Allocation Calculator</p>
        <p style="margin-top: 4px;">salarysplit.vercel.app</p>
      </div>
    </body>
    </html>
  `;

  // Open in new window and trigger print (which allows saving as PDF)
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    // Small delay to let styles load
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}

// Generate and download JPG image of results
async function downloadImage(result: CalculatorResult, categories: CalculatorResult["categories"]) {
  const modeLabel = result.mode === "monthly" ? "Monthly" : "Annual";
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const wealthCats = categories.filter(c => ["Savings", "Investments", "Emergency Fund"].includes(c.name));
  const wealthAmount = wealthCats.reduce((sum, c) => sum + c.amount, 0);
  const wealthPct = wealthCats.reduce((sum, c) => sum + c.percentage, 0);

  // Create an offscreen canvas
  const canvas = document.createElement("canvas");
  const scale = 2; // retina
  const W = 800 * scale;
  const H = (520 + categories.length * 44) * scale;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  const w = 800;

  // Background
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, w, H / scale);

  // White card area
  const cardY = 16;
  const cardH = H / scale - 32;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(24, cardY, w - 48, cardH, 16);
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Header
  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SalarySplit", w / 2, 60);
  
  ctx.fillStyle = "#64748b";
  ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(`${modeLabel} Budget Allocation — ${dateStr}`, w / 2, 82);

  // Total Income
  ctx.fillStyle = "#2563eb";
  ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(`Total Income: ${formatRupiah(result.totalIncome)}`, w / 2, 116);

  // Divider
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(56, 132);
  ctx.lineTo(w - 56, 132);
  ctx.stroke();

  // Category rows
  let y = 164;
  ctx.textAlign = "left";
  categories.forEach(cat => {
    // Color dot
    ctx.fillStyle = cat.color;
    ctx.beginPath();
    ctx.arc(72, y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Emoji + Name
    ctx.fillStyle = "#1e293b";
    ctx.font = "15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(`${cat.emoji}  ${cat.name}`, 92, y + 5);

    // Amount
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(formatRupiah(cat.amount), w - 140, y + 5);

    // Percentage
    ctx.fillStyle = "#64748b";
    ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(`${cat.percentage}%`, w - 60, y + 5);

    // Progress bar background
    ctx.fillStyle = "#f1f5f9";
    ctx.beginPath();
    ctx.roundRect(92, y + 14, 400, 6, 3);
    ctx.fill();

    // Progress bar fill
    ctx.fillStyle = cat.color;
    ctx.beginPath();
    ctx.roundRect(92, y + 14, Math.max(4, 400 * cat.percentage / 100), 6, 3);
    ctx.fill();

    ctx.textAlign = "left";
    y += 44;
  });

  // Divider before wealth summary
  y += 8;
  ctx.strokeStyle = "#e2e8f0";
  ctx.beginPath();
  ctx.moveTo(56, y);
  ctx.lineTo(w - 56, y);
  ctx.stroke();
  y += 24;

  // Wealth summary box
  ctx.fillStyle = "#eff6ff";
  ctx.beginPath();
  ctx.roundRect(56, y, w - 112, 64, 12);
  ctx.fill();
  ctx.strokeStyle = "#bfdbfe";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#1d4ed8";
  ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`Savings + Investments + Emergency: ${formatRupiah(wealthAmount)} (${wealthPct}%)`, w / 2, y + 38);

  // Footer
  y += 88;
  ctx.fillStyle = "#94a3b8";
  ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Generated by SalarySplit — salarysplit.vercel.app", w / 2, y);

  // Download as JPG
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SalarySplit_Budget_${result.mode}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, "image/jpeg", 0.95);
}

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [adjustedCategories, setAdjustedCategories] = useState<CalculatorResult["categories"]>([]);

  useEffect(() => {
    // Read input from sessionStorage
    const stored = sessionStorage.getItem("calculatorInput");
    if (!stored) {
      router.push("/calculator");
      return;
    }

    try {
      const input: CalculatorInput = JSON.parse(stored);
      const calcResult = calculateAllocation(input);
      setResult(calcResult);
      setAdjustedCategories(calcResult.categories);
    } catch {
      router.push("/calculator");
    }
  }, [router]);

  // Handle percentage adjustment
  function adjustPercentage(index: number, newPercentage: number) {
    if (newPercentage < 0 || newPercentage > 100) return;

    const updated = [...adjustedCategories];
    const oldPercentage = updated[index].percentage;
    const diff = newPercentage - oldPercentage;

    updated[index] = {
      ...updated[index],
      percentage: newPercentage,
      amount: Math.round((result!.totalIncome * newPercentage) / 100),
    };

    // Distribute the difference to "Other" or last category
    const otherIndex = updated.findIndex((c) => c.name === "Other / Misc");
    if (otherIndex !== -1 && otherIndex !== index) {
      const newOtherPct = updated[otherIndex].percentage - diff;
      if (newOtherPct >= 0) {
        updated[otherIndex] = {
          ...updated[otherIndex],
          percentage: newOtherPct,
          amount: Math.round((result!.totalIncome * newOtherPct) / 100),
        };
      }
    }

    setAdjustedCategories(updated);
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Calculating your allocation...</p>
        </div>
      </div>
    );
  }

  const modeLabel = result.mode === "monthly" ? "Monthly" : "Annual";
  const modeLabelId = result.mode === "monthly" ? "Bulanan" : "Tahunan";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-slate-800">
              Salary<span className="text-blue-600">Split</span>
            </span>
          </Link>
          <Link
            href="/calculator"
            className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            ← Recalculate
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              {modeLabel} — {modeLabelId}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
              Your Budget Allocation
            </h1>
            <p className="text-slate-500 text-lg">
              Total {modeLabel} Income:{" "}
              <span className="font-bold text-slate-800">
                {formatRupiah(result.totalIncome)}
              </span>
            </p>
          </div>

          {/* Chart + Summary */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {/* Pie Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-center">
              <PieChart categories={adjustedCategories} />
            </div>

            {/* Quick Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Your Profile
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Status", value: result.input.maritalStatus.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) },
                  { label: "Housing", value: result.input.housingType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) },
                  { label: "Tax", value: result.input.taxCovered ? "Company-paid ✓" : "Self-paid" },
                  { label: "Medical", value: result.input.medicalCovered ? "Company-covered ✓" : "Self-paid" },
                  { label: "Mode", value: modeLabel },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-500">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-700">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <div className="text-xs text-blue-600 font-semibold mb-1">
                  Savings + Investments + Emergency
                </div>
                <div className="text-xl font-extrabold text-blue-700">
                  {formatRupiah(
                    adjustedCategories
                      .filter((c) => ["Savings", "Investments", "Emergency Fund"].includes(c.name))
                      .reduce((sum, c) => sum + c.amount, 0)
                  )}
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  {adjustedCategories
                    .filter((c) => ["Savings", "Investments", "Emergency Fund"].includes(c.name))
                    .reduce((sum, c) => sum + c.percentage, 0)}% of your income goes to building wealth
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">
                Detailed Breakdown — Rincian Alokasi
              </h3>
              <span className="text-xs text-slate-400">Adjust percentages below</span>
            </div>

            <div className="space-y-4">
              {adjustedCategories.map((cat, index) => (
                <div key={cat.name} className="group">
                  <div className="flex items-center gap-4">
                    {/* Color + Emoji */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: cat.color + "15" }}
                    >
                      {cat.emoji}
                    </div>

                    {/* Name + Bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-slate-700">{cat.name}</span>
                        <span className="text-sm font-bold text-slate-800">
                          {formatRupiah(cat.amount)}
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(cat.percentage, 100)}%`,
                            backgroundColor: cat.color,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Percentage Input */}
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={cat.percentage}
                        onChange={(e) => adjustPercentage(index, parseInt(e.target.value) || 0)}
                        className="w-14 text-center text-sm font-bold text-slate-700 border border-slate-200 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-sm text-slate-400">%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Check */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">Total</span>
              <span
                className={`text-sm font-bold ${
                  adjustedCategories.reduce((s, c) => s + c.percentage, 0) === 100
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {adjustedCategories.reduce((s, c) => s + c.percentage, 0)}%
                {adjustedCategories.reduce((s, c) => s + c.percentage, 0) !== 100 &&
                  " — should be 100%"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <button
              type="button"
              onClick={() => downloadPDF(result, adjustedCategories)}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>
              Download PDF — Unduh PDF
            </button>
            <button
              type="button"
              onClick={() => downloadImage(result, adjustedCategories)}
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/25"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Download Image — Unduh Gambar
            </button>
          </div>

          {/* Secondary actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <Link
              href="/calculator"
              className="text-center bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all"
            >
              ← Recalculate — Hitung Ulang
            </Link>
            <button
              type="button"
              onClick={() => {
                const text = adjustedCategories
                  .map((c) => `${c.emoji} ${c.name}: ${formatRupiah(c.amount)} (${c.percentage}%)`)
                  .join("\n");
                const summary = `SalarySplit — ${modeLabel} Budget\nTotal Income: ${formatRupiah(result.totalIncome)}\n\n${text}`;
                navigator.clipboard.writeText(summary);
                alert("Copied to clipboard! — Tersalin ke clipboard!");
              }}
              className="text-center bg-white text-slate-600 border-2 border-slate-300 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all"
            >
              📋 Copy Text — Salin Teks
            </button>
          </div>

          {/* Tip */}
          <div className="mt-8 bg-blue-50 rounded-2xl p-6 text-center">
            <p className="text-sm text-blue-700 font-medium mb-1">
              💡 Tip Keuangan — Financial Tip
            </p>
            <p className="text-sm text-blue-600">
              {result.input.maritalStatus === "single"
                ? "As a single professional, aim to save at least 20% of your income. Your future self will thank you! Mulailah menabung dan investasi sedini mungkin."
                : result.input.maritalStatus === "married"
                ? "As a couple, communicate about finances regularly. Consider setting shared savings goals. Diskusikan keuangan secara terbuka dengan pasangan."
                : "With children, an emergency fund of 6 months expenses is essential. Prioritize insurance coverage. Pastikan dana darurat cukup untuk 6 bulan pengeluaran."}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
