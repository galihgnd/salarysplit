/**
 * Indonesia Payroll Deduction Module
 * 
 * Calculates all mandatory Indonesian payroll deductions:
 * 1. BPJS Kesehatan — national health insurance
 * 2. BPJS Ketenagakerjaan — JHT, JP, JKK, JKM
 * 3. PPh 21 — income tax withholding using TER
 * 
 * Sources:
 * - BPJS Kesehatan: Perpres 64/2020
 * - BPJS Ketenagakerjaan: PP 44/2015, PP 46/2015, PP 82/2019
 * - PPh 21: PP 58/2023, PMK 168/2023, TER tables from DJP
 */

import {
  BPJS_KESEHATAN, JHT, JP, JKK, JKM,
  TAX_BRACKETS, BIAYA_JABATAN, PTKP_VALUES, TER_CATEGORY_MAP,
} from "@/lib/payroll-rules";

// ============================================================
// TYPES
// ============================================================

export type TaxStatus =
  | "TK/0" | "TK/1" | "TK/2" | "TK/3"
  | "K/0"  | "K/1"  | "K/2"  | "K/3";

export type TerCategory = "A" | "B" | "C";

export interface PayrollInput {
  monthlyGrossSalary: number;
  taxStatus: TaxStatus;
  hasBpjsKesehatan: boolean;
  hasBpjsKetenagakerjaan: boolean;
  bpjsEmployeeShareCoveredByCompany: boolean;
  pph21Enabled: boolean;
  pph21CoveredByCompany: boolean;
  jkkRiskRate: number;
  isFinalPayrollMonth: boolean;
}

export interface PayrollResult {
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
  pph21Monthly: number;
  pph21Method: "TER" | "annual_reconciliation";
  terRate: number;
  terCategory: TerCategory;
  pph21CoveredByCompany: boolean;
  totalEmployeeDeductions: number;
  totalEmployerContributions: number;
  totalCompanyCost: number;
  employeeTakeHome: number;
}

// ============================================================
// TER RATE TABLES (PP 58/2023)
// ============================================================

type TerBracket = [number, number];

const TER_A: TerBracket[] = [
  [5_400_000, 0], [5_650_000, 0.0025], [5_950_000, 0.005], [6_300_000, 0.0075],
  [6_750_000, 0.01], [7_500_000, 0.0125], [8_550_000, 0.015], [9_650_000, 0.0175],
  [10_050_000, 0.02], [10_350_000, 0.0225], [10_700_000, 0.025], [11_050_000, 0.03],
  [11_600_000, 0.035], [12_500_000, 0.04], [13_750_000, 0.05], [15_100_000, 0.06],
  [16_950_000, 0.07], [19_750_000, 0.08], [24_150_000, 0.09], [26_450_000, 0.10],
  [28_000_000, 0.11], [30_050_000, 0.12], [32_400_000, 0.13], [35_400_000, 0.14],
  [39_100_000, 0.15], [43_850_000, 0.16], [47_800_000, 0.17], [51_400_000, 0.18],
  [56_300_000, 0.19], [62_200_000, 0.20], [68_600_000, 0.21], [77_500_000, 0.22],
  [89_000_000, 0.23], [103_000_000, 0.24], [125_000_000, 0.25], [157_000_000, 0.26],
  [206_000_000, 0.27], [337_000_000, 0.28], [454_000_000, 0.29], [550_000_000, 0.30],
  [695_000_000, 0.31], [910_000_000, 0.32], [1_400_000_000, 0.33], [Infinity, 0.34],
];

const TER_B: TerBracket[] = [
  [6_200_000, 0], [6_500_000, 0.0025], [6_850_000, 0.005], [7_300_000, 0.0075],
  [9_200_000, 0.01], [10_750_000, 0.015], [11_250_000, 0.02], [11_600_000, 0.025],
  [12_600_000, 0.03], [13_600_000, 0.04], [14_950_000, 0.05], [16_400_000, 0.06],
  [18_450_000, 0.07], [21_850_000, 0.08], [26_000_000, 0.09], [27_700_000, 0.10],
  [29_350_000, 0.11], [31_450_000, 0.12], [33_950_000, 0.13], [37_100_000, 0.14],
  [41_100_000, 0.15], [45_800_000, 0.16], [49_500_000, 0.17], [53_800_000, 0.18],
  [58_500_000, 0.19], [64_000_000, 0.20], [71_000_000, 0.21], [80_000_000, 0.22],
  [93_000_000, 0.23], [109_000_000, 0.24], [129_000_000, 0.25], [163_000_000, 0.26],
  [211_000_000, 0.27], [374_000_000, 0.28], [459_000_000, 0.29], [555_000_000, 0.30],
  [704_000_000, 0.31], [957_000_000, 0.32], [1_405_000_000, 0.33], [Infinity, 0.34],
];

const TER_C: TerBracket[] = [
  [6_600_000, 0], [6_950_000, 0.0025], [7_350_000, 0.005], [7_800_000, 0.0075],
  [8_850_000, 0.01], [9_800_000, 0.0125], [10_950_000, 0.015], [11_200_000, 0.0175],
  [12_050_000, 0.02], [12_950_000, 0.03], [14_150_000, 0.04], [15_550_000, 0.05],
  [17_050_000, 0.06], [19_500_000, 0.07], [22_700_000, 0.08], [26_600_000, 0.09],
  [28_100_000, 0.10], [30_100_000, 0.11], [32_600_000, 0.12], [35_400_000, 0.13],
  [38_900_000, 0.14], [43_000_000, 0.15], [47_400_000, 0.16], [51_200_000, 0.17],
  [55_800_000, 0.18], [60_400_000, 0.19], [66_700_000, 0.20], [74_500_000, 0.21],
  [83_200_000, 0.22], [95_600_000, 0.23], [110_000_000, 0.24], [134_000_000, 0.25],
  [169_000_000, 0.26], [221_000_000, 0.27], [390_000_000, 0.28], [463_000_000, 0.29],
  [561_000_000, 0.30], [709_000_000, 0.31], [965_000_000, 0.32], [1_419_000_000, 0.33],
  [Infinity, 0.34],
];

const TER_TABLES: Record<TerCategory, TerBracket[]> = { A: TER_A, B: TER_B, C: TER_C };

// ============================================================
// MODULAR CALCULATION FUNCTIONS
// ============================================================

export function calculateBPJSKesehatan(monthlyGross: number) {
  const base = Math.min(monthlyGross, BPJS_KESEHATAN.WAGE_CEILING);
  return {
    base,
    employee: Math.round(base * BPJS_KESEHATAN.EMPLOYEE_RATE),
    employer: Math.round(base * BPJS_KESEHATAN.EMPLOYER_RATE),
  };
}

export function calculateJHT(monthlyGross: number) {
  return {
    employee: Math.round(monthlyGross * JHT.EMPLOYEE_RATE),
    employer: Math.round(monthlyGross * JHT.EMPLOYER_RATE),
  };
}

export function calculateJP(monthlyGross: number) {
  const base = Math.min(monthlyGross, JP.WAGE_CEILING);
  return {
    base,
    employee: Math.round(base * JP.EMPLOYEE_RATE),
    employer: Math.round(base * JP.EMPLOYER_RATE),
  };
}

export function calculateJKK(monthlyGross: number, riskRate: number = JKK.DEFAULT_RATE) {
  return { employer: Math.round(monthlyGross * riskRate) };
}

export function calculateJKM(monthlyGross: number) {
  return { employer: Math.round(monthlyGross * JKM.EMPLOYER_RATE) };
}

export function calculatePTKP(taxStatus: TaxStatus): number {
  return PTKP_VALUES[taxStatus];
}

export function getTerRate(grossMonthly: number, category: TerCategory): number {
  const table = TER_TABLES[category];
  for (const [upperBound, rate] of table) {
    if (grossMonthly <= upperBound) return rate;
  }
  return table[table.length - 1][1];
}

export function calculateAnnualPph21(annualGross: number, taxStatus: TaxStatus): number {
  const biayaJabatan = Math.min(annualGross * BIAYA_JABATAN.RATE, BIAYA_JABATAN.MAX_ANNUAL);
  const netIncome = annualGross - biayaJabatan;
  const ptkp = calculatePTKP(taxStatus);
  const taxableIncome = Math.max(0, netIncome - ptkp);
  if (taxableIncome <= 0) return 0;

  let tax = 0;
  let remaining = taxableIncome;
  let prevBound = 0;
  for (const bracket of TAX_BRACKETS) {
    const bracketSize = bracket.upTo - prevBound;
    const taxableInBracket = Math.min(remaining, bracketSize);
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
    prevBound = bracket.upTo;
    if (remaining <= 0) break;
  }
  return Math.round(tax);
}

export function calculateTakeHomePay(gross: number, deductions: number): number {
  return gross - deductions;
}

export function calculateCompanyCost(
  gross: number, employerContributions: number,
  companyBorneTax: number, companyBorneBpjs: number
): number {
  return gross + employerContributions + companyBorneTax + companyBorneBpjs;
}

// ============================================================
// MAIN ORCHESTRATOR
// ============================================================

export function calculatePayroll(input: PayrollInput): PayrollResult {
  const { monthlyGrossSalary, taxStatus, isFinalPayrollMonth } = input;

  // BPJS Kesehatan
  let bpjsKesEmp = 0, bpjsKesER = 0;
  if (input.hasBpjsKesehatan) {
    const bpjs = calculateBPJSKesehatan(monthlyGrossSalary);
    bpjsKesEmp = bpjs.employee;
    bpjsKesER = bpjs.employer;
  }

  // BPJS Ketenagakerjaan
  let jhtEmp = 0, jhtER = 0, jpEmp = 0, jpER = 0, jkkER = 0, jkmER = 0;
  if (input.hasBpjsKetenagakerjaan) {
    const jht = calculateJHT(monthlyGrossSalary);
    jhtEmp = jht.employee; jhtER = jht.employer;
    const jp = calculateJP(monthlyGrossSalary);
    jpEmp = jp.employee; jpER = jp.employer;
    jkkER = calculateJKK(monthlyGrossSalary, input.jkkRiskRate).employer;
    jkmER = calculateJKM(monthlyGrossSalary).employer;
  }

  // PPh 21 — only calculate if enabled
  const terCategory = TER_CATEGORY_MAP[taxStatus] as TerCategory;
  let pph21Amount = 0, terRate = 0;
  let pph21Method: "TER" | "annual_reconciliation" = "TER";

  if (input.pph21Enabled) {
    if (!isFinalPayrollMonth) {
      terRate = getTerRate(monthlyGrossSalary, terCategory);
      pph21Amount = Math.round(monthlyGrossSalary * terRate);
    } else {
      const annualGross = monthlyGrossSalary * 12;
      const annualPph21 = calculateAnnualPph21(annualGross, taxStatus);
      const monthlyTerRate = getTerRate(monthlyGrossSalary, terCategory);
      const terAlreadyPaid = Math.round(monthlyGrossSalary * monthlyTerRate) * 11;
      pph21Amount = Math.max(0, annualPph21 - terAlreadyPaid);
      pph21Method = "annual_reconciliation";
    }
  }

  // Employee deductions
  const bpjsKesDeduction = input.bpjsEmployeeShareCoveredByCompany ? 0 : bpjsKesEmp;
  const pph21Deduction = input.pph21CoveredByCompany ? 0 : pph21Amount;
  const totalEmployeeDeductions = bpjsKesDeduction + jhtEmp + jpEmp + pph21Deduction;

  // Employer contributions (never reduce salary)
  const totalEmployerContributions = bpjsKesER + jhtER + jpER + jkkER + jkmER;

  // Company-borne extras
  const companyBorneBpjs = input.bpjsEmployeeShareCoveredByCompany ? bpjsKesEmp : 0;
  const companyBorneTax = input.pph21CoveredByCompany ? pph21Amount : 0;

  return {
    grossSalary: monthlyGrossSalary,
    bpjsKesehatanEmployee: bpjsKesEmp,
    bpjsKesehatanEmployer: bpjsKesER,
    bpjsKesehatanCoveredByCompany: input.bpjsEmployeeShareCoveredByCompany,
    jhtEmployee: jhtEmp, jpEmployee: jpEmp,
    jhtEmployer: jhtER, jpEmployer: jpER,
    jkkEmployer: jkkER, jkmEmployer: jkmER,
    pph21Monthly: pph21Amount, pph21Method, terRate, terCategory,
    pph21CoveredByCompany: input.pph21CoveredByCompany,
    totalEmployeeDeductions, totalEmployerContributions,
    totalCompanyCost: calculateCompanyCost(monthlyGrossSalary, totalEmployerContributions, companyBorneTax, companyBorneBpjs),
    employeeTakeHome: calculateTakeHomePay(monthlyGrossSalary, totalEmployeeDeductions),
  };
}
