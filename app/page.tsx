"use client";

import Link from "next/link";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Navigation */}
      <NavBar />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-blue-500/20">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              Gratis untuk semua — Free for everyone
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
              Your personal{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                finance companion
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto">
              Atur keuangan Anda dengan cerdas. Calculate your salary allocation,
              compare job offers, and plan your next trip — all in one place.
            </p>

            <p className="text-sm text-slate-500">
              No signup required • Takes less than 2 minutes • 100% free
            </p>
          </div>
        </div>
      </section>

      {/* Sign-in / Profile Bar */}
      <section className="px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          {!loading && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {avatarUrl && (
                      <img
                        src={avatarUrl}
                        alt=""
                        className="w-10 h-10 rounded-full border-2 border-slate-700"
                      />
                    )}
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Welcome, {displayName} 👋
                      </div>
                      <div className="text-xs text-slate-500">
                        Your calculations are saved to your account
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/dashboard"
                      className="text-sm text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                    >
                      Dashboard →
                    </Link>
                    <button
                      onClick={signOut}
                      className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-sm text-slate-400 text-center sm:text-left">
                    🔑 Sign in to save your calculations and access your
                    dashboard
                  </div>
                  <button
                    onClick={signInWithGoogle}
                    className="flex items-center gap-2 bg-white text-slate-800 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-all shadow-md shrink-0"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3-Tool Hub */}
      <section id="tools" className="py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Our Tools — Peralatan Kami
            </h2>
            <p className="text-slate-400">
              Everything you need to manage your money and plan ahead.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {/* Tool 1: Salary Split */}
            <Link
              href="/calculator"
              className="group bg-slate-900 rounded-2xl border border-slate-800 p-6 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-2xl mb-5 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  🧮
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  Salary Split
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  Calculate your take-home pay, payroll deductions, and smart
                  budget allocation across 10 categories.
                </p>
                <span className="text-sm font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                  Try Now →
                </span>
              </div>
            </Link>

            {/* Tool 2: Compare Offers */}
            <Link
              href="/compare"
              className="group bg-slate-900 rounded-2xl border border-slate-800 p-6 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/5 transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-2xl mb-5 border border-purple-500/20 group-hover:scale-110 transition-transform">
                  ⚖️
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  Compare Offers
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  Compare up to 3 salary offers side-by-side. See which one gives
                  you the best take-home and savings rate.
                </p>
                <span className="text-sm font-semibold text-purple-400 group-hover:text-purple-300 transition-colors">
                  Compare →
                </span>
              </div>
            </Link>

            {/* Tool 3: Trip Planner */}
            <Link
              href="/trip-planner"
              className="group bg-slate-900 rounded-2xl border border-slate-800 p-6 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-2xl mb-5 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  ✈️
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  Trip Planner
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  Plan your next holiday budget with destination presets and links
                  to live prices on popular travel sites.
                </p>
                <span className="text-sm font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  Plan Trip →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Example Preview Card */}
      <section className="py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl shadow-black/20 p-6 sm:p-8">
            <div className="text-sm font-medium text-slate-500 mb-4">Example Calculation</div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm text-slate-400">Monthly Income</div>
                <div className="text-2xl font-bold text-white">Rp 6.000.000</div>
              </div>
              <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/20">
                Single • Bali
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { label: "Savings", amount: "1.320K", pct: "22%", color: "bg-blue-500" },
                { label: "Housing", amount: "1.500K", pct: "25%", color: "bg-sky-500" },
                { label: "Food", amount: "900K", pct: "15%", color: "bg-teal-500" },
                { label: "Investments", amount: "600K", pct: "10%", color: "bg-indigo-500" },
                { label: "Transport", amount: "480K", pct: "8%", color: "bg-cyan-500" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-3 text-center"
                >
                  <div className={`w-2 h-2 ${item.color} rounded-full mx-auto mb-2`}></div>
                  <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                  <div className="text-sm font-bold text-slate-200">Rp {item.amount}</div>
                  <div className="text-xs text-slate-500">{item.pct}</div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4 text-xs text-slate-500">
              + 5 more categories tailored to your profile
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-400">
              Tiga langkah mudah — Three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Choose a Tool", desc: "Calculate your salary split, compare job offers, or plan a trip budget. Pick what you need." },
              { step: "02", title: "Enter Your Details", desc: "Input your income, costs, or travel plans. Select presets or customize everything." },
              { step: "03", title: "Get Your Plan", desc: "Receive a personalized breakdown with charts, insights, and actionable recommendations." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl text-2xl font-extrabold mb-6 border border-blue-500/20">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/calculator"
              className="inline-flex bg-blue-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:-translate-y-0.5"
            >
              Get Started — Mulai Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* Built For Indonesia */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Dibuat untuk Indonesia 🇮🇩
            </h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              SalarySplit is designed with Indonesian professionals in mind. Our
              recommendations are based on realistic living costs, local salary structures,
              and common benefits like company-paid tax and medical allowances.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { value: "IDR", label: "Rupiah-based calculations" },
                { value: "3", label: "Financial tools in one place" },
                { value: "100%", label: "Free forever for all tools" },
              ].map((stat) => (
                <div key={stat.label} className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                  <div className="text-2xl font-extrabold text-blue-400 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="text-sm font-semibold text-slate-300">
                Salary<span className="text-blue-400">Split</span>
              </span>
            </div>
            <p className="text-sm text-slate-500">
              © 2026 SalarySplit. Made in Bali 🌴
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
