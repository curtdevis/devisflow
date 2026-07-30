import { initBotId } from "botid/client/core";

// Vercel BotID — invisible bot protection for public, unauthenticated
// endpoints. Only routes listed here get the challenge headers attached;
// checkBotId() on a route NOT listed here will not see a valid response.
// See src/app/api/track/route.ts and src/app/api/contact/route.ts.
initBotId({
  protect: [
    { path: "/api/track", method: "POST" },
    { path: "/api/contact", method: "POST" },
  ],
});
