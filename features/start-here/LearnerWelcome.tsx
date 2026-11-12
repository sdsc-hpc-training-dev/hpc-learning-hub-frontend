"use client";

import Link from "next/link";
import { useLearnerProfile } from "@/features/my-learning/LearnerProfileProvider";
import { feedbackLinkLabel } from "@/features/feedback/links";

export function LearnerWelcome() {
  const { profile } = useLearnerProfile();
  if (!profile?.displayName) return null;
  return (
    <p className="learner-welcome">
      Hello {profile.displayName}, ready to learn something new today?
    </p>
  );
}

export function HomeFeedbackLink() {
  const { profile } = useLearnerProfile();
  return (
    <Link href="/feedback?returnTo=%2F">
      {profile?.displayName
        ? `Let us know what you think, ${profile.displayName}`
        : feedbackLinkLabel}
    </Link>
  );
}
