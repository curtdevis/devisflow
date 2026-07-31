/** Intermédiaire plan "multi-utilisateurs" — self-service team invites, capped
 * at 2 members per owner. Enforced in /api/team/invite (server) and mirrored
 * here for the dashboard UI (src/app/dashboard/team/TeamManager.tsx).
 * Distinct, lighter mechanism from Cabinet & Groupement's ARTISAN_LIMIT
 * (see agence-limits.ts) — do not conflate the two systems. */
export const MAX_TEAM_MEMBERS = 2;
