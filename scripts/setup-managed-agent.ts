/**
 * ONE-TIME SETUP — run once, then add the IDs to .env.local and Vercel env vars.
 * Usage: npx tsx scripts/setup-managed-agent.ts
 */
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function setup() {
  console.log("Creating DevisFlow Managed Agent environment...");

  const environment = await client.beta.environments.create({
    name: "devisflow-prod",
    config: {
      type: "cloud",
      networking: { type: "unrestricted" },
    },
  });
  console.log("✅ Environment created:", environment.id);

  const agent = await client.beta.agents.create({
    name: "DevisFlow Generator",
    model: "claude-opus-4-7",
    description: "Génère des devis professionnels pour artisans français en JSON structuré.",
    system: `Tu es un expert-comptable spécialisé dans les devis pour artisans et TPE françaises.

Ton rôle : générer des devis professionnels, précis et conformes aux obligations légales françaises.

Règles absolues :
- Réponds UNIQUEMENT en JSON valide (pas de markdown, pas de texte autour)
- Ne modifie JAMAIS les prix fournis — utilise exactement les chiffres donnés
- Calculs précis : total ligne = quantité × prix unitaire
- Mentions légales françaises complètes et à jour
- Notes professionnelles adaptées au corps de métier`,
  });
  console.log("✅ Agent created:", agent.id, "version:", agent.version);

  console.log("\n📋 Ajoute ces variables à .env.local et Vercel :");
  console.log(`ANTHROPIC_AGENT_ID=${agent.id}`);
  console.log(`ANTHROPIC_ENV_ID=${environment.id}`);
}

setup().catch(console.error);
