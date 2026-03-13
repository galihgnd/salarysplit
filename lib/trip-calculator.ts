import type { TripInput, TripResult, TripCategory } from "@/types/trip";

export function calculateTrip(input: TripInput): TripResult {
  const days = input.durationNights + 1; // days = nights + 1

  const totalFlights = input.flightCost;
  const totalAccommodation = input.accommodationPerNight * input.durationNights;
  const totalMeals = input.dailyMeals * input.travelers * days;
  const totalTransport = input.dailyTransport * input.travelers * days;
  const totalActivities = input.dailyActivities * input.travelers * days;
  const totalShopping = input.shoppingBudget;
  const totalMisc = input.miscBudget;

  const grandTotal =
    totalFlights +
    totalAccommodation +
    totalMeals +
    totalTransport +
    totalActivities +
    totalShopping +
    totalMisc;

  const perPerson = input.travelers > 0 ? Math.round(grandTotal / input.travelers) : grandTotal;
  const perDay = days > 0 ? Math.round(grandTotal / days) : grandTotal;

  // Months to save
  let monthsToSave: number | undefined;
  if (input.lifestyleBudget && input.lifestyleBudget > 0) {
    monthsToSave = Math.ceil((grandTotal / input.lifestyleBudget) * 10) / 10;
  } else if (input.monthlyTakeHome && input.monthlyTakeHome > 0) {
    // Fallback: assume 15% of take-home as lifestyle budget
    const estimatedLifestyle = input.monthlyTakeHome * 0.15;
    monthsToSave = Math.ceil((grandTotal / estimatedLifestyle) * 10) / 10;
  }

  // Build categories
  const rawCategories = [
    { name: "Flights", amount: totalFlights, color: "#3b82f6", emoji: "✈️" },
    { name: "Accommodation", amount: totalAccommodation, color: "#8b5cf6", emoji: "🏨" },
    { name: "Food & Drinks", amount: totalMeals, color: "#14b8a6", emoji: "🍽️" },
    { name: "Transport", amount: totalTransport, color: "#06b6d4", emoji: "🚗" },
    { name: "Activities", amount: totalActivities, color: "#22c55e", emoji: "🎯" },
    { name: "Shopping", amount: totalShopping, color: "#ec4899", emoji: "🛍️" },
    { name: "Miscellaneous", amount: totalMisc, color: "#6b7280", emoji: "📦" },
  ];

  const categories: TripCategory[] = rawCategories
    .filter((c) => c.amount > 0)
    .map((c) => ({
      ...c,
      percentage: grandTotal > 0 ? Math.round((c.amount / grandTotal) * 100) : 0,
    }));

  return {
    input,
    totalFlights,
    totalAccommodation,
    totalMeals,
    totalTransport,
    totalActivities,
    totalShopping,
    totalMisc,
    grandTotal,
    perPerson,
    perDay,
    monthsToSave,
    categories,
  };
}

export function formatRupiahTrip(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
