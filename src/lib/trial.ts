// Single source of truth for trial-length math. Previously TRIAL_DAYS = 7 was
// hardcoded independently in 8 different files — harmless while every trial
// was exactly 7 days, but the retargeting offer (14-day trial for prospects
// who clicked a retargeting email, see profiles.trial_days) needs every one
// of those sites to respect a per-account value instead of the same fixed
// constant, or some would show/enforce 7 days while others honored 14.
export const DEFAULT_TRIAL_DAYS = 7;

export function daysSince(createdAt: string): number {
  return (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
}

export function isTrialExpired(createdAt: string, trialDays: number | null | undefined): boolean {
  return daysSince(createdAt) > (trialDays ?? DEFAULT_TRIAL_DAYS);
}

export function trialDaysLeft(createdAt: string, trialDays: number | null | undefined): number {
  return Math.max(0, Math.ceil((trialDays ?? DEFAULT_TRIAL_DAYS) - daysSince(createdAt)));
}
