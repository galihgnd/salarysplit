// Types for the SalarySplit calculator

export type MaritalStatus = "single" | "married" | "married_with_children";
export type HousingType = "self_paid" | "company_provided" | "with_parents";
export type CalculationMode = "monthly" | "annual";
export type TaxStatus =
  | "TK/0" | "TK/1" | "TK/2" | "TK/3"
  | "K/0"  | "K/1"  | "K/2"  | "K/3";

export interface CalculatorInput {
  monthlyIncome: number;
  annualBonus: number;
  monthlyAllowances: number;
  maritalStatus: MaritalStatus;
  dependents: number;
  housingType: HousingType;
  taxCovered: boolean;
  medicalCovered: boolean;
  calculationMode: CalculationMode;
  taxStatus: TaxStatus;
  hasBpjsKesehatan: boolean;
  hasBpjsKetenagakerjaan: boolean;
  jkkRiskRate: number;
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
  totalIncome: number;
  grossIncome: number;
  categories: AllocationCategory[];
  mode: CalculationMode;
  payroll?: PayrollDeductionSummary;
}
