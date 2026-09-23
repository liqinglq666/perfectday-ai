export type Scene = "date" | "family" | "parents" | "friends" | "solo" | "rain";
export type Budget = "100" | "300" | "500" | "plus";
export type Walking = "normal" | "low";
export type AdjustmentChange = "rain" | "walk" | "budget" | "queue";

export type PlaceCategory = "start" | "culture" | "coffee" | "dessert" | "food" | "shopping" | "family" | "rest" | "connector" | "activity";
export type EvidenceStatus = "online_listing" | "published_reference" | "public_area";
export type LocationPrecision = "exact" | "mall" | "area";

export interface PlanInput {
  request: string;
  scene: Scene;
  duration: number;
  budget: Budget;
  /** Explicit amount from the request, retained separately from the form's budget tier. */
  budgetLimit?: number;
  walking: Walking;
  intentSource?: "bailian" | "fallback";
  preferredPlaceIds?: string[];
  excludedPlaceIds?: string[];
  indoorOnly?: boolean;
}

export interface Place {
  id: string;
  name: string;
  mall: string;
  floor: string;
  address: string;
  category: PlaceCategory;
  tags: Scene[];
  duration: number;
  price: number;
  indoor: boolean;
  walkMinutes: number;
  note: string;
  icon: string;
  accent: string;
  evidenceStatus: EvidenceStatus;
  locationPrecision: LocationPrecision;
  searchKeyword?: string;
  sourceLabel?: string;
  sourceUrl?: string;
  checkedAt?: string;
  evidenceNote?: string;
  lat?: number;
  lng?: number;
}

export interface TripStop extends Place {
  time: string;
  status?: "kept" | "replaced" | "shortened";
}

export interface TripPlan {
  title: string;
  subtitle: string;
  stops: TripStop[];
  totalMinutes: number;
  totalPrice: number;
  totalWalkMinutes: number;
}
