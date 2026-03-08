import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-slate-800">
              Salary<span className="text-blue-600">Split</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hidden sm:block text-sm text-slate-500 hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hidden sm:block text-sm text-slate-500 hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <Link
              href="/calculator"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
            >
              Try Calculator
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Gratis untuk semua — Free for everyone
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
              Split your salary{" "}
              <span className="text-blue-600">intelligently</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-500 leading-relaxed mb-10 max-w-2xl mx-auto">
              Atur keuangan Anda dengan cerdas. SalarySplit helps you divide your income
              across savings, investments, housing, and more — personalized to your life
              situation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/calculator"
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
              >
                Start Calculating — Mulai Hitung
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto text-slate-600 px-8 py-4 rounded-xl text-base font-semibold border border-slate-200 hover:border-blue-200 hover:text-blue-600 transition-all"
              >
                See How It Works
              </a>
            </div>

            {/* Social Proof */}
            <p className="text-sm text-slate-400 mt-8">
              No signup required • Takes less than 2 minutes • 100% free
            </p>
          </div>

          {/* Preview Card */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
              <div className="text-sm font-medium text-slate-400 mb-4">Example Calculation</div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm text-slate-500">Monthly Income</div>
                  <div className="text-2xl font-bold text-slate-800">Rp 6.000.000</div>
                </div>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  Single • Bali
                </div>
              </div>

              {/* Budget Breakdown Preview */}
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
                    className="bg-white rounded-xl border border-slate-100 p-3 text-center"
                  >
                    <div className={`w-2 h-2 ${item.color} rounded-full mx-auto mb-2`}></div>
                    <div className="text-xs text-slate-400 mb-1">{item.label}</div>
                    <div className="text-sm font-bold text-slate-700">Rp {item.amount}</div>
                    <div className="text-xs text-slate-400">{item.pct}</div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4 text-xs text-slate-400">
                + 5 more categories tailored to your profile
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Kenapa SalarySplit?
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              A smart calculator that adapts to your life — not the other way around.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🎯",
                title: "Personalized",
                desc: "Adapts to your status — single, married, or with children. Sesuai kondisi hidup Anda.",
              },
              {
                icon: "💼",
                title: "Benefit-Aware",
                desc: "Accounts for company tax, medical coverage, bonuses, and allowances automatically.",
              },
              {
                icon: "📊",
                title: "Visual Breakdown",
                desc: "See exactly where every rupiah goes with clear charts and categories.",
              },
              {
                icon: "🔄",
                title: "Monthly & Annual",
                desc: "Switch between monthly view and yearly projections. Hitung bulanan atau tahunan.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50 transition-all group"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-500">
              Tiga langkah mudah — Three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Enter Your Income",
                desc: "Input your monthly salary, bonuses, and allowances. Tell us about your tax and medical benefits.",
              },
              {
                step: "02",
                title: "Set Your Profile",
                desc: "Select your marital status, dependents, and housing situation. Sesuaikan dengan kondisi Anda.",
              },
              {
                step: "03",
                title: "Get Your Plan",
                desc: "Receive a personalized budget breakdown across 10 categories, optimized for your situation.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl text-2xl font-extrabold mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/calculator"
              className="inline-flex bg-blue-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:-translate-y-0.5"
            >
              Try It Now — Coba Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* Built For Indonesia */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Dibuat untuk Indonesia 🇮🇩
            </h2>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
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
                <div key={stat.label} className="bg-white rounded-xl p-6 border border-slate-100">
                  <div className="text-2xl font-extrabold text-blue-600 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="text-sm font-semibold text-slate-700">
                Salary<span className="text-blue-600">Split</span>
              </span>
            </div>
            <p className="text-sm text-slate-400">
              © 2026 SalarySplit. Made in Bali 🌴
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
