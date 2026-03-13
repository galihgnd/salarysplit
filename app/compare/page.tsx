"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ScenarioForm from "@/components/ScenarioForm";
import ComparisonTable from "@/components/ComparisonTable";
import { calculateAllocation } from "@/lib/calculator";
import type { CalculatorInput, CalculatorResult } from "@/types/calculator";

const ACCENT_COLORS = ["blue", "purple", "emerald"];
const SCENARIO_LABELS = ["Scenario A", "Scenario B", "Scenario C"];

function createDefaultInput(): CalculatorInput {
  return {
    monthlyIncome: 0,
    annualBonus: 0,
    monthlyAllowances: 0,
    maritalStatus: "single",
    dependents: 0,
    housingType: "self_paid",
    taxCovered: false,
    medicalCovered: false,
    calculationMode: "monthly",
    taxStatus: "TK/0",
    hasBpjsKesehatan: true,
    hasBpjsKetenagakerjaan: true,
    pph21Enabled: true,
    jkkRiskRate: 0.0054,
    budgetRule: "50_30_20",
    debtMode: "simple",
    totalDebt: 0,
    debtItems: [],
  };
}

export default function ComparePage() {
  const [inputs, setInputs] = useState<CalculatorInput[]>([
    createDefaultInput(),
    createDefaultInput(),
  ]);
  const [results, setResults] = useState<CalculatorResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load pre-filled Scenario A from sessionStorage (if coming from results page)
  useEffect(() => {
    const stored = sessionStorage.getItem("compareScenarioA");
    if (stored) {
      try {
        const parsed: CalculatorInput = JSON.parse(stored);
        setInputs((prev) => [parsed, ...prev.slice(1)]);
        sessionStorage.removeItem("compareScenarioA");
      } catch {
        // ignore
      }
    }
  }, []);

  function updateInput(index: number, newInput: CalculatorInput) {
    setInputs((prev) => prev.map((inp, i) => (i === index ? newInput : inp)));
  }

  function addScenario() {
    if (inputs.length < 3) {
      setInputs((prev) => [...prev, createDefaultInput()]);
    }
  }

  function removeScenario(index: number) {
    if (inputs.length > 2) {
      setInputs((prev) => prev.filter((_, i) => i !== index));
      setResults(null);
    }
  }

  function handleCompare() {
    setError(null);

    // Validate all scenarios have income
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].monthlyIncome <= 0) {
        setError(
          `Please enter a monthly income for ${SCENARIO_LABELS[i]}`
        );
        return;
      }
    }

    try {
      const calculated = inputs.map((input) => calculateAllocation(input));
      setResults(calculated);
    } catch {
      setError("Something went wrong. Please check your inputs.");
    }
  }

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
          <div className="flex items-center gap-4">
            <Link
              href="/calculator"
              className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
            >
              Calculator
            </Link>
            <div className="text-sm text-slate-500">
              Compare Mode
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-purple-500/20">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
              Compare Mode
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              Compare Scenarios
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Bandingkan hingga 3 skenario gaji — Compare up to 3 salary
              scenarios side by side to find the best option for you.
            </p>
          </div>

          {/* Scenario Forms */}
          <div
            className="grid gap-6 mb-8"
            style={{
              gridTemplateColumns: `repeat(${inputs.length}, 1fr)`,
            }}
          >
            {inputs.map((input, i) => (
              <ScenarioForm
                key={i}
                scenarioIndex={i}
                label={SCENARIO_LABELS[i]}
                accentColor={ACCENT_COLORS[i]}
                input={input}
                onChange={(newInput) => updateInput(i, newInput)}
                onRemove={inputs.length > 2 ? () => removeScenario(i) : undefined}
              />
            ))}
          </div>

          {/* Add scenario + Compare buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            {inputs.length < 3 && (
              <button
                type="button"
                onClick={addScenario}
                className="flex items-center gap-2 text-sm text-slate-400 border-2 border-dashed border-slate-700 px-6 py-3 rounded-xl font-semibold hover:border-slate-600 hover:text-slate-300 transition-all"
              >
                + Add Scenario C
              </button>
            )}
            <button
              type="button"
              onClick={handleCompare}
              className="bg-blue-600 text-white px-10 py-4 rounded-xl text-base font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              ⚡ Compare Now — Bandingkan
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 text-center">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-white mb-2">
                  Comparison Results
                </h2>
                <p className="text-slate-400 text-sm">
                  Green checkmarks indicate the better value for each metric
                </p>
              </div>

              {/* Desktop: scrollable table */}
              <div className="overflow-x-auto">
                <ComparisonTable
                  results={results}
                  labels={SCENARIO_LABELS.slice(0, results.length)}
                  accentColors={ACCENT_COLORS.slice(0, results.length)}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setResults(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-sm text-blue-400 border-2 border-blue-500 px-6 py-3 rounded-xl font-semibold hover:bg-blue-500/10 transition-all"
                >
                  ← Edit Scenarios
                </button>
                <Link
                  href="/calculator"
                  className="text-sm text-slate-400 border-2 border-slate-700 px-6 py-3 rounded-xl font-semibold hover:border-slate-600 hover:text-slate-300 transition-all"
                >
                  Full Calculator
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
