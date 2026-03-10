// Types for the SalarySplit calculator

export type MaritalStatus = "single" | "married" | "married_with_children";

export type HousingType = "self_paid" | "company_provided" | "with_parents";

export type CalculationMode = "monthly" | "annual";

// PTKP tax status for Indonesian payroll
export type TaxStatus =
  | "TK/0" | "TK/1" | "TK/2" | "TK/3"
  | "K/0"  | "K/1"  | "K/2"  | "K/3";

// What the user enters into the form
export interface CalculatorInput {
  monthlyIncome: number;
  annualBonus: number;
  monthlyAllowances: number;
  maritalStatus: MaritalStatus;
  dependents: number;
  housingType: HousingType;
  taxCovered: boolean;       // PPh 21 covered by company
  medicalCovered: boolean;   // BPJS employee share covered by company
  calculationMode: CalculationMode;

  // New: payroll deduction fields
  taxStatus: TaxStatus;
  hasBpjsKesehatan: boolean;
}

// One category in the budget breakdown
export interface AllocationCategory {
  name: string;
  percentage: number;
  amount: number;
  color: string;
  emoji: string;
}

// Payroll deduction summary (shown in results)
export interface PayrollDeductionSummary {
  grossSalary: number;
  bpjsEmployerShare: number;
  bpjsEmployeeShare: number;
  bpjsEmployeeCoveredByCompany: boolean;
  pph21Amount: number;
  pph21Method: "TER" | "annual_reconciliation";
  terRate: number;
  terCategory: string;
  pph21CoveredByCompany: boolean;
  totalEmployeeDeductions: number;
  totalCompanyCost: number;
  employeeTakeHome: number;
}

// The full result from the calculator
export interface CalculatorResult {
  input: CalculatorInput;
  totalIncome: number;         // net take-home used for budget allocation
  grossIncome: number;         // gross before deductions
  categories: AllocationCategory[];
  mode: CalculationMode;
  payroll?: PayrollDeductionSummary; // present when BPJS/tax is calculated
}
