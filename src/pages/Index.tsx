import { useState, useEffect } from "react";
import { UserProfile } from "@/lib/types";
import AdviceDashboard from "@/components/AdviceDashboard";
import OnboardingForm from "@/components/OnboardingForm";
import FinancialSnapshot from "./FinancialSnapshot";

const PROFILE_KEY = "wealthwise_profile";
const STAGE_KEY = "wealthwise_stage";

type Stage = "onboarding" | "review" | "dashboard";

const Index = () => {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = sessionStorage.getItem(PROFILE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [stage, setStage] = useState<Stage>(() => {
    try {
      const saved = sessionStorage.getItem(STAGE_KEY);
      if (saved === "review" || saved === "dashboard") return saved;
    } catch {
      // ignore
    }
    return "onboarding";
  });

  useEffect(() => {
    if (profile) {
      sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } else {
      sessionStorage.removeItem(PROFILE_KEY);
    }
  }, [profile]);

  useEffect(() => {
    sessionStorage.setItem(STAGE_KEY, stage);
  }, [stage]);

  const handleOnboardingComplete = (p: UserProfile) => {
    setProfile(p);
    setStage("review");
  };

  const handleReset = () => {
    setProfile(null);
    setStage("onboarding");
  };

  if (!profile || stage === "onboarding") {
    return <OnboardingForm onComplete={handleOnboardingComplete} />;
  }

  if (stage === "review") {
    return (
      <FinancialSnapshot
        profile={profile}
        onContinue={() => setStage("dashboard")}
        onEdit={handleReset}
      />
    );
  }

  return <AdviceDashboard profile={profile} onReset={handleReset} />;
};

export default Index;
