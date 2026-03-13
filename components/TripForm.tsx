"use client";

import type { TripInput, DestinationPreset } from "@/types/trip";
import { DESTINATION_PRESETS, getOTALinks, getEmergencyFundNote } from "@/lib/destinations";

interface TripFormProps {
  input: TripInput;
  onChange: (input: TripInput) => void;
  onCalculate: () => void;
}

function formatDisplay(value: number): string {
  if (!value) return "";
  return new Intl.NumberFormat("id-ID").format(value);
}

function toNumber(val: string): number {
  return parseInt(val.replace(/\D/g, "")) || 0;
}

export default function TripForm({ input, onChange, onCalculate }: TripFormProps) {
  const selectedPreset = DESTINATION_PRESETS.find(
    (p) => p.id === input.destination || p.name === input.destination
  );
  const otaLinks = selectedPreset
    ? getOTALinks(selectedPreset.flightSearchQuery, selectedPreset.name)
    : getOTALinks(input.destination, input.destination);
  const emergencyNote = getEmergencyFundNote(
    selectedPreset?.id || input.destination
  );

  function update(partial: Partial<TripInput>) {
    onChange({ ...input, ...partial });
  }

  function selectPreset(preset: DestinationPreset) {
    update({
      destination: preset.id,
      dailyMeals: preset.dailyMeals,
      dailyTransport: preset.dailyTransport,
      dailyActivities: preset.dailyActivities,
      accommodationPerNight:
        preset.hotelLow > 0
          ? Math.round((preset.hotelLow + preset.hotelHigh) / 2)
          : 0,
    });
  }

  return (
    <div className="space-y-6">
      {/* Trip Type Selection */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-xl">📍</span> Trip Type — Jenis Perjalanan
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {DESTINATION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => selectPreset(preset)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                input.destination === preset.id
                  ? "border-blue-500 bg-blue-500/10 text-blue-400"
                  : "border-slate-700 text-slate-400 hover:border-slate-600"
              }`}
            >
              <div className="text-2xl mb-2">{preset.emoji}</div>
              <div className="text-xs font-bold text-slate-200">{preset.name}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{preset.nameId}</div>
            </button>
          ))}
        </div>

        {/* Preset note */}
        {selectedPreset && selectedPreset.id !== "custom" && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
            <p className="text-xs text-blue-400">
              ℹ️ Estimates based on 2024–2025 averages for a mid-range{" "}
              {selectedPreset.id === "domestic" ? "Indonesian domestic" : "international"}{" "}
              trip. Adjust the numbers below to match your actual costs.
            </p>
          </div>
        )}

        {selectedPreset?.id === "custom" && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
            <p className="text-xs text-slate-400">
              ✏️ All fields start at 0 — enter your own costs for a fully customized trip budget.
            </p>
          </div>
        )}
      </div>

      {/* Duration & Travelers */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-xl">📅</span> Duration & Group — Durasi & Rombongan
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Nights — Malam
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={input.durationNights || ""}
              onChange={(e) => update({ durationNights: parseInt(e.target.value) || 0 })}
              placeholder="3"
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Travelers — Orang
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={input.travelers || ""}
              onChange={(e) => update({ travelers: parseInt(e.target.value) || 0 })}
              placeholder="2"
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Flights */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-xl">✈️</span> Flights — Penerbangan
        </h2>
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">
            Total Round-Trip Cost (Total PP)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={formatDisplay(input.flightCost)}
              onChange={(e) => update({ flightCost: toNumber(e.target.value) })}
              placeholder="1.500.000"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">Total flight cost for all travelers, round-trip</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-2">Check prices on:</p>
          <div className="flex flex-wrap gap-2">
            {otaLinks.flights.map((link) => (
              <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:border-blue-500/50 hover:text-blue-400 transition-all">
                🔗 {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Accommodation */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-xl">🏨</span> Accommodation — Akomodasi
        </h2>
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">
            Price Per Night (Harga per Malam)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={formatDisplay(input.accommodationPerNight)}
              onChange={(e) => update({ accommodationPerNight: toNumber(e.target.value) })}
              placeholder="500.000"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600"
            />
          </div>
          {selectedPreset && selectedPreset.hotelLow > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              Estimated range: Rp {formatDisplay(selectedPreset.hotelLow)} – Rp {formatDisplay(selectedPreset.hotelHigh)} / night
            </p>
          )}
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-2">Check prices on:</p>
          <div className="flex flex-wrap gap-2">
            {otaLinks.accommodation.map((link) => (
              <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:border-blue-500/50 hover:text-blue-400 transition-all">
                🔗 {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Expenses */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-xl">🍽️</span> Daily Expenses — Pengeluaran Harian
        </h2>
        <p className="text-xs text-slate-500 -mt-2">Per person, per day — Per orang, per hari</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Meals — Makan</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">Rp</span>
              <input type="text" inputMode="numeric" value={formatDisplay(input.dailyMeals)}
                onChange={(e) => update({ dailyMeals: toNumber(e.target.value) })} placeholder="150.000"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Transport — Transportasi</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">Rp</span>
              <input type="text" inputMode="numeric" value={formatDisplay(input.dailyTransport)}
                onChange={(e) => update({ dailyTransport: toNumber(e.target.value) })} placeholder="100.000"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Activities — Kegiatan</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">Rp</span>
              <input type="text" inputMode="numeric" value={formatDisplay(input.dailyActivities)}
                onChange={(e) => update({ dailyActivities: toNumber(e.target.value) })} placeholder="200.000"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Extras */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-xl">🛍️</span> Extras — Tambahan
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Shopping — Belanja</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">Rp</span>
              <input type="text" inputMode="numeric" value={formatDisplay(input.shoppingBudget)}
                onChange={(e) => update({ shoppingBudget: toNumber(e.target.value) })} placeholder="0"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Misc — Lainnya</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">Rp</span>
              <input type="text" inputMode="numeric" value={formatDisplay(input.miscBudget)}
                onChange={(e) => update({ miscBudget: toNumber(e.target.value) })} placeholder="0"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Fund Note */}
      {emergencyNote && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">⚠️</span>
            <div>
              <h3 className="text-sm font-bold text-amber-400 mb-1">
                {emergencyNote.title}
              </h3>
              <p className="text-xs text-amber-400/60 mb-2">{emergencyNote.titleId}</p>
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

      {/* Calculate Button */}
      <button
        type="button"
        onClick={onCalculate}
        className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
      >
        ✈️ Calculate Trip Budget — Hitung Budget Perjalanan
      </button>

      <p className="text-center text-xs text-slate-500">
        Your data stays in your browser. We do not store anything.
      </p>
    </div>
  );
}
