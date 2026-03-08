// Types for the SalarySplit calculator

export type MaritalStatus = "single" | "married" | "married_with_children";

export type HousingType = "self_paid" | "company_provided" | "with_parents";

export type CalculationMode = "monthly" | "annual";

// What the user enters into the form
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
}

// One category in the budget breakdown
export interface AllocationCategory {
  name: string;
  percentage: number;
  amount: number;
  color: string;
  emoji: string;
}

// The full result from the calculator
export interface CalculatorResult {
  input: CalculatorInput;
  totalIncome: number;
  categories: AllocationCategory[];
  mode: CalculationMode;
}
