export interface OnboardingProfile {
  name?: string;
  primaryGoal?: string;
  currentPhase?: "Follicular" | "Ovulatory" | "Luteal" | "Menstrual";
  sleepHours?: number;
  exerciseDays?: number;
  monthlyBudget?: number;
  wellnessSpending?: string[];
}

// Fake loader for testing
export function loadOnboardingProfile(): OnboardingProfile | null {
  return {
    name: "Zafeera",
    primaryGoal: "Wellness",
    currentPhase: "Follicular",
    sleepHours: 7,
    exerciseDays: 3,
    monthlyBudget: 200,
    wellnessSpending: ["Therapy/Mental Health"]
  };
}
