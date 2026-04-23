// DTO Types for Activity management

export enum ActivityType {
  Feeding = 1,
  Eating = 2,
  Diaper = 3,
  Sleep = 4,
  Mood = 5,
}

export enum EatingOption {
  Supplementary = 1,
  Lunch = 2,
}

export enum MoodOption {
  Outing = 1,
  Playing = 2,
  Unhappy = 3,
}

export interface IActivity {
  id: string;
  babyId: string;
  babyName: string;
  babyAvatarUrl?: string;
  type: ActivityType;
  photoUrl: string;
  notes?: string;
  typeOption?: number;
  createdAt: string;
  createdByUserId: string;
}

export interface ICreateActivityRequest {
  babyId: string;
  type: ActivityType;
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
