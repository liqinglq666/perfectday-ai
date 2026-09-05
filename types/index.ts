export type Scene = "date" | "family" | "parents" | "friends" | "solo" | "rain";
export type Budget = "100" | "300" | "500" | "plus";
export type Walking = "normal" | "low";
export type AdjustmentChange = "rain" | "walk" | "budget" | "queue";

export type PlaceCategory = "start" | "culture" | "coffee" | "food" | "shopping" | "family" | "rest" | "connector" | "activity";

export interface PlanInput {
  request: string;
  scene: Scene;
  duration: number;
  budget: Budget;
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
  visual: string;
  verified: boolean;
  searchKeyword?: string;
  sourceLabel?: string;
  sourceUrl?: string;
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
