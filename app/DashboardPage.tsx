"use client";

import { useEffect, useState } from "react";
import {
  OnboardingProfile,
  loadOnboardingProfile
} from "../lib/onboarding";

type CyclePhase = "Follicular" | "Ovulatory" | "Luteal" | "Menstrual";

interface SimulationResult {
  healthScore: number;
  predictedCost: number;
  advice: string;
}

function dailyTip(phase: CyclePhase, profile: OnboardingProfile | null): string {
  const name = profile?.name || "Today";
  const goal = profile?.primaryGoal;

  if (phase === "Follicular") {
    return `${name}, your follicular phase often brings rising energy. Pair that with your goal${
      goal ? ` of ${goal.toLowerCase()}` : ""
    } by scheduling learning, planning, or strength sessions while you naturally feel more open and focused.`;
  }
  if (phase === "Ovulatory") {
    return `Ovulatory days can feel more social and expressive. Use that boost for collaborative work, networking, or movement that feels fun—not punishing—then protect wind-down time at night.`;
  }
  if (phase === "Luteal") {
    return `In your luteal phase, it’s normal to feel a bit heavier or more sensitive. Build in buffers between tasks, aim for earlier sleep, and let your movement skew toward walks, Pilates, or yoga.`;
  }
  return `Menstrual days are a natural time for reflection and gentler output. Where possible, clear space for rest, warm foods, and lower-stakes tasks while your body does intense internal work.`;
}

function productivitySuggestion(phase: CyclePhase): string {
  switch (phase) {
    case "Follicular":
      return "Use follicular energy for learning, planning, and starting new projects—your brain is primed for exploration.";
    case "Ovulatory":
      return "Leverage ovulatory confidence for meetings, interviews, presentations, and relationship-centered work.";
    case "Luteal":
      return "The luteal phase is ideal for detail work, editing, organizing, and gently closing open loops.";
    case "Menstrual":
    default:
      return "During your bleed, protect time for reflection, reviewing what’s working, and low-pressure admin instead of heavy lifting.";
  }
}

function budgetInsight(
  budget: number,
  profile: OnboardingProfile | null
): string {
  if (!budget || budget <= 0) {
    return "Consider starting with even a tiny wellness line in your budget—like $20–$40 a month you intentionally direct toward what supports you most.";
  }

  const categories = profile?.wellnessSpending || [];
  if (categories.length === 0) {
    return `With roughly $${Math.round(
      budget
    )} per month, you might test a simple split: 40% movement, 30% mental health, and 30% rest-focused comforts like massages, baths, or cozy tools.`;
  }

  if (categories.includes("Therapy/Mental Health")) {
    return `Since therapy or mental health support is in the mix, protect that in your ~$${Math.round(
      budget
    )} budget first, then allocate what’s left across movement and everyday comforts rather than impulse buys.`;
  }

  return `With a wellness budget of about $${Math.round(
    budget
  )}, choose 1–2 “non-negotiable” supports from your current spending and gently trim the rest so your money matches what truly moves the needle.`;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [phase, setPhase] = useState<CyclePhase>("Follicular");
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [exerciseDays, setExerciseDays] = useState<number>(3);
  const [budget, setBudget] = useState<number>(200);
  const [result, setResult] = useState<SimulationResult | null>(null);

  useEffect(() => {
    const loaded = loadOnboardingProfile();
    if (!loaded) return;

    setProfile(loaded);
    if (
      loaded.currentPhase === "Follicular" ||
      loaded.currentPhase === "Ovulatory" ||
      loaded.currentPhase === "Luteal" ||
      loaded.currentPhase === "Menstrual"
    ) {
      setPhase(loaded.currentPhase);
    }
    if (loaded.sleepHours) setSleepHours(loaded.sleepHours);
    if (loaded.exerciseDays) setExerciseDays(loaded.exerciseDays);
    if (loaded.monthlyBudget) setBudget(loaded.monthlyBudget);
  }, []);

  const runSimulation = () => {
    // Start at a neutral baseline and move meaningfully up or down
    let score = 75;

    // Sleep impact (strongest driver)
    if (sleepHours <= 3) {
      score -= 30;
    } else if (sleepHours <= 5) {
      score -= 18;
    } else if (sleepHours < 7) {
      score -= 8;
    } else if (sleepHours >= 7 && sleepHours <= 9) {
      score += 5;
    }

    // Extra sensitivity in luteal/menstrual if sleep is short
    if ((phase === "Luteal" || phase === "Menstrual") && sleepHours < 6) {
      score -= 8;
    }

    // Exercise impact (consistency over intensity)
    if (exerciseDays === 0) {
      score -= 20;
    } else if (exerciseDays <= 2) {
      score -= 8;
    } else if (exerciseDays <= 4) {
      // neutral to slightly positive
      score += 2;
    } else {
      score += 6;
    }

    // Clamp score between 0–100 so very low sleep + movement can feel clearly rough
    const healthScore = Math.max(0, Math.min(100, Math.round(score)));

    // Predicted wellness cost relative to health score and budget
    const baseline = budget || 0;
    let predictedCost = baseline;

    if (healthScore < 30) {
      predictedCost += 200;
    } else if (healthScore < 50) {
      predictedCost += 120;
    } else if (healthScore < 70) {
      predictedCost += 60;
    } else if (healthScore > 85) {
      predictedCost -= 40;
    }

    predictedCost = Math.max(0, Math.round(predictedCost));

    const adviceParts: string[] = [];

    // Overall framing based on score
    if (healthScore < 30) {
      adviceParts.push(
        "Right now your simulated wellness score is quite low, which suggests your body and nervous system are under a lot of strain. This isn’t about blame—it’s a signal to introduce the smallest, kindest changes possible."
      );
    } else if (healthScore < 50) {
      adviceParts.push(
        "Your simulated wellness score is on the lower side, meaning there’s real opportunity to feel better with gentle, consistent shifts in sleep, movement, and stress support."
      );
    } else if (healthScore < 70) {
      adviceParts.push(
        "Your simulated wellness score is moderate. Some foundations are there, and small upgrades in rest and routine could move the needle meaningfully."
      );
    } else {
      adviceParts.push(
        "Your simulated wellness score is relatively strong. The goal now is to keep things sustainable and aligned with your cycle, rather than chasing perfection."
      );
    }

    // Phase-aware guidance
    if (phase === "Follicular") {
      adviceParts.push(
        "You are in your follicular phase—energy often starts to build. This is a great window for strength training, planning, and creative work."
      );
    } else if (phase === "Ovulatory") {
      adviceParts.push(
        "You are in your ovulatory phase—social energy and confidence can feel higher. Consider scheduling collaborative work, networking, or high-intensity workouts if they feel good."
      );
    } else if (phase === "Luteal") {
      adviceParts.push(
        "You are in your luteal phase—your body is preparing to bleed. Prioritize calming routines, nourishing meals, and earlier bedtimes to support mood and energy."
      );
    } else if (phase === "Menstrual") {
      adviceParts.push(
        "You are in your menstrual phase—rest, reflection, and gentle movement are especially supportive. Give yourself permission to slow down where you can."
      );
    }

    // Sleep guidance
    if (sleepHours <= 3) {
      adviceParts.push(
        "Sleep looks extremely short right now. If it’s within your control, prioritise adding even 30–60 minutes of rest at a time, and consider speaking with a clinician if this pattern continues."
      );
    } else if (sleepHours < 7) {
      adviceParts.push(
        "Aim for a consistent 7–9 hours of sleep. Try winding down 30 minutes earlier, dimming lights, and stepping away from screens before bed."
      );
    } else {
      adviceParts.push(
        "Your sleep looks broadly supportive—keep protecting your wind-down routine and morning light exposure to stabilize energy and mood."
      );
    }

    // Exercise guidance
    if (exerciseDays === 0) {
      adviceParts.push(
        "Movement is essentially at zero right now. Start with very small, kind goals—like a 10-minute walk most days or stretching while you watch a show. Consistency matters more than intensity."
      );
    } else if (exerciseDays <= 2) {
      adviceParts.push(
        "You are moving a bit each week already. See if you can add one more low-pressure session, like gentle yoga or a walk with a friend."
      );
    } else {
      adviceParts.push(
        "Your movement routine is a strong foundation. Check in with how your training lines up with each phase—higher intensity in follicular/ovulatory and softer movement in luteal/menstrual can feel more sustainable."
      );
    }

    // Budget guidance
    if (!budget || budget <= 0) {
      adviceParts.push(
        "Consider setting aside even a small monthly wellness amount—this could go toward therapy co-pays, a fitness class you love, or a calming ritual at home."
      );
    } else if (predictedCost > budget) {
      adviceParts.push(
        "Your predicted wellness expenses may sit above your current budget. You might prioritize 1–2 high-impact supports (like therapy or a class you truly enjoy) and pause lower-impact impulse purchases."
      );
    } else {
      adviceParts.push(
        "Your current budget looks aligned with your projected needs. Keep tracking where it actually goes—toward things that genuinely support your energy, mood, and long-term health."
      );
    }

    adviceParts.push(
      "This simulation is informational only and not medical or financial advice. Always partner with healthcare and financial professionals for personalized care."
    );

    setResult({
      healthScore,
      predictedCost,
      advice: adviceParts.join(" ")
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Wellness &amp; Finance Dashboard
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
          Input your current phase, habits, and wellness budget. FemAI will
          simulate a holistic health score, estimate wellness spending, and
          share gentle, cycle-aware recommendations.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr,2.2fr] lg:items-start">
        <section className="glass-card space-y-6 p-6">
          <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
            Your current snapshot
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Cycle phase
              </label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value as CyclePhase)}
                className="w-full rounded-2xl border border-lavender-100 bg-white/80 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-lavender-400"
              >
                <option value="Follicular">Follicular</option>
                <option value="Ovulatory">Ovulatory</option>
                <option value="Luteal">Luteal</option>
                <option value="Menstrual">Menstrual</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Align habits and spending with how your hormones fluctuate
                through each phase.
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs font-medium text-slate-700">
                <span>Sleep per night</span>
                <span className="text-[11px] text-slate-500">
                  {sleepHours} hours
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={12}
                step={0.5}
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full accent-lavender-500"
              />
              <p className="text-[11px] text-slate-500">
                Aim for 7–9 hours, especially in luteal and menstrual phases.
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs font-medium text-slate-700">
                <span>Exercise days per week</span>
                <span className="text-[11px] text-slate-500">
                  {exerciseDays} days
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={7}
                step={1}
                value={exerciseDays}
                onChange={(e) => setExerciseDays(parseInt(e.target.value, 10))}
                className="w-full accent-lavender-500"
              />
              <p className="text-[11px] text-slate-500">
                Think in terms of small, repeatable movement rather than
                perfection.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Monthly wellness budget (USD)
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-lavender-100 bg-white/80 px-3 py-2.5 shadow-sm">
                <span className="text-xs text-slate-500">$</span>
                <input
                  type="number"
                  min={0}
                  value={Number.isNaN(budget) ? "" : budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  placeholder="e.g. 200"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Include therapy, coaching, classes, supplements, and
                restorative self-care.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-[11px] text-slate-500">
              This is a gentle simulation, not medical or financial advice.
            </p>
            <button
              type="button"
              onClick={runSimulation}
              className="primary-btn text-xs sm:text-sm"
            >
              Run simulation
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="glass-card grid gap-4 p-5 sm:grid-cols-3">
            <div className="space-y-1 border-r border-slate-100 pr-3 sm:pr-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Health score
              </p>
              <p className="text-3xl font-semibold text-lavender-700">
                {result ? result.healthScore : "—"}
              </p>
              <p className="text-[11px] text-slate-500">
                Higher scores reflect more supportive sleep, movement, and
                alignment with your phase.
              </p>
            </div>

            <div className="space-y-1 border-r border-slate-100 px-3 sm:px-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Predicted monthly wellness cost
              </p>
              <p className="text-2xl font-semibold text-slate-900">
                {result ? `$${result.predictedCost}` : "—"}
              </p>
              <p className="text-[11px] text-slate-500">
                Includes additional care needs when your body may need more
                support.
              </p>
            </div>

            <div className="space-y-1 pl-3 sm:pl-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Phase
              </p>
              <p className="text-sm font-semibold text-slate-900">{phase}</p>
              <p className="text-[11px] text-slate-500">
                Use this insight alongside your own body wisdom—not instead of
                it.
              </p>
            </div>
          </div>

          <div className="glass-card h-56 max-h-72 overflow-y-auto p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              AI wellness recommendation
            </p>
            <p className="mt-3 text-sm text-slate-700">
              {result
                ? result.advice
                : "Run a simulation to receive phase-aware guidance on your habits, energy, and wellness spending."}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="glass-card space-y-2 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Daily AI tip
              </p>
              <p className="text-sm text-slate-700">
                {dailyTip(phase, profile)}
              </p>
            </div>
            <div className="glass-card space-y-2 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Cycle-aware productivity
              </p>
              <p className="text-sm text-slate-700">
                {productivitySuggestion(phase)}
              </p>
            </div>
          </div>

          <div className="glass-card space-y-2 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Wellness + finance insight
            </p>
            <p className="text-sm text-slate-700">
              {budgetInsight(budget, profile)}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}      
