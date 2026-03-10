/**
 * Indonesia Payroll Deduction Module
 * 
 * Calculates two mandatory deductions for Indonesian employees:
 * 1. BPJS Kesehatan — national health insurance
 * 2. PPh 21 — income tax withholding using TER (Tarif Efektif Rata-rata)
 * 
 * Sources:
 * - BPJS: Perpres 64/2020 (amendment to Perpres 82/2018)
 * - PPh 21: PP 58/2023, PMK 168/2023, TER tables from DJP
 * 
 * DISCLAIMER: This is a planning tool. Always verify against current
 * Indonesian tax and BPJS regulations before production use.
 */

// ============================================================
// TYPES
// ============================================================

/** PTKP tax status codes used in Indonesian payroll */
export type TaxStatus =
  | "TK/0" // Tidak Kawin, 0 tanggungan
  | "TK/1" // Tidak Kawin, 1 tanggungan
  | "TK/2" // Tidak Kawin, 2 tanggungan
  | "TK/3" // Tidak Kawin, 3 tanggungan
  | "K/0"  // Kawin, 0 tanggungan
  | "K/1"  // Kawin, 1 tanggungan
  | "K/2"  // Kawin, 2 tanggungan
  | "K/3"; // Kawin, 3 tanggungan

/** TER category derived from PTKP status */
export type TerCategory = "A" | "B" | "C";

/** Input for the payroll deduction calculator */
export interface PayrollInput {
  monthlyGrossSalary: number;
  taxStatus: TaxStatus;
  hasBpjsKesehatan: boolean;
  bpjsEmployeeShareCoveredByCompany: boolean;
  pph21CoveredByCompany: boolean;
  isFinalPayrollMonth: boolean; // true = December (annual reconciliation)
}

/** Output from the payroll deduction calculator */
export interface PayrollResult {
  grossSalary: number;

  // BPJS Kesehatan
  bpjsWageBase: number;
  bpjsEmployerShare: number;      // 4% — always paid by company
  bpjsEmployeeShare: number;      // 1% — deducted from employee OR company-covered
  bpjsEmployeeCoveredByCompany: boolean;

  // PPh 21
  pph21Monthly: number;            // tax amount for this month
  pph21Method: "TER" | "annual_reconciliation";
  terRate: number;                 // the TER % applied (0 if final month)
  terCategory: TerCategory;

  pph21CoveredByCompany: boolean;

  // Totals
  totalEmployeeDeductions: number; // what is actually deducted from salary
  totalCompanyCost: number;        // gross + company-borne items
  employeeTakeHome: number;        // gross - employee deductions
}


// ============================================================
// CONSTANTS
// ============================================================

/** BPJS Kesehatan monthly wage ceiling (Perpres 64/2020) */
const BPJS_WAGE_CEILING = 12_000_000;

/** BPJS contribution rates */
const BPJS_EMPLOYER_RATE = 0.04; // 4%
const BPJS_EMPLOYEE_RATE = 0.01; // 1%

/** Annual PTKP values (Penghasilan Tidak Kena Pajak) */
export const PTKP: Record<TaxStatus, number> = {
  "TK/0": 54_000_000,
  "TK/1": 58_500_000,
  "K/0":  58_500_000,
  "TK/2": 63_000_000,
  "K/1":  63_000_000,
  "TK/3": 67_500_000,
  "K/2":  67_500_000,
  "K/3":  72_000_000,
};

/** Map PTKP status → TER category */
export const TAX_STATUS_TO_TER: Record<TaxStatus, TerCategory> = {
  "TK/0": "A",
  "TK/1": "A",
  "K/0":  "A",
  "TK/2": "B",
  "TK/3": "B",
  "K/1":  "B",
  "K/2":  "B",
  "K/3":  "C",
};

/** Annual progressive tax rates (Pasal 17 UU PPh) */
const ANNUAL_TAX_BRACKETS: Array<{ upTo: number; rate: number }> = [
  { upTo: 60_000_000,        rate: 0.05 },
  { upTo: 250_000_000,       rate: 0.15 },
  { upTo: 500_000_000,       rate: 0.25 },
  { upTo: 5_000_000_000,     rate: 0.30 },
  { upTo: Infinity,          rate: 0.35 },
];

/** Biaya jabatan (occupational cost deduction) — 5% of gross, max Rp500k/month */
const BIAYA_JABATAN_RATE = 0.05;
const BIAYA_JABATAN_MAX_MONTHLY = 500_000;


// ============================================================
// TER RATE TABLES (PP 58/2023, effective 1 January 2024)
// Each entry: [upperBound, ratePercent]
// The last entry uses Infinity for "more than" the previous bracket
// ============================================================

type TerBracket = [number, number]; // [upperBound, rate as decimal e.g. 0.0025]

const TER_A: TerBracket[] = [
  [5_400_000, 0],
  [5_650_000, 0.0025],
  [5_950_000, 0.005],
  [6_300_000, 0.0075],
  [6_750_000, 0.01],
  [7_500_000, 0.0125],
  [8_550_000, 0.015],
  [9_650_000, 0.0175],
  [10_050_000, 0.02],
  [10_350_000, 0.0225],
  [10_700_000, 0.025],
  [11_050_000, 0.03],
  [11_600_000, 0.035],
  [12_500_000, 0.04],
  [13_750_000, 0.05],
  [15_100_000, 0.06],
  [16_950_000, 0.07],
  [19_750_000, 0.08],
  [24_150_000, 0.09],
  [26_450_000, 0.10],
  [28_000_000, 0.11],
  [30_050_000, 0.12],
  [32_400_000, 0.13],
  [35_400_000, 0.14],
  [39_100_000, 0.15],
  [43_850_000, 0.16],
  [47_800_000, 0.17],
  [51_400_000, 0.18],
  [56_300_000, 0.19],
  [62_200_000, 0.20],
  [68_600_000, 0.21],
  [77_500_000, 0.22],
  [89_000_000, 0.23],
  [103_000_000, 0.24],
  [125_000_000, 0.25],
  [157_000_000, 0.26],
  [206_000_000, 0.27],
  [337_000_000, 0.28],
  [454_000_000, 0.29],
  [550_000_000, 0.30],
  [695_000_000, 0.31],
  [910_000_000, 0.32],
  [1_400_000_000, 0.33],
  [Infinity, 0.34],
];

const TER_B: TerBracket[] = [
  [6_200_000, 0],
  [6_500_000, 0.0025],
  [6_850_000, 0.005],
  [7_300_000, 0.0075],
  [9_200_000, 0.01],
  [10_750_000, 0.015],
  [11_250_000, 0.02],
  [11_600_000, 0.025],
  [12_600_000, 0.03],
  [13_600_000, 0.04],
  [14_950_000, 0.05],
  [16_400_000, 0.06],
  [18_450_000, 0.07],
  [21_850_000, 0.08],
  [26_000_000, 0.09],
  [27_700_000, 0.10],
  [29_350_000, 0.11],
  [31_450_000, 0.12],
  [33_950_000, 0.13],
  [37_100_000, 0.14],
  [41_100_000, 0.15],
  [45_800_000, 0.16],
  [49_500_000, 0.17],
  [53_800_000, 0.18],
  [58_500_000, 0.19],
  [64_000_000, 0.20],
  [71_000_000, 0.21],
  [80_000_000, 0.22],
  [93_000_000, 0.23],
  [109_000_000, 0.24],
  [129_000_000, 0.25],
  [163_000_000, 0.26],
  [211_000_000, 0.27],
  [374_000_000, 0.28],
  [459_000_000, 0.29],
  [555_000_000, 0.30],
  [704_000_000, 0.31],
  [957_000_000, 0.32],
  [1_405_000_000, 0.33],
  [Infinity, 0.34],
];

const TER_C: TerBracket[] = [
  [6_600_000, 0],
  [6_950_000, 0.0025],
  [7_350_000, 0.005],
  [7_800_000, 0.0075],
  [8_850_000, 0.01],
  [9_800_000, 0.0125],
  [10_950_000, 0.015],
  [11_200_000, 0.0175],
  [12_050_000, 0.02],
  [12_950_000, 0.03],
  [14_150_000, 0.04],
  [15_550_000, 0.05],
  [17_050_000, 0.06],
  [19_500_000, 0.07],
  [22_700_000, 0.08],
  [26_600_000, 0.09],
  [28_100_000, 0.10],
  [30_100_000, 0.11],
  [32_600_000, 0.12],
  [35_400_000, 0.13],
  [38_900_000, 0.14],
  [43_000_000, 0.15],
  [47_400_000, 0.16],
  [51_200_000, 0.17],
  [55_800_000, 0.18],
  [60_400_000, 0.19],
  [66_700_000, 0.20],
  [74_500_000, 0.21],
  [83_200_000, 0.22],
  [95_600_000, 0.23],
  [110_000_000, 0.24],
  [134_000_000, 0.25],
  [169_000_000, 0.26],
  [221_000_000, 0.27],
  [390_000_000, 0.28],
  [463_000_000, 0.29],
  [561_000_000, 0.30],
  [709_000_000, 0.31],
  [965_000_000, 0.32],
  [1_419_000_000, 0.33],
  [Infinity, 0.34],
];

const TER_TABLES: Record<TerCategory, TerBracket[]> = {
  A: TER_A,
  B: TER_B,
  C: TER_C,
};


// ============================================================
// CALCULATION FUNCTIONS
// ============================================================

/**
 * Look up TER rate for a given gross income and TER category.
 * Returns the rate as a decimal (e.g., 0.015 for 1.5%).
 */
export function getTerRate(grossMonthly: number, category: TerCategory): number {
  const table = TER_TABLES[category];
  for (const [upperBound, rate] of table) {
    if (grossMonthly <= upperBound) {
      return rate;
    }
  }
  // Should not reach here, but return highest rate as fallback
  return table[table.length - 1][1];
}

/**
 * Calculate annual PPh 21 using Pasal 17 progressive rates.
 * Used for the final payroll month (December) reconciliation.
 * 
 * Steps:
 * 1. Gross annual income
 * 2. Subtract biaya jabatan (5% of gross, max Rp6jt/year)
 * 3. Subtract PTKP
 * 4. Apply progressive rates to taxable income (PKP)
 */
export function calculateAnnualPph21(
  annualGross: number,
  taxStatus: TaxStatus
): number {
  // Biaya jabatan: 5% of annual gross, capped at Rp6,000,000/year
  const biayaJabatan = Math.min(annualGross * BIAYA_JABATAN_RATE, BIAYA_JABATAN_MAX_MONTHLY * 12);

  // Penghasilan neto (net income)
  const netIncome = annualGross - biayaJabatan;

  // Penghasilan Kena Pajak (taxable income) = net - PTKP
  const ptkp = PTKP[taxStatus];
  const taxableIncome = Math.max(0, netIncome - ptkp);

  if (taxableIncome <= 0) return 0;

  // Apply progressive tax brackets
  let tax = 0;
  let remaining = taxableIncome;
  let prevBound = 0;

  for (const bracket of ANNUAL_TAX_BRACKETS) {
    const bracketSize = bracket.upTo - prevBound;
    const taxableInBracket = Math.min(remaining, bracketSize);
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
    prevBound = bracket.upTo;
    if (remaining <= 0) break;
  }

  return Math.round(tax);
}

/**
 * Calculate BPJS Kesehatan contributions.
 */
function calculateBpjs(monthlyGross: number): {
  wageBase: number;
  employerShare: number;
  employeeShare: number;
} {
  const wageBase = Math.min(monthlyGross, BPJS_WAGE_CEILING);
  return {
    wageBase,
    employerShare: Math.round(wageBase * BPJS_EMPLOYER_RATE),
    employeeShare: Math.round(wageBase * BPJS_EMPLOYEE_RATE),
  };
}


// ============================================================
// MAIN CALCULATOR
// ============================================================

/**
 * Calculate all payroll deductions for one month.
 * 
 * For months Jan–Nov: uses TER (simple multiplication)
 * For December (final month): uses annual reconciliation with Pasal 17 rates
 */
export function calculatePayroll(input: PayrollInput): PayrollResult {
  const { monthlyGrossSalary, taxStatus, isFinalPayrollMonth } = input;

  // --- BPJS Kesehatan ---
  let bpjsEmployerShare = 0;
  let bpjsEmployeeShare = 0;
  let bpjsWageBase = 0;

  if (input.hasBpjsKesehatan) {
    const bpjs = calculateBpjs(monthlyGrossSalary);
    bpjsWageBase = bpjs.wageBase;
    bpjsEmployerShare = bpjs.employerShare;
    bpjsEmployeeShare = bpjs.employeeShare;
  }

  // --- PPh 21 ---
  const terCategory = TAX_STATUS_TO_TER[taxStatus];
  let pph21Monthly = 0;
  let terRate = 0;
  let pph21Method: "TER" | "annual_reconciliation" = "TER";

  if (!isFinalPayrollMonth) {
    // Jan–Nov: simple TER calculation
    // PPh 21 = Gross × TER rate
    terRate = getTerRate(monthlyGrossSalary, terCategory);
    pph21Monthly = Math.round(monthlyGrossSalary * terRate);
    pph21Method = "TER";
  } else {
    // December: annual reconciliation
    // 1. Calculate annual PPh 21 using Pasal 17
    const annualGross = monthlyGrossSalary * 12;
    const annualPph21 = calculateAnnualPph21(annualGross, taxStatus);

    // 2. Calculate total TER already withheld in Jan–Nov
    const monthlyTerRate = getTerRate(monthlyGrossSalary, terCategory);
    const terAlreadyPaid = Math.round(monthlyGrossSalary * monthlyTerRate) * 11;

    // 3. December tax = annual total - already paid
    pph21Monthly = Math.max(0, annualPph21 - terAlreadyPaid);
    terRate = 0; // not applicable for final month
    pph21Method = "annual_reconciliation";
  }

  // --- Calculate totals ---

  // What is actually deducted from employee's salary
  let totalEmployeeDeductions = 0;

  // BPJS employee share: deducted unless company covers it
  const bpjsEmployeeDeduction = input.bpjsEmployeeShareCoveredByCompany ? 0 : bpjsEmployeeShare;
  totalEmployeeDeductions += bpjsEmployeeDeduction;

  // PPh 21: deducted unless company covers it
  const pph21EmployeeDeduction = input.pph21CoveredByCompany ? 0 : pph21Monthly;
  totalEmployeeDeductions += pph21EmployeeDeduction;

  // Employee take-home
  const employeeTakeHome = monthlyGrossSalary - totalEmployeeDeductions;

  // Total company cost = gross salary + employer BPJS + any items company covers for employee
  let totalCompanyCost = monthlyGrossSalary + bpjsEmployerShare;
  if (input.bpjsEmployeeShareCoveredByCompany) totalCompanyCost += bpjsEmployeeShare;
  if (input.pph21CoveredByCompany) totalCompanyCost += pph21Monthly;

  return {
    grossSalary: monthlyGrossSalary,
    bpjsWageBase: bpjsWageBase,
    bpjsEmployerShare,
    bpjsEmployeeShare,
    bpjsEmployeeCoveredByCompany: input.bpjsEmployeeShareCoveredByCompany,
    pph21Monthly,
    pph21Method,
    terRate,
    terCategory,
    pph21CoveredByCompany: input.pph21CoveredByCompany,
    totalEmployeeDeductions,
    totalCompanyCost,
    employeeTakeHome,
  };
}
