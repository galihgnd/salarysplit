"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type {
  MaritalStatus,
  HousingType,
  CalculationMode,
  CalculatorInput,
  TaxStatus,
} from "@/types/calculator";

export default function CalculatorPage() {
  const router = useRouter();

  // Form state
  const [monthlyIncome, setMonthlyIncome] = useState<string>("");
  const [annualBonus, setAnnualBonus] = useState<string>("");
  const [monthlyAllowances, setMonthlyAllowances] = useState<string>("");
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>("single");
  const [dependents, setDependents] = useState<string>("0");
  const [housingType, setHousingType] = useState<HousingType>("self_paid");
  const [taxCovered, setTaxCovered] = useState<boolean>(false);
  const [medicalCovered, setMedicalCovered] = useState<boolean>(false);
  const [calculationMode, setCalculationMode] = useState<CalculationMode>("monthly");
  const [taxStatus, setTaxStatus] = useState<TaxStatus>("TK/0");
  const [hasBpjsKesehatan, setHasBpjsKesehatan] = useState<boolean>(true);

  // Format number with dots for display (Indonesian style)
  function formatDisplay(value: string): string {
    const num = value.replace(/\D/g, "");
    if (!num) return "";
    return new Intl.NumberFormat("id-ID").format(parseInt(num));
  }

  // Handle number input — store raw number, display formatted
  function handleNumberInput(
    value: string,
    setter: (val: string) => void
  ) {
    const raw = value.replace(/\D/g, "");
    setter(raw);
  }

  // Parse string to number
  function toNumber(val: string): number {
    return parseInt(val) || 0;
  }

  // Handle form submission
  function handleSubmit() {
    if (!monthlyIncome || toNumber(monthlyIncome) === 0) {
      alert("Please enter your monthly income");
      return;
    }

    const input: CalculatorInput = {
      monthlyIncome: toNumber(monthlyIncome),
      annualBonus: toNumber(annualBonus),
      monthlyAllowances: toNumber(monthlyAllowances),
      maritalStatus,
      dependents: toNumber(dependents),
      housingType,
      taxCovered,
      medicalCovered,
      calculationMode,
      taxStatus,
      hasBpjsKesehatan,
    };

    // Store input in sessionStorage so results page can read it
    sessionStorage.setItem("calculatorInput", JSON.stringify(input));
    router.push("/results");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-slate-800">
              Salary<span className="text-blue-600">Split</span>
            </span>
          </Link>
          <div className="text-sm text-slate-400">
            Financial Calculator
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              Calculate Your Allocation
            </h1>
            <p className="text-slate-500 text-lg">
              Masukkan informasi keuangan Anda — Enter your financial details below
            </p>
          </div>

          {/* Calculator Form */}
          <div className="space-y-6">

            {/* Monthly/Annual Toggle */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Calculation Mode
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setCalculationMode("monthly")}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    calculationMode === "monthly"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Monthly — Bulanan
                </button>
                <button
                  type="button"
                  onClick={() => setCalculationMode("annual")}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    calculationMode === "annual"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Annual — Tahunan
                </button>
              </div>
            </div>

            {/* Income Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="text-xl">💰</span> Income — Pendapatan
              </h2>

              {/* Monthly Net Income */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Monthly Gross Salary (Gaji Kotor Bulanan) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatDisplay(monthlyIncome)}
                    onChange={(e) => handleNumberInput(e.target.value, setMonthlyIncome)}
                    placeholder="6.000.000"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Your gross monthly salary before deductions</p>
              </div>

              {/* Annual Bonus */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Annual Bonus (Bonus Tahunan)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatDisplay(annualBonus)}
                    onChange={(e) => handleNumberInput(e.target.value, setAnnualBonus)}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Total bonus per year (THR, performance, etc.)</p>
              </div>

              {/* Monthly Allowances */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Monthly Allowances (Tunjangan Bulanan)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatDisplay(monthlyAllowances)}
                    onChange={(e) => handleNumberInput(e.target.value, setMonthlyAllowances)}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Transport, meals, or other monthly allowances</p>
              </div>
            </div>

            {/* Life Condition Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="text-xl">👤</span> Life Condition — Kondisi Hidup
              </h2>

              {/* Marital Status */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Marital Status (Status Pernikahan)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { value: "single" as MaritalStatus, label: "Single", sub: "Lajang" },
                    { value: "married" as MaritalStatus, label: "Married", sub: "Menikah" },
                    { value: "married_with_children" as MaritalStatus, label: "Married + Kids", sub: "Menikah + Anak" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setMaritalStatus(option.value);
                        if (option.value === "single" || option.value === "married") {
                          setDependents("0");
                        }
                      }}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        maritalStatus === option.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-sm font-semibold">{option.label}</div>
                      <div className="text-xs opacity-70">{option.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dependents — only show if married with children */}
              {maritalStatus === "married_with_children" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Number of Children (Jumlah Anak)
                  </label>
                  <select
                    value={dependents}
                    onChange={(e) => setDependents(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="1">1 child</option>
                    <option value="2">2 children</option>
                    <option value="3">3 children</option>
                    <option value="4">4+ children</option>
                  </select>
                </div>
              )}

              {/* Housing Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Housing Situation (Tempat Tinggal)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { value: "self_paid" as HousingType, label: "Self-Paid", sub: "Bayar sendiri", icon: "🏠" },
                    { value: "company_provided" as HousingType, label: "Company", sub: "Dari kantor", icon: "🏢" },
                    { value: "with_parents" as HousingType, label: "With Parents", sub: "Dengan ortu", icon: "👨‍👩‍👧" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setHousingType(option.value)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        housingType === option.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-lg mb-1">{option.icon}</div>
                      <div className="text-sm font-semibold">{option.label}</div>
                      <div className="text-xs opacity-70">{option.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tax Status & Deductions Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="text-xl">🏛️</span> Tax & BPJS — Pajak & BPJS
              </h2>

              {/* Tax Status (PTKP) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Tax Status / PTKP (Status Pajak)
                </label>
                <select
                  value={taxStatus}
                  onChange={(e) => setTaxStatus(e.target.value as TaxStatus)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="TK/0">TK/0 — Single, no dependents</option>
                  <option value="TK/1">TK/1 — Single, 1 dependent</option>
                  <option value="TK/2">TK/2 — Single, 2 dependents</option>
                  <option value="TK/3">TK/3 — Single, 3 dependents</option>
                  <option value="K/0">K/0 — Married, no dependents</option>
                  <option value="K/1">K/1 — Married, 1 dependent</option>
                  <option value="K/2">K/2 — Married, 2 dependents</option>
                  <option value="K/3">K/3 — Married, 3 dependents</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Used for PPh 21 TER calculation. Check your tax card (bukti potong).
                </p>
              </div>

              {/* BPJS Kesehatan Toggle */}
              <div
                onClick={() => setHasBpjsKesehatan(!hasBpjsKesehatan)}
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  hasBpjsKesehatan
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="text-sm font-semibold text-slate-700">
                    BPJS Kesehatan Active
                  </div>
                  <div className="text-xs text-slate-400">
                    Iuran BPJS Kesehatan (5% total: 4% perusahaan + 1% karyawan)
                  </div>
                </div>
                <div
                  className={`w-12 h-7 rounded-full flex items-center transition-all ${
                    hasBpjsKesehatan ? "bg-blue-600 justify-end" : "bg-slate-200 justify-start"
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow-sm mx-1"></div>
                </div>
              </div>

              {/* PPh 21 Toggle */}
              <div
                onClick={() => setTaxCovered(!taxCovered)}
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  taxCovered
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="text-sm font-semibold text-slate-700">
                    PPh 21 Paid by Company
                  </div>
                  <div className="text-xs text-slate-400">
                    Pajak penghasilan ditanggung perusahaan (gross-up)
                  </div>
                </div>
                <div
                  className={`w-12 h-7 rounded-full flex items-center transition-all ${
                    taxCovered ? "bg-blue-600 justify-end" : "bg-slate-200 justify-start"
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow-sm mx-1"></div>
                </div>
              </div>

              {/* BPJS Employee Share Toggle — only show if BPJS is active */}
              {hasBpjsKesehatan && (
                <div
                  onClick={() => setMedicalCovered(!medicalCovered)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    medicalCovered
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-700">
                      BPJS Employee Share Covered by Company
                    </div>
                    <div className="text-xs text-slate-400">
                      Iuran BPJS karyawan (1%) ditanggung perusahaan
                    </div>
                  </div>
                  <div
                    className={`w-12 h-7 rounded-full flex items-center transition-all ${
                      medicalCovered ? "bg-blue-600 justify-end" : "bg-slate-200 justify-start"
                    }`}
                  >
                    <div className="w-5 h-5 bg-white rounded-full shadow-sm mx-1"></div>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700">
                  ⚠️ This calculator uses TER rates from PP 58/2023 & BPJS rates from Perpres 64/2020. 
                  It is a planning tool — verify against current regulations before production use.
                </p>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Calculate My Allocation — Hitung Sekarang
            </button>

            <p className="text-center text-xs text-slate-400">
              Your data stays in your browser. We do not store anything.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
