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
      <circle cx="0" cy="0" r="0.55" fill="#0f172a" />
      <text
        x="0"
        y="-0.05"
        textAnchor="middle"
        className="text-[0.12px] font-bold fill-white"
      >
        Total
      </text>
      <text
        x="0"
        y="0.12"
        textAnchor="middle"
        className="text-[0.09px] fill-slate-400"
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
  const siteUrl = "https://salarysplit-rho.vercel.app";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(siteUrl)}&bgcolor=0f172a&color=60a5fa`;

  const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>SalarySplit - ${modeLabel} Budget Report</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #e2e8f0; background: #0f172a; padding: 40px; max-width: 800px; margin: 0 auto; }
      .header { text-align: center; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid #1e293b; }
      .logo { font-size: 26px; font-weight: 800; color: #fff; } .logo span { color: #60a5fa; }
      .subtitle { font-size: 13px; color: #94a3b8; margin-top: 4px; }
      .date { font-size: 11px; color: #64748b; margin-top: 6px; }
      .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
      .box { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 16px; }
      .box h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 10px; }
      .row { display: flex; justify-content: space-between; padding: 5px 0; } .row:not(:last-child) { border-bottom: 1px solid #1e293b44; }
      .lbl { font-size: 12px; color: #94a3b8; } .val { font-size: 12px; font-weight: 600; color: #e2e8f0; }
      .hl { background: #0d3320; border: 1px solid #166534; border-radius: 10px; padding: 16px; text-align: center; margin-bottom: 20px; }
      .hl-lbl { font-size: 11px; color: #6ee7b7; font-weight: 600; } .hl-amt { font-size: 22px; font-weight: 800; color: #34d399; margin: 2px 0; } .hl-sub { font-size: 11px; color: #6ee7b7; }
      .brk h2 { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 10px; }
      .cat { display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #1e293b; } .cat:last-child { border-bottom: none; }
      .dot { width: 8px; height: 8px; border-radius: 2px; margin-right: 10px; }
      .cname { flex: 1; font-size: 12px; color: #cbd5e1; } .camt { font-size: 12px; font-weight: 700; color: #e2e8f0; margin-right: 14px; min-width: 110px; text-align: right; } .cpct { font-size: 11px; color: #64748b; min-width: 36px; text-align: right; }
      .totrow { display: flex; justify-content: space-between; padding: 12px 0; border-top: 1px solid #475569; margin-top: 4px; font-weight: 700; font-size: 13px; color: #fff; }
      .ded { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 14px; margin-bottom: 20px; }
      .ded-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #f87171; margin-bottom: 8px; }
      .ded-total { display: flex; justify-content: space-between; padding-top: 6px; border-top: 1px solid #475569; font-weight: 700; font-size: 12px; color: #f87171; }
      .ft { text-align: center; padding-top: 20px; border-top: 1px solid #1e293b; margin-top: 20px; }
      .ft p { font-size: 10px; color: #64748b; } .ft a { color: #60a5fa; text-decoration: none; font-weight: 600; }
      .qr { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 14px; }
      .qr-txt { font-size: 11px; color: #94a3b8; text-align: left; line-height: 1.5; } .qr-txt strong { color: #60a5fa; }
      @media print { body { padding: 20px; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style></head><body>
    <div class="header"><div class="logo">Salary<span>Split</span></div><div class="subtitle">${modeLabel} Budget Allocation Report</div><div class="date">${dateStr}</div></div>
    <div class="grid2">
      <div class="box"><h3>Income</h3>
        <div class="row"><span class="lbl">Base Salary</span><span class="val">${formatRupiah(result.input.monthlyIncome)}</span></div>
        ${result.input.annualBonus > 0 ? `<div class="row"><span class="lbl">Annual Bonus</span><span class="val">${formatRupiah(result.input.annualBonus)}</span></div>` : ''}
        ${result.input.monthlyAllowances > 0 ? `<div class="row"><span class="lbl">Allowances</span><span class="val">${formatRupiah(result.input.monthlyAllowances)}</span></div>` : ''}
        <div class="row"><span class="lbl">Take-Home</span><span class="val" style="color:#34d399;">${formatRupiah(result.totalIncome)}</span></div>
      </div>
      <div class="box"><h3>Profile</h3>
        <div class="row"><span class="lbl">Status</span><span class="val">${result.input.maritalStatus.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</span></div>
        <div class="row"><span class="lbl">Housing</span><span class="val">${result.input.housingType.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</span></div>
        <div class="row"><span class="lbl">Tax</span><span class="val">${result.input.taxCovered?'Company':'Self'}</span></div>
        <div class="row"><span class="lbl">BPJS</span><span class="val">${result.input.hasBpjsKesehatan?'Active':'Off'}</span></div>
      </div>
    </div>
    ${result.payroll && result.payroll.totalEmployeeDeductions > 0 ? `<div class="ded"><div class="ded-title">Deductions</div>
      ${result.input.hasBpjsKesehatan && result.payroll.bpjsKesehatanEmployee > 0 ? `<div class="row"><span class="lbl">BPJS Kesehatan</span><span class="val">${formatRupiah(result.payroll.bpjsKesehatanEmployee)}</span></div>` : ''}
      ${result.payroll.jhtEmployee > 0 ? `<div class="row"><span class="lbl">JHT</span><span class="val">${formatRupiah(result.payroll.jhtEmployee)}</span></div>` : ''}
      ${result.payroll.jpEmployee > 0 ? `<div class="row"><span class="lbl">JP</span><span class="val">${formatRupiah(result.payroll.jpEmployee)}</span></div>` : ''}
      ${result.payroll.pph21Amount > 0 ? `<div class="row"><span class="lbl">PPh 21</span><span class="val">${formatRupiah(result.payroll.pph21Amount)}</span></div>` : ''}
      <div class="ded-total"><span>Total</span><span>-${formatRupiah(result.payroll.totalEmployeeDeductions)}</span></div>
    </div>` : ''}
    <div class="brk"><h2>Budget Breakdown</h2>
      ${categories.map(c=>`<div class="cat"><div class="dot" style="background:${c.color};"></div><div class="cname">${c.emoji} ${c.name}</div><div class="camt">${formatRupiah(c.amount)}</div><div class="cpct">${c.percentage}%</div></div>`).join('')}
      <div class="totrow"><span>Total</span><span>${formatRupiah(result.totalIncome)}</span></div>
    </div>
    <div class="ft"><p>Generated by <strong>SalarySplit</strong></p>
      <div class="qr"><img src="${qrUrl}" width="72" height="72" style="border-radius:6px;"/><div class="qr-txt"><strong>Try it yourself!</strong><br/>Scan or visit<br/><a href="${siteUrl}">${siteUrl.replace('https://','')}</a></div></div>
    </div></body></html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 600);
  }
}

// Generate and download JPG image of results — dark theme with QR
async function downloadImage(result: CalculatorResult, categories: CalculatorResult["categories"]) {
  const modeLabel = result.mode === "monthly" ? "Monthly" : "Annual";
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const siteUrl = "salarysplit-rho.vercel.app";

  const canvas = document.createElement("canvas");
  const scale = 2;
  const W = 800 * scale;
  const H = (560 + categories.length * 44) * scale;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  const w = 800;
  const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  // Dark background
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, w, H / scale);

  // Card
  const cardY = 16;
  const cardH = H / scale - 32;
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.roundRect(24, cardY, w - 48, cardH, 16);
  ctx.fill();
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Header
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 24px ${font}`;
  ctx.textAlign = "center";
  ctx.fillText("SalarySplit", w / 2, 58);

  ctx.fillStyle = "#94a3b8";
  ctx.font = `13px ${font}`;
  ctx.fillText(`${modeLabel} Budget Allocation — ${dateStr}`, w / 2, 78);

  // Take-home income
  ctx.fillStyle = "#34d399";
  ctx.font = `bold 20px ${font}`;
  ctx.fillText(`Take-Home: ${formatRupiah(result.totalIncome)}`, w / 2, 112);

  // Divider
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(56, 128);
  ctx.lineTo(w - 56, 128);
  ctx.stroke();

  // Category rows
  let y = 158;
  ctx.textAlign = "left";
  categories.forEach(cat => {
    ctx.fillStyle = cat.color;
    ctx.beginPath();
    ctx.arc(72, y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#e2e8f0";
    ctx.font = `14px ${font}`;
    ctx.fillText(`${cat.emoji}  ${cat.name}`, 92, y + 4);

    ctx.fillStyle = "#e2e8f0";
    ctx.font = `bold 14px ${font}`;
    ctx.textAlign = "right";
    ctx.fillText(formatRupiah(cat.amount), w - 140, y + 4);

    ctx.fillStyle = "#64748b";
    ctx.font = `13px ${font}`;
    ctx.fillText(`${cat.percentage}%`, w - 60, y + 4);

    // Progress bar bg
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.roundRect(92, y + 14, 400, 5, 3);
    ctx.fill();

    // Progress bar fill
    ctx.fillStyle = cat.color;
    ctx.beginPath();
    ctx.roundRect(92, y + 14, Math.max(3, 400 * cat.percentage / 100), 5, 3);
    ctx.fill();

    ctx.textAlign = "left";
    y += 44;
  });

  // Divider
  y += 8;
  ctx.strokeStyle = "#334155";
  ctx.beginPath();
  ctx.moveTo(56, y);
  ctx.lineTo(w - 56, y);
  ctx.stroke();
  y += 20;

  // Footer with URL
  ctx.fillStyle = "#64748b";
  ctx.font = `11px ${font}`;
  ctx.textAlign = "center";
  ctx.fillText("Generated by SalarySplit", w / 2, y);
  y += 18;
  ctx.fillStyle = "#60a5fa";
  ctx.font = `bold 13px ${font}`;
  ctx.fillText(`Try it yourself → ${siteUrl}`, w / 2, y);

  // Download
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Calculating your allocation...</p>
        </div>
      </div>
    );
  }

  const modeLabel = result.mode === "monthly" ? "Monthly" : "Annual";
  const modeLabelId = result.mode === "monthly" ? "Bulanan" : "Tahunan";

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-white">
              Salary<span className="text-blue-400">Split</span>
            </span>
          </Link>
          <Link
            href="/calculator"
            className="text-sm text-blue-400 font-semibold hover:text-blue-300 transition-colors"
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
            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              {modeLabel} — {modeLabelId}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              Your Budget Allocation
            </h1>
            <p className="text-slate-400 text-lg">
              Base salary:{" "}
              <span className="font-bold text-white">{formatRupiah(result.grossIncome)}</span>
              {" → "}Take-home:{" "}
              <span className="font-bold text-emerald-400">{formatRupiah(result.baseTakeHome)}</span>
              {result.extraIncome > 0 && (
                <>
                  {" + "}
                  <span className="font-bold text-blue-600">{formatRupiah(result.extraIncome)}</span>
                  <span className="text-sm"> extra</span>
                </>
              )}
            </p>
            {result.totalDebt > 0 && (
              <p className="text-sm text-red-400 mt-1">
                Debt/Bills: -{formatRupiah(result.totalDebt)} → Available: <span className="font-bold">{formatRupiah(result.availableAfterDebt)}</span>
              </p>
            )}
          </div>

          {/* Payroll Deduction Card */}
          {result.payroll && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-10">
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                🏛️ Payroll Deductions — Potongan Gaji
              </h3>

              {/* SALARY SUMMARY */}
              <div className="bg-slate-800/50 rounded-xl p-4 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Gross Salary</span>
                  <span className="font-bold text-white">{formatRupiah(result.payroll.grossSalary)}</span>
                </div>
              </div>

              {/* EMPLOYEE DEDUCTIONS — only show if there are deductions */}
              {result.payroll.totalEmployeeDeductions > 0 && (
              <div className="mb-5">
                <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">
                  Employee Deductions — Potongan Karyawan
                </div>
                <div className="space-y-2">
                  {result.input.hasBpjsKesehatan && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">BPJS Kesehatan (1%)</span>
                      <span className="font-semibold text-slate-200">
                        {formatRupiah(result.payroll.bpjsKesehatanEmployee)}
                        {result.payroll.bpjsKesehatanCoveredByCompany && (
                          <span className="text-xs text-emerald-400 ml-1">✓ Company</span>
                        )}
                      </span>
                    </div>
                  )}
                  {result.input.hasBpjsKetenagakerjaan && (result.payroll.jhtEmployee > 0 || result.payroll.jpEmployee > 0) && (
                    <>
                      {result.payroll.jhtEmployee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">JHT — Jaminan Hari Tua (2%)</span>
                          <span className="font-semibold text-slate-200">{formatRupiah(result.payroll.jhtEmployee)}</span>
                        </div>
                      )}
                      {result.payroll.jpEmployee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">JP — Jaminan Pensiun (1%)</span>
                          <span className="font-semibold text-slate-200">{formatRupiah(result.payroll.jpEmployee)}</span>
                        </div>
                      )}
                    </>
                  )}
                  {result.payroll.pph21Amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">
                        PPh 21 ({result.payroll.pph21Method === "TER" ? `TER ${(result.payroll.terRate * 100).toFixed(2)}%` : "Pasal 17"}, Cat {result.payroll.terCategory})
                      </span>
                      <span className="font-semibold text-slate-200">
                        {formatRupiah(result.payroll.pph21Amount)}
                        {result.payroll.pph21CoveredByCompany && (
                          <span className="text-xs text-emerald-400 ml-1">✓ Company</span>
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-800 font-bold">
                    <span className="text-red-500">Total Deductions</span>
                    <span className="text-red-500">-{formatRupiah(result.payroll.totalEmployeeDeductions)}</span>
                  </div>
                </div>
              </div>
              )}

              {/* RESULT: Take-Home Pay */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-emerald-400">Take-Home Pay — Gaji Bersih</span>
                  <span className="text-xl font-bold text-emerald-400">{formatRupiah(result.payroll.employeeTakeHome)}</span>
                </div>
              </div>

              {/* ADVANCED: Employer Contributions (collapsible) */}
              <details className="group">
                <summary className="cursor-pointer text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1 select-none">
                  <span className="group-open:rotate-90 transition-transform">▶</span>
                  Advanced — Employer Contributions
                </summary>
                <div className="space-y-2 mt-2">
                  {result.input.hasBpjsKesehatan && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">BPJS Kesehatan employer (4%)</span>
                      <span className="font-semibold text-slate-200">{formatRupiah(result.payroll.bpjsKesehatanEmployer)}</span>
                    </div>
                  )}
                  {result.input.hasBpjsKetenagakerjaan && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">JHT employer (3.7%)</span>
                        <span className="font-semibold text-slate-200">{formatRupiah(result.payroll.jhtEmployer)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">JP employer (2%)</span>
                        <span className="font-semibold text-slate-200">{formatRupiah(result.payroll.jpEmployer)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">JKK — Kecelakaan Kerja</span>
                        <span className="font-semibold text-slate-200">{formatRupiah(result.payroll.jkkEmployer)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">JKM — Kematian (0.3%)</span>
                        <span className="font-semibold text-slate-200">{formatRupiah(result.payroll.jkmEmployer)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-800">
                    <span className="font-semibold text-slate-400">Total Employer Contributions</span>
                    <span className="font-bold text-slate-200">{formatRupiah(result.payroll.totalEmployerContributions)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-700">
                    <span className="font-semibold text-slate-300">Total Company Payroll Cost</span>
                    <span className="font-bold text-white">{formatRupiah(result.payroll.totalCompanyCost)}</span>
                  </div>
                </div>
              </details>

              <p className="text-xs text-amber-400 mt-4 bg-amber-500/10 rounded-lg p-2">
                ⚠️ Planning tool — verify against current Indonesian tax & BPJS regulations.
              </p>
            </div>
          )}

          {/* Chart + Summary */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {/* Pie Chart */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex items-center justify-center">
              <PieChart categories={adjustedCategories} />
            </div>

            {/* Quick Summary */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
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
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-800/30 last:border-0">
                    <span className="text-sm text-slate-400">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-300">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 rounded-xl">
                <div className="text-xs text-blue-400 font-semibold mb-1">
                  Savings + Investments + Emergency
                </div>
                <div className="text-xl font-extrabold text-blue-400">
                  {formatRupiah(
                    adjustedCategories
                      .filter((c) => ["Savings", "Investments", "Emergency Fund"].includes(c.name))
                      .reduce((sum, c) => sum + c.amount, 0)
                  )}
                </div>
                <div className="text-xs text-blue-400/70 mt-1">
                  {adjustedCategories
                    .filter((c) => ["Savings", "Investments", "Emergency Fund"].includes(c.name))
                    .reduce((sum, c) => sum + c.percentage, 0)}% of your income goes to building wealth
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
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
                        <span className="text-sm font-semibold text-slate-300">{cat.name}</span>
                        <span className="text-sm font-bold text-white">
                          {formatRupiah(cat.amount)}
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-slate-800 rounded-full h-2">
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
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-400">Total</span>
              <span
                className={`text-sm font-bold ${
                  adjustedCategories.reduce((s, c) => s + c.percentage, 0) === 100
                    ? "text-emerald-400"
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
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>
              Download PDF — Unduh PDF
            </button>
            <button
              type="button"
              onClick={() => downloadImage(result, adjustedCategories)}
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/25"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Download Image — Unduh Gambar
            </button>
          </div>

          {/* Secondary actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <Link
              href="/calculator"
              className="text-center bg-transparent text-blue-400 border-2 border-blue-500 px-6 py-3 rounded-xl font-semibold hover:bg-blue-500/10 transition-all"
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
              className="text-center bg-transparent text-slate-400 border-2 border-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 hover:border-slate-600 transition-all"
            >
              📋 Copy Text — Salin Teks
            </button>
          </div>

          {/* Financial Analytics — Dark Fintech Style */}
          <div className="mt-8 bg-slate-900 rounded-2xl p-6 overflow-hidden relative">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 pointer-events-none" />

            <div className="relative">
              {/* Header with health score */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-bold text-lg">Financial Health</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Analisis Keuangan</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    result.analytics.healthScore >= 70 ? "text-emerald-400" :
                    result.analytics.healthScore >= 40 ? "text-amber-400" : "text-red-400"
                  }`}>
                    {result.analytics.healthScore}
                  </div>
                  <div className="text-slate-500 text-xs">/ 100</div>
                </div>
              </div>

              {/* Health bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 mb-6">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    result.analytics.healthScore >= 70 ? "bg-emerald-500" :
                    result.analytics.healthScore >= 40 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${result.analytics.healthScore}%` }}
                />
              </div>

              {/* Insight cards grid */}
              <div className="grid sm:grid-cols-2 gap-3">
                {result.analytics.insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl p-4 border ${
                      insight.status === "good" ? "bg-emerald-500/10 border-emerald-500/20" :
                      insight.status === "warning" ? "bg-amber-500/10 border-amber-500/20" :
                      insight.status === "danger" ? "bg-red-500/10 border-red-500/20" :
                      "bg-slate-800/50 border-slate-700/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{insight.icon}</span>
                        <span className="text-slate-300 text-xs font-medium uppercase tracking-wider">{insight.title}</span>
                      </div>
                      <span className={`text-sm font-bold ${
                        insight.status === "good" ? "text-emerald-400" :
                        insight.status === "warning" ? "text-amber-400" :
                        insight.status === "danger" ? "text-red-400" :
                        "text-blue-400"
                      }`}>
                        {insight.value}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-500 text-xs">
                  {result.budgetRule === "50_30_20" ? "50/30/20" : result.budgetRule === "80_20" ? "80/20" : result.budgetRule === "70_20_10" ? "70/20/10" : "Custom"} Method
                </span>
                <span className="text-slate-600 text-xs">
                  SalarySplit
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
