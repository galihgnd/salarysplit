"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TripForm from "@/components/TripForm";
import TripResults from "@/components/TripResults";
import { calculateTrip } from "@/lib/trip-calculator";
import type { TripInput, TripResult } from "@/types/trip";

function createDefaultInput(): TripInput {
  return {
    destination: "",
    durationNights: 3,
    travelers: 2,
    flightCost: 0,
    accommodationPerNight: 0,
    dailyMeals: 0,
    dailyTransport: 0,
    dailyActivities: 0,
    shoppingBudget: 0,
    miscBudget: 0,
  };
}

export default function TripPlannerPage() {
  const [input, setInput] = useState<TripInput>(createDefaultInput());
  const [result, setResult] = useState<TripResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load salary data from sessionStorage if available
  useEffect(() => {
    const stored = sessionStorage.getItem("calculatorInput");
    if (stored) {
      try {
        const calcInput = JSON.parse(stored);
        // Import the calculator to get take-home values
        import("@/lib/calculator").then(({ calculateAllocation }) => {
          const calcResult = calculateAllocation(calcInput);
          setInput((prev) => ({
            ...prev,
            monthlyTakeHome: calcResult.totalIncome,
            // Find lifestyle budget from categories
            lifestyleBudget:
              calcResult.categories.find(
                (c) =>
                  c.name === "Lifestyle" ||
                  c.name === "Wants" ||
                  c.name === "Spending"
              )?.amount || calcResult.totalIncome * 0.15,
          }));
        });
      } catch {
        // ignore
      }
    }
  }, []);

  function handleCalculate() {
    setError(null);

    if (!input.destination) {
      setError("Please select a destination");
      return;
    }
    if (input.durationNights <= 0) {
      setError("Please enter the number of nights");
      return;
    }
    if (input.travelers <= 0) {
      setError("Please enter the number of travelers");
      return;
    }

    const tripResult = calculateTrip(input);
    if (tripResult.grandTotal <= 0) {
      setError("Please enter at least one cost (flights, hotel, etc.)");
      return;
    }

    setResult(tripResult);
    // Scroll to results
    setTimeout(() => {
      document
        .getElementById("trip-results")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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
            <div className="text-sm text-slate-500">Trip Planner</div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-emerald-500/20">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              Trip Planner
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              Plan Your Trip Budget
            </h1>
            <p className="text-slate-400 text-lg">
              Rencanakan budget liburan Anda — choose a destination, enter your
              costs, and see the full breakdown.
            </p>
          </div>

          {/* Salary Connection Info */}
          {input.monthlyTakeHome && input.monthlyTakeHome > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-6 text-center">
              <p className="text-xs text-emerald-400">
                ✓ Connected to your salary calculation — we&apos;ll show how this trip
                fits your budget
              </p>
            </div>
          )}

          {/* Form */}
          <TripForm
            input={input}
            onChange={setInput}
            onCalculate={handleCalculate}
          />

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-6 text-center">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div id="trip-results" className="mt-10">
              <TripResults result={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
