// Lightweight linear-regression price predictor "trained" on a seeded
// Bangalore-style housing dataset. Runs deterministically client-side.

type LocTier = 1 | 2 | 3; // 1=premium, 2=mid, 3=outskirts

const LOCATION_TIERS: Record<string, LocTier> = {
  indiranagar: 1, koramangala: 1, whitefield: 1, "hsr layout": 1, jayanagar: 1,
  "mg road": 1, malleshwaram: 1,
  marathahalli: 2, "btm layout": 2, "jp nagar": 2, "banashankari": 2,
  bellandur: 2, "electronic city": 2, hebbal: 2, yelahanka: 2,
  "kr puram": 3, sarjapur: 3, hosur: 3, devanahalli: 3, kengeri: 3,
};

function tierFor(location: string): LocTier {
  const k = location.trim().toLowerCase();
  if (LOCATION_TIERS[k]) return LOCATION_TIERS[k];
  // hash-based fallback so unknown locations are deterministic
  let h = 0;
  for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
  return ((h % 3) + 1) as LocTier;
}

// Coefficients fit to a synthetic Bangalore-like dataset (₹ Lakhs).
// price ≈ b0 + b1*area + b2*bedrooms + b3*bathrooms + b4*tierFactor*area
const COEF = {
  intercept: -8.5,
  area: 0.0062,        // per sqft base
  bedrooms: 6.2,
  bathrooms: 4.1,
  tierArea: { 1: 0.0095, 2: 0.0055, 3: 0.0028 } as Record<LocTier, number>,
};

export interface PredictInput {
  location: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
}

export function predictPrice(input: PredictInput): number {
  const tier = tierFor(input.location);
  const lakhs =
    COEF.intercept +
    COEF.area * input.area +
    COEF.bedrooms * input.bedrooms +
    COEF.bathrooms * input.bathrooms +
    COEF.tierArea[tier] * input.area;
  // Convert lakhs to rupees, floor to 1000
  const rupees = Math.max(500000, Math.round((lakhs * 100000) / 1000) * 1000);
  return rupees;
}

export function formatINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export const SUGGESTED_LOCATIONS = Object.keys(LOCATION_TIERS).map(
  (k) => k.replace(/\b\w/g, (c) => c.toUpperCase())
);
