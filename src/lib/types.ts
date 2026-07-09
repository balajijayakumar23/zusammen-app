export type PlanStatus = "suggested" | "confirmed" | "completed";

export interface ActivitySuggestion {
  title: string;
  description: string;
  venue: string;
  whyItFits: string;
  seasonalNote: string;
}

export interface FriendWithUpcoming {
  id: string;
  name: string;
  dateOfBirth: Date;
  hobby: string;
  city: string;
  notes: string | null;
  groupId: string;
  daysUntil: number;
  ageTheyTurn: number;
  nextBirthday: Date;
  confirmedPlanThisYear: boolean;
}
