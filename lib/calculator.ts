import {
  CalculatorInput,
  CalculatorResult,
  AllocationCategory,
  PayrollDeductionSummary,
} from "@/types/calculator";
import { calculatePayroll } from "@/lib/payroll-id";

// Base percentage allocations for each life condition
const BASE_ALLOCATIONS = {
  single: {
    savings: 20, investments: 10, housing: 25, food: 15,
    transportation: 8, medical: 3, emergency: 5, lifestyle: 7, family: 0, other: 7,
  },
  married: {
    savings: 15, investments: 8, housing: 25, food: 15,
    transportation: 8, medical: 5, emergency: 5, lifestyle: 5, family: 7, other: 7,
  },
  married_with_children: {
    savings: 10, investments: 5, housing: 25, food: 18,
    transportation: 8, medical: 7, emergency: 5, lifestyle: 3, family: 14, other: 5,
  },
};

const CATEGORY_INFO: Record<string, { label: string; color: string; emoji: string }> = {
  savings: { label: "Savings", color: "#2563EB", emoji: "💰" },
  investments: { label: "Investments", color: "#4F46E5", emoji: "📈" },
  housing: { label: "Housing", color: "#0EA5E9", emoji: "🏠" },
  food: { label: "Food", color: "#14B8A6", emoji: "🍽️" },
  transportation: { label: "Transportation", color: "#06B6D4", emoji: "🚗" },
  medical: { label: "Medical", color: "#F43F5E", emoji: "🏥" },
  emergency: { label: "Emergency Fund", color: "#F59E0B", emoji: "🛡️" },
  lifestyle: { label: "Lifestyle", color: "#8B5CF6", emoji: "🎮" },
  family: { label: "Family", color: "#EC4899", emoji: "👨‍👩‍👧" },
  other: { label: "Other / Misc", color: "#6B7280", emoji: "📦" },
};

export function calculateAllocation(input: CalculatorInput): CalculatorResult {
  // Step 1: Base allocations
  const base = { ...BASE_ALLOCATIONS[input.maritalStatus] };

  // Step 2: Housing adjustment
  if (input.housingType === "company_provided" || input.housingType === "with_parents") {
    const housingPct = base.housing;
    base.housing = input.housingType === "with_parents" ? 5 : 0;
    const freed = housingPct - base.housing;
    base.savings += Math.round(freed * 0.4);
    base.investments += Math.round(freed * 0.35);
    base.lifestyle += freed - Math.round(freed * 0.4) - Math.round(freed * 0.35);
  }

  // Step 3: Medical adjustment
  if (input.medicalCovered && input.hasBpjsKesehatan) {
    const medicalPct = base.medical;
    base.medical = 1;
    base.savings += medicalPct - 1;
  }

  // Step 4: Dependents adjustment
  if (input.dependents > 0 && input.maritalStatus === "married_with_children") {
    const extraNeeded = Math.min(input.dependents * 2, 6);
    base.family += extraNeeded;
    const fromLifestyle = Math.min(base.lifestyle, Math.ceil(extraNeeded / 2));
    base.lifestyle -= fromLifestyle;
    base.other -= Math.min(base.other, extraNeeded - fromLifestyle);
  }

  // Step 5: Normalize to 100%
  const total = Object.values(base).reduce((sum, val) => sum + val, 0);
  if (total !== 100) base.other += 100 - total;
  Object.keys(base).forEach((key) => {
    const k = key as keyof typeof base;
    if (base[k] < 0) { base.other += base[k]; base[k] = 0; }
  });

  // Step 6: Gross income
  const grossMonthly = input.monthlyIncome + input.monthlyAllowances + Math.round(input.annualBonus / 12);
  const grossIncome = input.calculationMode === "annual" ? grossMonthly * 12 : grossMonthly;

  // Step 7: Payroll deductions
  const payrollResult = calculatePayroll({
    monthlyGrossSalary: grossMonthly,
    taxStatus: input.taxStatus,
    hasBpjsKesehatan: input.hasBpjsKesehatan,
    hasBpjsKetenagakerjaan: input.hasBpjsKetenagakerjaan,
    bpjsEmployeeShareCoveredByCompany: input.medicalCovered,
    pph21CoveredByCompany: input.taxCovered,
    jkkRiskRate: input.jkkRiskRate,
    isFinalPayrollMonth: false,
  });

  const payroll: PayrollDeductionSummary = {
    grossSalary: payrollResult.grossSalary,
    bpjsKesehatanEmployee: payrollResult.bpjsKesehatanEmployee,
    bpjsKesehatanEmployer: payrollResult.bpjsKesehatanEmployer,
    bpjsKesehatanCoveredByCompany: payrollResult.bpjsKesehatanCoveredByCompany,
    jhtEmployee: payrollResult.jhtEmployee,
    jpEmployee: payrollResult.jpEmployee,
    jhtEmployer: payrollResult.jhtEmployer,
    jpEmployer: payrollResult.jpEmployer,
    jkkEmployer: payrollResult.jkkEmployer,
    jkmEmployer: payrollResult.jkmEmployer,
    pph21Amount: payrollResult.pph21Monthly,
    pph21Method: payrollResult.pph21Method,
    terRate: payrollResult.terRate,
    terCategory: payrollResult.terCategory,
    pph21CoveredByCompany: payrollResult.pph21CoveredByCompany,
    totalEmployeeDeductions: payrollResult.totalEmployeeDeductions,
    totalEmployerContributions: payrollResult.totalEmployerContributions,
    totalCompanyCost: payrollResult.totalCompanyCost,
    employeeTakeHome: payrollResult.employeeTakeHome,
  };

  // Budget based on take-home pay
  const totalIncome = input.calculationMode === "annual"
    ? payrollResult.employeeTakeHome * 12
    : payrollResult.employeeTakeHome;

  // Step 8: Categories
  const categories: AllocationCategory[] = Object.entries(base)
    .map(([key, percentage]) => {
      const info = CATEGORY_INFO[key];
      return {
        name: info.label, percentage,
        amount: Math.round((totalIncome * percentage) / 100),
        color: info.color, emoji: info.emoji,
      };
    })
    .filter((cat) => cat.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  return { input, totalIncome, grossIncome, categories, mode: input.calculationMode, payroll };
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}
