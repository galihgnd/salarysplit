"use client";

import type {
  CalculatorInput,
  MaritalStatus,
  HousingType,
  BudgetRule,
} from "@/types/calculator";

interface ScenarioFormProps {
  scenarioIndex: number;
  label: string;
  accentColor: string;
  input: CalculatorInput;
  onChange: (input: CalculatorInput) => void;
  onRemove?: () => void;
}

const ACCENT_BORDER: Record<string, string> = {
  blue: "border-blue-500",
  purple: "border-purple-500",
  emerald: "border-emerald-500",
};

const ACCENT_BG: Record<string, string> = {
  blue: "bg-blue-500/10",
  purple: "bg-purple-500/10",
  emerald: "bg-emerald-500/10",
};

const ACCENT_TEXT: Record<string, string> = {
  blue: "text-blue-400",
  purple: "text-purple-400",
  emerald: "text-emerald-400",
};

function formatDisplay(value: string | number): string {
  const num = String(value).replace(/\D/g, "");
  if (!num) return "";
  return new Intl.NumberFormat("id-ID").format(parseInt(num));
}

function toNumber(val: string): number {
  return parseInt(val.replace(/\D/g, "")) || 0;
}

export default function ScenarioForm({
  label,
  accentColor,
  input,
  onChange,
  onRemove,
}: ScenarioFormProps) {
  const border = ACCENT_BORDER[accentColor] || "border-blue-500";
  const bg = ACCENT_BG[accentColor] || "bg-blue-500/10";
  const text = ACCENT_TEXT[accentColor] || "text-blue-400";

  function update(partial: Partial<CalculatorInput>) {
    onChange({ ...input, ...partial });
  }

  return (
    <div className={`bg-slate-900 rounded-2xl border-2 ${border} p-5 space-y-4`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className={`inline-flex items-center gap-2 ${bg} ${text} px-3 py-1 rounded-full text-sm font-bold`}>
          {label}
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-slate-500 hover:text-red-400 text-sm transition-colors"
          >
            ✕ Remove
          </button>
        )}
      </div>

      {/* Monthly Income */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1">
          Monthly Gross Salary *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={formatDisplay(input.monthlyIncome)}
            onChange={(e) => update({ monthlyIncome: toNumber(e.target.value) })}
            placeholder="6.000.000"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Bonus + Allowances in a row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Annual Bonus
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={formatDisplay(input.annualBonus)}
              onChange={(e) => update({ annualBonus: toNumber(e.target.value) })}
              placeholder="0"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Monthly Allowances
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={formatDisplay(input.monthlyAllowances)}
              onChange={(e) => update({ monthlyAllowances: toNumber(e.target.value) })}
              placeholder="0"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Marital Status */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
          Status
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { value: "single", label: "Single" },
              { value: "married", label: "Married" },
              { value: "married_with_children", label: "M + Kids" },
            ] as { value: MaritalStatus; label: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                update({
                  maritalStatus: opt.value,
                  dependents: opt.value === "married_with_children" ? 1 : 0,
                })
              }
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                input.maritalStatus === opt.value
                  ? `${bg} ${text} border border-current`
                  : "text-slate-400 border border-slate-700 hover:border-slate-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Housing */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
          Housing
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { value: "self_paid", label: "Self-Paid" },
              { value: "company_provided", label: "Company" },
              { value: "with_parents", label: "Parents" },
            ] as { value: HousingType; label: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ housingType: opt.value })}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                input.housingType === opt.value
                  ? `${bg} ${text} border border-current`
                  : "text-slate-400 border border-slate-700 hover:border-slate-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle row: Tax + Medical covered */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => update({ taxCovered: !input.taxCovered })}
          className={`p-2.5 rounded-xl text-center text-xs font-semibold transition-all ${
            input.taxCovered
              ? `${bg} ${text} border border-current`
              : "text-slate-400 border border-slate-700 hover:border-slate-600"
          }`}
        >
          {input.taxCovered ? "✓ " : ""}Tax Covered
        </button>
        <button
          type="button"
          onClick={() => update({ medicalCovered: !input.medicalCovered })}
          className={`p-2.5 rounded-xl text-center text-xs font-semibold transition-all ${
            input.medicalCovered
              ? `${bg} ${text} border border-current`
              : "text-slate-400 border border-slate-700 hover:border-slate-600"
          }`}
        >
          {input.medicalCovered ? "✓ " : ""}Med Covered
        </button>
      </div>

      {/* Budget Rule */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
          Budget Rule
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {(
            [
              { value: "50_30_20", label: "50/30/20" },
              { value: "80_20", label: "80/20" },
              { value: "70_20_10", label: "70/20/10" },
              { value: "custom", label: "Custom" },
            ] as { value: BudgetRule; label: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ budgetRule: opt.value })}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                input.budgetRule === opt.value
                  ? `${bg} ${text} border border-current`
                  : "text-slate-400 border border-slate-700 hover:border-slate-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Debt */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1">
          Monthly Debt / Bills
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            value={formatDisplay(input.totalDebt)}
            onChange={(e) => update({ totalDebt: toNumber(e.target.value) })}
            placeholder="0"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600"
          />
        </div>
      </div>
    </div>
  );
}
