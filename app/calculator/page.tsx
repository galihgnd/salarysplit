import Link from "next/link";

export default function Calculator() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🧮</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
          Calculator Coming Soon
        </h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          We are building the salary allocation calculator. Segera hadir — stay tuned!
        </p>
        <Link
          href="/"
          className="inline-flex bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
