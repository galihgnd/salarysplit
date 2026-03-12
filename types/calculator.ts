// Types for the SalarySplit calculator

export type MaritalStatus = "single" | "married" | "married_with_children";
export type HousingType = "self_paid" | "company_provided" | "with_parents";
export type CalculationMode = "monthly" | "annual";
export type TaxStatus =
  | "TK/0" | "TK/1" | "TK/2" | "TK/3"
  | "K/0"  | "K/1"  | "K/2"  | "K/3";

// Budgeting framework options
export type BudgetRule = "50_30_20" | "80_20" | "70_20_10" | "custom";

// Debt input mode
export type DebtMode = "simple" | "detailed";

export interface DebtItem {
  label: string;
  amount: number;
}

export interface CalculatorInput {
  monthlyIncome: number;       // base gross salary (used for tax/BPJS calculation)
  annualBonus: number;         // NOT included in tax calculation, added after
  monthlyAllowances: number;   // NOT included in tax calculation, added after
  maritalStatus: MaritalStatus;
  dependents: number;
  housingType: HousingType;
  taxCovered: boolean;
  medicalCovered: boolean;
  calculationMode: CalculationMode;
  taxStatus: TaxStatus;
  hasBpjsKesehatan: boolean;
  hasBpjsKetenagakerjaan: boolean;
  pph21Enabled: boolean;
  jkkRiskRate: number;
  budgetRule: BudgetRule;
  // Debt
  debtMode: DebtMode;
  totalDebt: number;           // simple mode
  debtItems: DebtItem[];       // detailed mode
}

export interface AllocationCategory {
  name: string;
  percentage: number;
  amount: number;
  color: string;
  emoji: string;
}

export interface PayrollDeductionSummary {
  grossSalary: number;
  bpjsKesehatanEmployee: number;
  bpjsKesehatanEmployer: number;
  bpjsKesehatanCoveredByCompany: boolean;
  jhtEmployee: number;
  jpEmployee: number;
  jhtEmployer: number;
  jpEmployer: number;
  jkkEmployer: number;
  jkmEmployer: number;
  pph21Amount: number;
  pph21Method: "TER" | "annual_reconciliation";
  terRate: number;
  terCategory: string;
  pph21CoveredByCompany: boolean;
  totalEmployeeDeductions: number;
  totalEmployerContributions: number;
  totalCompanyCost: number;
  employeeTakeHome: number;
}

export interface CalculatorResult {
  input: CalculatorInput;
  baseTakeHome: number;        // take-home from base salary after deductions
  extraIncome: number;         // allowances + bonus (added after deductions)
  totalIncome: number;         // baseTakeHome + extraIncome (used for budget)
  grossIncome: number;         // base gross only
  categories: AllocationCategory[];
  mode: CalculationMode;
  payroll?: PayrollDeductionSummary;
  totalDebt: number;           // monthly debt obligation
  availableAfterDebt: number;  // totalIncome - totalDebt
  analytics: AnalyticsData;
  budgetRule: BudgetRule;
}

export interface AnalyticsInsight {
  icon: string;
  title: string;
  value: string;
  description: string;
  status: "good" | "warning" | "danger" | "info";
}

export interface AnalyticsData {
  insights: AnalyticsInsight[];
  savingsRate: number;
  debtRatio: number;
  healthScore: number;
}
