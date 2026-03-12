import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Navigation */}
      <NavBar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-blue-500/20">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              Gratis untuk semua — Free for everyone
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
              Split your salary{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">intelligently</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto">
              Atur keuangan Anda dengan cerdas. SalarySplit helps you divide your income
              across savings, investments, housing, and more — personalized to your life
              situation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/calculator"
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
              >
                Start Calculating — Mulai Hitung
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto text-slate-300 px-8 py-4 rounded-xl text-base font-semibold border border-slate-700 hover:border-blue-500/50 hover:text-blue-400 transition-all"
              >
                See How It Works
              </a>
            </div>

            <p className="text-sm text-slate-500 mt-8">
              No signup required • Takes less than 2 minutes • 100% free
            </p>
          </div>

          {/* Preview Card */}
          <div className="mt-16 max-w-4xl mx-auto">
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
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Kenapa SalarySplit?
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              A smart calculator that adapts to your life — not the other way around.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🎯", title: "Personalized", desc: "Adapts to your status — single, married, or with children. Sesuai kondisi hidup Anda." },
              { icon: "💼", title: "Benefit-Aware", desc: "Accounts for company tax, medical coverage, bonuses, and allowances automatically." },
              { icon: "📊", title: "Visual Breakdown", desc: "See exactly where every rupiah goes with clear charts and categories." },
              { icon: "🔄", title: "Monthly & Annual", desc: "Switch between monthly view and yearly projections. Hitung bulanan atau tahunan." },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all group"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
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
              { step: "01", title: "Enter Your Income", desc: "Input your monthly salary, bonuses, and allowances. Tell us about your tax and medical benefits." },
              { step: "02", title: "Set Your Profile", desc: "Select your marital status, dependents, and housing situation. Sesuaikan dengan kondisi Anda." },
              { step: "03", title: "Get Your Plan", desc: "Receive a personalized budget breakdown across 10 categories, optimized for your situation." },
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
              Try It Now — Coba Sekarang
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
                { value: "10+", label: "Budget categories" },
                { value: "100%", label: "Free forever for basic use" },
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
