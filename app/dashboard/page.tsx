"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { formatRupiah } from "@/lib/calculator";

interface SavedProjection {
  id: string;
  created_at: string;
  name: string;
  monthly_income: number;
  total_income: number;
  take_home_pay: number;
  budget_rule: string;
  total_debt: number;
  health_score: number;
  input_data: string;   // JSON string of full CalculatorInput
  result_data: string;  // JSON string of full CalculatorResult
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [projections, setProjections] = useState<SavedProjection[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Fetch saved projections
  useEffect(() => {
    if (user) {
      fetchProjections();
    }
  }, [user]);

  async function fetchProjections() {
    setLoadingData(true);
    const { data, error } = await supabase
      .from("projections")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProjections(data);
    }
    setLoadingData(false);
  }

  async function deleteProjection(id: string) {
    if (!confirm("Delete this calculation?")) return;
    await supabase.from("projections").delete().eq("id", id);
    setProjections(projections.filter((p) => p.id !== id));
  }

  function loadProjection(projection: SavedProjection) {
    // Store the input data in sessionStorage and navigate to results
    sessionStorage.setItem("calculatorInput", projection.input_data);
    router.push("/results");
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const avatarUrl = user.user_metadata?.avatar_url;

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
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/calculator"
              className="text-xs sm:text-sm text-slate-400 hover:text-blue-400 transition-colors"
            >
              Calculator
            </Link>
            <button
              onClick={signOut}
              className="text-xs sm:text-sm text-slate-500 hover:text-red-400 transition-colors"
            >
              Sign Out
            </button>
            {avatarUrl && (
              <img src={avatarUrl} alt="" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-slate-700" />
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-white mb-2">
              Welcome, {displayName}
            </h1>
            <p className="text-slate-400">
              Your saved calculations and financial projections
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            <Link
              href="/calculator"
              className="bg-blue-600 text-white p-5 rounded-2xl font-semibold hover:bg-blue-500 transition-all flex items-center gap-3"
            >
              <span className="text-2xl">🧮</span>
              <div>
                <div className="font-bold">New Calculation</div>
                <div className="text-sm text-blue-200">Hitung Baru</div>
              </div>
            </Link>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <div className="font-bold text-white">{projections.length} Saved</div>
                <div className="text-sm text-slate-400">Calculations</div>
              </div>
            </div>
          </div>

          {/* Saved Projections */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">
              History — Riwayat
            </h2>

            {loadingData ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500">Loading...</p>
              </div>
            ) : projections.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
                <span className="text-4xl mb-4 block">📝</span>
                <h3 className="text-white font-bold mb-2">No saved calculations yet</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Go to the calculator, run a calculation, and hit "Save to Account" to see it here.
                </p>
                <Link
                  href="/calculator"
                  className="inline-flex bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-500 transition-all"
                >
                  Start Calculating
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {projections.map((p) => (
                  <div
                    key={p.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => loadProjection(p)}>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-white font-semibold text-sm truncate">
                            {p.name || "Untitled Calculation"}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            p.health_score >= 70 ? "bg-emerald-500/10 text-emerald-400" :
                            p.health_score >= 40 ? "bg-amber-500/10 text-amber-400" :
                            "bg-red-500/10 text-red-400"
                          }`}>
                            {p.health_score}/100
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>Gross: {formatRupiah(p.monthly_income)}</span>
                          <span>Take-home: {formatRupiah(p.take_home_pay)}</span>
                          <span>{p.budget_rule.replaceAll("_", "/")}</span>
                          <span>{new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteProjection(p.id)}
                        className="text-slate-600 hover:text-red-400 text-sm ml-4 shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
