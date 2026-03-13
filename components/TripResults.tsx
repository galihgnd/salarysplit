"use client";

import type { TripResult } from "@/types/trip";
import { formatRupiahTrip } from "@/lib/trip-calculator";
import { getEmergencyFundNote } from "@/lib/destinations";

interface TripResultsProps {
  result: TripResult;
}

// Simple Donut Chart for trip categories
function TripPieChart({ categories }: { categories: TripResult["categories"] }) {
  let cumulativePercent = 0;

  function getCoords(percent: number) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  }

  return (
    <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full max-w-[200px] mx-auto">
      {categories.map((cat, i) => {
        const startPercent = cumulativePercent;
        const slicePercent = cat.percentage / 100;
        cumulativePercent += slicePercent;

        const [startX, startY] = getCoords(startPercent);
        const [endX, endY] = getCoords(cumulativePercent);
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
            stroke="#0f172a"
            strokeWidth="0.02"
            className="hover:opacity-80 transition-opacity cursor-pointer"
          >
            <title>{cat.name}: {cat.percentage}%</title>
          </path>
        );
      })}
      <circle cx="0" cy="0" r="0.55" fill="#0f172a" />
      <text x="0" y="-0.05" textAnchor="middle" className="text-[0.11px] font-bold fill-white">
        Trip
      </text>
      <text x="0" y="0.12" textAnchor="middle" className="text-[0.08px] fill-slate-400">
        Budget
      </text>
    </svg>
  );
}

// ============ PDF Download ============
function downloadTripPDF(result: TripResult) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const destination = result.input.destination || "Custom Trip";
  const siteUrl = "https://salarysplit-rho.vercel.app";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(siteUrl)}&bgcolor=0f172a&color=60a5fa`;
  const emergencyNote = getEmergencyFundNote(result.input.destination);

  const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>SalarySplit - Trip Budget Report</title>
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
      .warn { background: #422006; border: 1px solid #854d0e; border-radius: 10px; padding: 14px; margin-top: 20px; }
      .warn-title { font-size: 11px; font-weight: 700; color: #fbbf24; margin-bottom: 6px; }
      .warn-item { font-size: 11px; color: #94a3b8; padding: 2px 0; }
      .ft { text-align: center; padding-top: 20px; border-top: 1px solid #1e293b; margin-top: 20px; }
      .ft p { font-size: 10px; color: #64748b; } .ft a { color: #60a5fa; text-decoration: none; font-weight: 600; }
      .qr { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 14px; }
      .qr-txt { font-size: 11px; color: #94a3b8; text-align: left; line-height: 1.5; } .qr-txt strong { color: #60a5fa; }
      @media print { body { padding: 20px; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style></head><body>
    <div class="header"><div class="logo">Salary<span>Split</span></div><div class="subtitle">✈️ Trip Budget Report — ${destination}</div><div class="date">${dateStr}</div></div>
    <div class="grid2">
      <div class="box"><h3>Trip Details</h3>
        <div class="row"><span class="lbl">Destination</span><span class="val">${destination}</span></div>
        <div class="row"><span class="lbl">Duration</span><span class="val">${result.input.durationNights} nights</span></div>
        <div class="row"><span class="lbl">Travelers</span><span class="val">${result.input.travelers} person(s)</span></div>
      </div>
      <div class="box"><h3>Summary</h3>
        <div class="row"><span class="lbl">Total Budget</span><span class="val" style="color:#34d399;">${formatRupiahTrip(result.grandTotal)}</span></div>
        <div class="row"><span class="lbl">Per Person</span><span class="val">${formatRupiahTrip(result.perPerson)}</span></div>
        <div class="row"><span class="lbl">Per Day</span><span class="val">${formatRupiahTrip(result.perDay)}</span></div>
        ${result.monthsToSave ? `<div class="row"><span class="lbl">Months to Save</span><span class="val" style="color:#fbbf24;">${result.monthsToSave} mo</span></div>` : ''}
      </div>
    </div>
    <div class="brk"><h2>Cost Breakdown</h2>
      ${result.categories.map(c => `<div class="cat"><div class="dot" style="background:${c.color};"></div><div class="cname">${c.emoji} ${c.name}</div><div class="camt">${formatRupiahTrip(c.amount)}</div><div class="cpct">${c.percentage}%</div></div>`).join('')}
      <div class="totrow"><span>Total</span><span>${formatRupiahTrip(result.grandTotal)}</span></div>
    </div>
    ${emergencyNote ? `<div class="warn"><div class="warn-title">⚠️ ${emergencyNote.title}</div>${emergencyNote.notes.map(n => `<div class="warn-item">• ${n}</div>`).join('')}</div>` : ''}
    <div class="ft"><p>Generated by <strong>SalarySplit</strong></p>
      <div class="qr"><img src="${qrUrl}" width="72" height="72" style="border-radius:6px;"/><div class="qr-txt"><strong>Plan your trip!</strong><br/>Scan or visit<br/><a href="${siteUrl}">${siteUrl.replace('https://', '')}</a></div></div>
    </div></body></html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 600);
  }
}

// ============ Image Download ============
async function downloadTripImage(result: TripResult) {
  const destination = result.input.destination || "Custom Trip";
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const emergencyNote = getEmergencyFundNote(result.input.destination);
  const siteUrl = "salarysplit-rho.vercel.app";

  const canvas = document.createElement("canvas");
  const scale = 2;
  const extraHeight = emergencyNote ? 100 : 0;
  const W = 800 * scale;
  const H = (520 + result.categories.length * 44 + extraHeight) * scale;
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
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.roundRect(24, 16, w - 48, H / scale - 32, 16);
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
  ctx.fillText(`✈️ Trip Budget — ${destination} — ${dateStr}`, w / 2, 78);

  // Grand total
  ctx.fillStyle = "#34d399";
  ctx.font = `bold 22px ${font}`;
  ctx.fillText(`Total: ${formatRupiahTrip(result.grandTotal)}`, w / 2, 112);

  // Sub info
  ctx.fillStyle = "#94a3b8";
  ctx.font = `12px ${font}`;
  ctx.fillText(
    `${result.input.durationNights} nights • ${result.input.travelers} traveler(s) • Per person: ${formatRupiahTrip(result.perPerson)} • Per day: ${formatRupiahTrip(result.perDay)}`,
    w / 2,
    134
  );

  // Divider
  ctx.strokeStyle = "#334155";
  ctx.beginPath();
  ctx.moveTo(56, 150);
  ctx.lineTo(w - 56, 150);
  ctx.stroke();

  // Category rows
  let y = 180;
  ctx.textAlign = "left";
  result.categories.forEach(cat => {
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
    ctx.fillText(formatRupiahTrip(cat.amount), w - 140, y + 4);

    ctx.fillStyle = "#64748b";
    ctx.font = `13px ${font}`;
    ctx.fillText(`${cat.percentage}%`, w - 60, y + 4);

    // Progress bar
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.roundRect(92, y + 14, 400, 5, 3);
    ctx.fill();

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

  // Emergency Fund Note (if applicable)
  if (emergencyNote) {
    ctx.fillStyle = "#854d0e";
    ctx.beginPath();
    ctx.roundRect(56, y, w - 112, 70, 8);
    ctx.fill();

    ctx.fillStyle = "#fbbf24";
    ctx.font = `bold 12px ${font}`;
    ctx.fillText(`⚠️ ${emergencyNote.title}`, 72, y + 20);

    ctx.fillStyle = "#d4d4d8";
    ctx.font = `11px ${font}`;
    ctx.fillText(`Keep an extra ${emergencyNote.percentage}% of your budget as emergency fund`, 72, y + 40);
    ctx.fillText(emergencyNote.notes[1] || "", 72, y + 56);

    y += 86;
  }

  // Footer
  ctx.fillStyle = "#64748b";
  ctx.font = `11px ${font}`;
  ctx.textAlign = "center";
  ctx.fillText("Generated by SalarySplit", w / 2, y);
  y += 18;
  ctx.fillStyle = "#60a5fa";
  ctx.font = `bold 13px ${font}`;
  ctx.fillText(`🌐 ${siteUrl}`, w / 2, y);

  // Download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `salarysplit-trip-${destination.toLowerCase().replace(/\s+/g, "-")}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/jpeg", 0.95);
}

// ============ Component ============
export default function TripResults({ result }: TripResultsProps) {
  const emergencyNote = getEmergencyFundNote(result.input.destination);

  return (
    <div className="space-y-6">
      {/* Grand Total Card */}
      <div className="bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-blue-600/5 rounded-2xl border border-blue-500/20 p-6 text-center">
        <div className="text-sm font-semibold text-blue-400 mb-1">
          Total Trip Budget — Total Biaya Perjalanan
        </div>
        <div className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          {formatRupiahTrip(result.grandTotal)}
        </div>
        <div className="flex items-center justify-center gap-6 text-sm">
          <div>
            <span className="text-slate-400">Per person: </span>
            <span className="font-bold text-blue-400">{formatRupiahTrip(result.perPerson)}</span>
          </div>
          <div>
            <span className="text-slate-400">Per day: </span>
            <span className="font-bold text-purple-400">{formatRupiahTrip(result.perDay)}</span>
          </div>
        </div>
      </div>

      {/* Emergency Fund Reminder */}
      {emergencyNote && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">⚠️</span>
            <div>
              <h3 className="text-sm font-bold text-amber-400 mb-1">
                {emergencyNote.title}
              </h3>
              <div className="bg-amber-500/10 rounded-lg px-3 py-2 mb-3 inline-block">
                <span className="text-xs text-amber-400/80">
                  Recommended extra fund:{" "}
                </span>
                <span className="text-sm font-bold text-amber-400">
                  {formatRupiahTrip(Math.round(result.grandTotal * emergencyNote.percentage / 100))}
                </span>
                <span className="text-xs text-amber-400/60"> ({emergencyNote.percentage}% of total)</span>
              </div>
              <ul className="space-y-1.5">
                {emergencyNote.notes.map((note, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Salary Connection */}
      {result.monthsToSave !== undefined && (
        <div className="bg-slate-900 rounded-2xl border border-emerald-500/20 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-emerald-400 mb-0.5">
                Salary Connection — Koneksi Gaji
              </div>
              <div className="text-white">
                This trip ={" "}
                <span className="text-xl font-extrabold text-emerald-400">
                  {result.monthsToSave}
                </span>{" "}
                months of your Lifestyle budget
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Based on your most recent salary calculation
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart + Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex items-center justify-center">
          <TripPieChart categories={result.categories} />
        </div>
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Trip Details</h3>
          <div className="space-y-2">
            {[
              { label: "Trip Type", value: result.input.destination || "Custom" },
              { label: "Duration", value: `${result.input.durationNights} nights, ${result.input.durationNights + 1} days` },
              { label: "Travelers", value: `${result.input.travelers} person(s)` },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-800/30 last:border-0">
                <span className="text-sm text-slate-400">{item.label}</span>
                <span className="text-sm font-semibold text-slate-300 capitalize">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <h3 className="text-lg font-bold text-white mb-5">Cost Breakdown — Rincian Biaya</h3>
        <div className="space-y-3">
          {result.categories.map((cat) => (
            <div key={cat.name} className="group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                  style={{ backgroundColor: cat.color + "15" }}>
                  {cat.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-300">{cat.name}</span>
                    <span className="text-sm font-bold text-white">{formatRupiahTrip(cat.amount)}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(cat.percentage, 100)}%`, backgroundColor: cat.color }}></div>
                  </div>
                </div>
                <span className="text-xs text-slate-500 min-w-[40px] text-right">{cat.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-400">Total</span>
          <span className="text-base font-bold text-white">{formatRupiahTrip(result.grandTotal)}</span>
        </div>
      </div>

      {/* Download & Share Buttons */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Download & Share — Unduh & Bagikan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => downloadTripPDF(result)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3.5 rounded-xl font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25"
          >
            📄 Download PDF
          </button>
          <button
            type="button"
            onClick={() => downloadTripImage(result)}
            className="flex items-center justify-center gap-2 bg-purple-600 text-white px-5 py-3.5 rounded-xl font-semibold hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/25"
          >
            🖼️ Download Image (JPG)
          </button>
        </div>
      </div>

      {/* Other Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => {
            const text = result.categories
              .map((c) => `${c.emoji} ${c.name}: ${formatRupiahTrip(c.amount)} (${c.percentage}%)`)
              .join("\n");
            const summary = `✈️ SalarySplit Trip Budget\nTrip Type: ${result.input.destination}\nDuration: ${result.input.durationNights} nights, ${result.input.travelers} traveler(s)\n\n${text}\n\nTotal: ${formatRupiahTrip(result.grandTotal)}\nPer person: ${formatRupiahTrip(result.perPerson)}\nPer day: ${formatRupiahTrip(result.perDay)}`;
            navigator.clipboard.writeText(summary);
            alert("Copied to clipboard! — Tersalin ke clipboard!");
          }}
          className="flex items-center justify-center gap-2 text-blue-400 border-2 border-blue-500/40 px-6 py-4 rounded-xl font-semibold hover:bg-blue-500/10 transition-all"
        >
          📋 Copy Text — Salin Teks
        </button>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center justify-center gap-2 text-slate-400 border-2 border-slate-700 px-6 py-4 rounded-xl font-semibold hover:border-slate-600 hover:text-slate-300 transition-all"
        >
          ← Edit Trip — Ubah Perjalanan
        </button>
      </div>
    </div>
  );
}
