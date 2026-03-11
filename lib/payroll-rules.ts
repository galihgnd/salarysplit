/**
 * Indonesian Payroll Rules Configuration
 * 
 * All regulation constants in one place.
 * When regulations change, update values HERE — not in calculation logic.
 * 
 * Sources:
 * - BPJS Kesehatan: Perpres 64/2020
 * - BPJS Ketenagakerjaan: PP 44/2015, PP 46/2015, PP 82/2019
 * - PPh 21: PP 58/2023, PMK 168/2023, Pasal 17 UU PPh
 */

// ============================================================
// BPJS KESEHATAN
// ============================================================

export const BPJS_KESEHATAN = {
  EMPLOYEE_RATE: 0.01,    // 1%
  EMPLOYER_RATE: 0.04,    // 4%
  WAGE_CEILING: 12_000_000,
} as const;

// ============================================================
// BPJS KETENAGAKERJAAN
// ============================================================

/** JHT — Jaminan Hari Tua (Old Age Savings) */
export const JHT = {
  EMPLOYEE_RATE: 0.02,    // 2%
  EMPLOYER_RATE: 0.037,   // 3.7%
} as const;

/** JP — Jaminan Pensiun (Pension) */
export const JP = {
  EMPLOYEE_RATE: 0.01,    // 1%
  EMPLOYER_RATE: 0.02,    // 2%
  WAGE_CEILING: 10_042_300,
} as const;

/** JKK — Jaminan Kecelakaan Kerja (Work Accident Insurance) */
export const JKK = {
  /** Employer-only contribution. Rate depends on industry risk level. */
  RATES: {
    VERY_LOW:  0.0024,    // 0.24% — Group I (very low risk)
    LOW:       0.0054,    // 0.54% — Group II (low risk) — DEFAULT
    MEDIUM:    0.0089,    // 0.89% — Group III (medium risk)
    HIGH:      0.0127,    // 1.27% — Group IV (high risk)
    VERY_HIGH: 0.0174,    // 1.74% — Group V (very high risk)
  },
  DEFAULT_RATE: 0.0054,   // Group II — most common for office/service workers
} as const;

/** JKM — Jaminan Kematian (Death Insurance) */
export const JKM = {
  EMPLOYER_RATE: 0.003,   // 0.3%
} as const;

// ============================================================
// PPH 21 TAX
// ============================================================

/** Annual progressive tax rates (Pasal 17 ayat (1) huruf a UU PPh) */
export const TAX_BRACKETS = [
  { upTo:  60_000_000,       rate: 0.05 },
  { upTo: 250_000_000,       rate: 0.15 },
  { upTo: 500_000_000,       rate: 0.25 },
  { upTo: 5_000_000_000,     rate: 0.30 },
  { upTo: Infinity,          rate: 0.35 },
] as const;

/** Biaya Jabatan (occupational expense deduction) */
export const BIAYA_JABATAN = {
  RATE: 0.05,             // 5% of gross
  MAX_MONTHLY: 500_000,   // Rp 500,000/month cap
  MAX_ANNUAL: 6_000_000,  // Rp 6,000,000/year cap
} as const;

/** PTKP — Penghasilan Tidak Kena Pajak (non-taxable income threshold) */
export const PTKP_VALUES = {
  "TK/0": 54_000_000,
  "TK/1": 58_500_000,
  "TK/2": 63_000_000,
  "TK/3": 67_500_000,
  "K/0":  58_500_000,
  "K/1":  63_000_000,
  "K/2":  67_500_000,
  "K/3":  72_000_000,
} as const;

/** Map PTKP status → TER category (A, B, or C) */
export const TER_CATEGORY_MAP = {
  "TK/0": "A",
  "TK/1": "A",
  "K/0":  "A",
  "TK/2": "B",
  "TK/3": "B",
  "K/1":  "B",
  "K/2":  "B",
  "K/3":  "C",
} as const;

// ============================================================
// JKK RATE OPTIONS (for UI dropdown)
// ============================================================

export const JKK_RATE_OPTIONS = [
  { value: 0.0024, label: "0.24% — Group I (very low risk)", group: "I" },
  { value: 0.0054, label: "0.54% — Group II (low risk)", group: "II" },
  { value: 0.0089, label: "0.89% — Group III (medium risk)", group: "III" },
  { value: 0.0127, label: "1.27% — Group IV (high risk)", group: "IV" },
  { value: 0.0174, label: "1.74% — Group V (very high risk)", group: "V" },
] as const;
