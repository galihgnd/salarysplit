// Types for the SalarySplit Trip Budget Planner

export interface DestinationPreset {
  id: string;
  name: string;
  nameId: string; // Bahasa Indonesia name
  emoji: string;
  dailyMeals: number;
  dailyTransport: number;
  dailyActivities: number;
  hotelLow: number;
  hotelHigh: number;
  flightSearchQuery: string; // destination code/name for OTA deep links
}

export interface TripInput {
  destination: string;
  durationNights: number;
  travelers: number;
  // Flight
  flightCost: number; // total round-trip, entered manually
  // Accommodation
  accommodationPerNight: number;
  // Daily costs (per person per day)
  dailyMeals: number;
  dailyTransport: number;
  dailyActivities: number;
  // Extras (total)
  shoppingBudget: number;
  miscBudget: number;
  // Salary connection (optional)
  monthlyTakeHome?: number;
  lifestyleBudget?: number;
}

export interface TripCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  emoji: string;
}

export interface TripResult {
  input: TripInput;
  totalFlights: number;
  totalAccommodation: number;
  totalMeals: number;
  totalTransport: number;
  totalActivities: number;
  totalShopping: number;
  totalMisc: number;
  grandTotal: number;
  perPerson: number;
  perDay: number;
  monthsToSave?: number;
  categories: TripCategory[];
}
