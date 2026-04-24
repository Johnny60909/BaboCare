// DTO Types for Activity management

export const ActivityType = {
  Feeding: 1,
  Eating: 2,
  Diaper: 3,
  Sleep: 4,
  Mood: 5,
} as const;

export type ActivityTypeValue = typeof ActivityType[keyof typeof ActivityType];

export const EatingOption = {
  Supplementary: 1,
  Lunch: 2,
} as const;

export type EatingOptionValue = typeof EatingOption[keyof typeof EatingOption];

export const MoodOption = {
  Outing: 1,
  Playing: 2,
  Unhappy: 3,
} as const;

export type MoodOptionValue = typeof MoodOption[keyof typeof MoodOption];

export interface IActivity {
  id: string;
  babyId: string;
  babyName: string;
  babyAvatarUrl?: string;
  type: ActivityTypeValue;
  photoUrl: string;
  notes?: string;
  typeOption?: number;
  createdAt: string;
  createdByUserId: string;
}

export interface ICreateActivityRequest {
  babyId: string;
  type: ActivityTypeValue;
  photoUrl: string;
  notes?: string;
  typeOption?: number;
}

export interface IBabyActivitySummary {
  babyId: string;
  babyName: string;
  babyAvatarUrl?: string;
  latestActivityAt: string;
  activityCount: number;
}
