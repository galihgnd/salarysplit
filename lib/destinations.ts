import type { DestinationPreset } from "@/types/trip";

export const DESTINATION_PRESETS: DestinationPreset[] = [
  {
    id: "domestic",
    name: "Domestic Trip",
    nameId: "Perjalanan Domestik",
    emoji: "🇮🇩",
    dailyMeals: 150000,
    dailyTransport: 100000,
    dailyActivities: 200000,
    hotelLow: 300000,
    hotelHigh: 800000,
    flightSearchQuery: "",
  },
  {
    id: "international",
    name: "International Trip",
    nameId: "Perjalanan Internasional",
    emoji: "🌍",
    dailyMeals: 300000,
    dailyTransport: 200000,
    dailyActivities: 400000,
    hotelLow: 600000,
    hotelHigh: 2000000,
    flightSearchQuery: "",
  },
  {
    id: "custom",
    name: "Custom Trip",
    nameId: "Kustom",
    emoji: "✏️",
    dailyMeals: 0,
    dailyTransport: 0,
    dailyActivities: 0,
    hotelLow: 0,
    hotelHigh: 0,
    flightSearchQuery: "",
  },
];

/**
 * Emergency fund recommendations by trip type
 */
export function getEmergencyFundNote(destinationType: string): {
  title: string;
  titleId: string;
  percentage: number;
  notes: string[];
} | null {
  if (destinationType === "domestic") {
    return {
      title: "Domestic Travel Emergency Fund",
      titleId: "Dana Darurat Perjalanan Domestik",
      percentage: 15,
      notes: [
        "Keep an extra 15% of your total trip budget as emergency fund",
        "Ensure your health insurance (BPJS) is active before traveling",
        "Save emergency contacts for local hospitals at your destination",
        "Keep some cash on hand — not all places accept digital payments",
      ],
    };
  }
  if (destinationType === "international") {
    return {
      title: "International Travel Emergency Fund",
      titleId: "Dana Darurat Perjalanan Internasional",
      percentage: 25,
      notes: [
        "Keep an extra 25% of your total trip budget as emergency fund",
        "Purchase travel insurance before departure — it's essential",
        "Notify your bank about international travel to avoid card blocks",
        "Keep a USD/EUR emergency cash reserve separate from daily spending",
        "Save embassy contact info and your passport copy digitally",
      ],
    };
  }
  return null;
}

/**
 * Generate OTA deep links for a destination.
 * These are simple search page links — no API calls, no scraping.
 */
export function getOTALinks(destinationQuery: string, destinationName?: string) {
  const searchName = destinationName || destinationQuery;
  const encodedName = encodeURIComponent(searchName);
  return {
    flights: [
      {
        name: "Traveloka",
        url: `https://www.traveloka.com/en-id/flight`,
        color: "#0194f3",
      },
      {
        name: "Tiket.com",
        url: `https://www.tiket.com/pesawat`,
        color: "#0064d2",
      },
    ],
    accommodation: [
      {
        name: "Airbnb",
        url: `https://www.airbnb.com/s/${encodedName}/homes`,
        color: "#ff5a5f",
      },
      {
        name: "Agoda",
        url: `https://www.agoda.com/search?city=${encodedName}`,
        color: "#5542f6",
      },
      {
        name: "Booking.com",
        url: `https://www.booking.com/searchresults.html?ss=${encodedName}`,
        color: "#003580",
      },
    ],
  };
}
