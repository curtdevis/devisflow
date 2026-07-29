import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence, Audio, staticFile } from "remotion";

const NAVY = "#1e3a5f";
const ORANGE = "#f97316";
const WHITE = "#ffffff";

function fadeIn(frame: number, from: number, duration = 20) {
  return interpolate(frame, [from, from + duration], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
}
function slideUp(frame: number, from: number, duration = 20) {
  return interpolate(frame, [from, from + duration], [40, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
}
function typewriter(frame: number, from: number, text: string, cps = 18) {
  const chars = Math.floor(((frame - from) / 30) * cps);
  return text.slice(0, Math.max(0, chars));
}

// ── REEL 01 : Hook Plombier (9:16, 450f = 15s) ─────────────────────────────

function Reel01Hook() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: "Arial, sans-serif" }}>
      <Audio src={staticFile("music.mp3")} volume={0.1} />
      {/* Scene 1 : Question choc (0-90f) */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill style={{ background: NAVY, alignItems: "center", justifyContent: "center", flexDirection: "column", padding: 60, gap: 24 }}>
          <div style={{ opacity: fadeIn(frame, 5, 15), fontSize: 52, fontWeight: 900, color: WHITE, textAlign: "center", lineHeight: 1.15 }}>
            Tu passes encore <span style={{ color: ORANGE }}>3h</span> à faire tes devis ?
          </div>
          <div style={{ opacity: fadeIn(frame, 30, 15), fontSize: 28, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
            Il y a une meilleure façon 👇
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2 : Avant/Après (90-270f) */}
      <Sequence from={90} durationInFrames={180}>
        <AbsoluteFill style={{ background: "#f9fafb", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 40 }}>
          <div style={{ display: "flex", gap: 20, width: "100%" }}>
            <div style={{ opacity: fadeIn(frame - 90, 0, 20), flex: 1, background: "#fee2e2", borderRadius: 20, padding: 28, textAlign: "center" }}>
              <div style={{ fontSize: 64, marginBottom: 12 }}>😰</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#dc2626" }}>AVANT</div>
              <div style={{ fontSize: 18, color: "#7f1d1d", marginTop: 8, lineHeight: 1.4 }}>3h par devis<br/>Tableur Excel<br/>Erreurs de calcul</div>
            </div>
            <div style={{ opacity: fadeIn(frame - 90, 30, 20), flex: 1, background: "#dcfce7", borderRadius: 20, padding: 28, textAlign: "center" }}>
              <div style={{ fontSize: 64, marginBottom: 12 }}>😎</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#16a34a" }}>APRÈS</div>
              <div style={{ fontSize: 18, color: "#14532d", marginTop: 8, lineHeight: 1.4 }}>30 secondes<br/>Depuis le chantier<br/>PDF pro immédiat</div>
            </div>
          </div>
          <div style={{ opacity: fadeIn(frame - 90, 60, 15), fontSize: 20, color: "#6b7280", fontWeight: 600, textAlign: "center" }}>
            Grâce à l'IA DevisFlow ✦
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3 : Démo formulaire (270-390f) */}
      <Sequence from={270} durationInFrames={120}>
        <AbsoluteFill style={{ background: WHITE, padding: 40, flexDirection: "column", justifyContent: "center" }}>
          <div style={{ opacity: fadeIn(frame - 270, 0, 12), fontSize: 22, fontWeight: 900, color: NAVY, marginBottom: 24 }}>
            ✦ DevisFlow génère…
          </div>
          {[
            { label: "Remplacement chauffe-eau 200L", val: "450,00 €", delay: 10 },
            { label: "Main d'œuvre — 4h × 55€/h", val: "220,00 €", delay: 35 },
            { label: "Raccordements", val: "80,00 €", delay: 60 },
          ].map((item) => (
            <div key={item.label} style={{
              opacity: fadeIn(frame - 270, item.delay, 12),
              transform: `translateY(${slideUp(frame - 270, item.delay, 12)}px)`,
              background: "#f9fafb", borderRadius: 14, padding: "16px 20px",
              marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 16, color: NAVY, fontWeight: 600 }}>{item.label}</span>
              <span style={{ fontSize: 18, color: ORANGE, fontWeight: 900 }}>{item.val}</span>
            </div>
          ))}
          <div style={{ opacity: fadeIn(frame - 270, 85, 15), background: NAVY, borderRadius: 14, padding: "16px 20px", display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: WHITE }}>Total TTC</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: ORANGE }}>825,00 €</span>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4 : CTA (390-450f) */}
      <Sequence from={390} durationInFrames={60}>
        <AbsoluteFill style={{ background: NAVY, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
          <div style={{ opacity: fadeIn(frame - 390, 0, 15), fontSize: 56, fontWeight: 900, color: WHITE, textAlign: "center" }}>
            Devis<span style={{ color: ORANGE }}>Flow</span>
          </div>
          <div style={{ opacity: fadeIn(frame - 390, 10, 15), background: ORANGE, borderRadius: 16, padding: "18px 40px" }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: WHITE }}>devis-flow.fr</span>
          </div>
          <div style={{ opacity: fadeIn(frame - 390, 20, 15), fontSize: 18, color: "rgba(255,255,255,0.6)" }}>
            Essai 7 jours gratuit
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
}

// ── REEL 02 : Avant/Après compteur (9:16, 300f = 10s) ──────────────────────

function Reel02AvantApres() {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [20, 90], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const progressGreen = interpolate(frame, [110, 160], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: "Arial, sans-serif" }}>
      <Audio src={staticFile("music.mp3")} volume={0.1} />
      <Sequence from={0} durationInFrames={100}>
        <AbsoluteFill style={{ background: "#111827", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: 60, gap: 16 }}>
          <div style={{ opacity: fadeIn(frame, 0, 12), fontSize: 32, fontWeight: 900, color: WHITE, textAlign: "center" }}>
            Pourquoi perdre du temps au bureau ?
          </div>
          <div style={{ opacity: fadeIn(frame, 20, 12), fontSize: 72, color: ORANGE, fontWeight: 900 }}>⏰</div>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={100} durationInFrames={100}>
        <AbsoluteFill style={{ background: WHITE, padding: 50, flexDirection: "column", justifyContent: "center" }}>
          <div style={{ opacity: fadeIn(frame - 100, 0, 10), fontSize: 20, color: "#6b7280", marginBottom: 12 }}>Temps moyen sans DevisFlow</div>
          <div style={{ opacity: fadeIn(frame - 100, 5, 10), fontSize: 48, fontWeight: 900, color: "#dc2626", marginBottom: 16 }}>2h 47min</div>
          <div style={{ background: "#f3f4f6", borderRadius: 100, height: 20, overflow: "hidden" }}>
            <div style={{ width: `${progress * 100}%`, height: "100%", background: "linear-gradient(90deg, #dc2626, #ef4444)", borderRadius: 100 }} />
          </div>
          <div style={{ opacity: fadeIn(frame - 100, 70, 10), marginTop: 24, fontSize: 16, color: "#6b7280" }}>
            Par devis · Soit ~25h/mois perdues
          </div>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={200} durationInFrames={100}>
        <AbsoluteFill style={{ background: WHITE, padding: 50, flexDirection: "column", justifyContent: "center" }}>
          <div style={{ opacity: fadeIn(frame - 200, 0, 10), fontSize: 20, color: "#6b7280", marginBottom: 12 }}>Avec DevisFlow</div>
          <div style={{ opacity: fadeIn(frame - 200, 5, 10), fontSize: 48, fontWeight: 900, color: "#16a34a", marginBottom: 16 }}>28 sec</div>
          <div style={{ background: "#f3f4f6", borderRadius: 100, height: 20, overflow: "hidden" }}>
            <div style={{ width: `${progressGreen * 3}%`, height: "100%", background: "linear-gradient(90deg, #16a34a, #22c55e)", borderRadius: 100 }} />
          </div>
          <div style={{ opacity: fadeIn(frame - 200, 40, 10), background: NAVY, borderRadius: 16, padding: "18px 24px", marginTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 18, color: WHITE, fontWeight: 700 }}>devis-flow.fr</span>
            <span style={{ fontSize: 16, color: ORANGE, fontWeight: 700 }}>Essai gratuit →</span>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
}

// ── STORY 01 : Témoignage Mohamed (9:16, 225f = 7.5s) ──────────────────────

function Story01Temoignage() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const starScale = (i: number) => spring({ frame: frame - 30 - i * 12, fps, config: { stiffness: 200, damping: 15 } });

  return (
    <AbsoluteFill style={{ fontFamily: "Arial, sans-serif", background: `linear-gradient(160deg, ${NAVY} 0%, #1e40af 100%)`, padding: 48, flexDirection: "column", justifyContent: "center", gap: 28 }}>
      {/* Avatar */}
      <div style={{ opacity: fadeIn(frame, 0, 15), display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: WHITE, border: "3px solid rgba(255,255,255,0.3)" }}>
          MB
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: WHITE }}>Mohamed B.</div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.65)" }}>Plombier indépendant · Lyon</div>
        </div>
      </div>

      {/* Stars */}
      <div style={{ display: "flex", gap: 8 }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{ transform: `scale(${Math.min(1, starScale(i))})`, fontSize: 36, color: "#fbbf24" }}>★</div>
        ))}
      </div>

      {/* Quote */}
      <div style={{ opacity: fadeIn(frame, 60, 20), fontSize: 22, color: WHITE, lineHeight: 1.6, fontStyle: "italic" }}>
        "{frame > 65 ? typewriter(frame, 65, "Je perdais 3h par devis. Maintenant c'est 2 minutes depuis mon téléphone. J'ai signé 5 chantiers de plus ce mois-ci.", 16) : ""}"
      </div>

      {/* Stats */}
      <div style={{ opacity: fadeIn(frame, 150, 15), display: "flex", gap: 16 }}>
        {[{ v: "+5", l: "chantiers/mois" }, { v: "−3h", l: "par devis" }].map(s => (
          <div key={s.l} style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 14, padding: "14px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: ORANGE }}>{s.v}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ opacity: fadeIn(frame, 185, 15), background: ORANGE, borderRadius: 14, padding: "16px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: WHITE }}>Essaie gratuitement → devis-flow.fr</div>
      </div>
    </AbsoluteFill>
  );
}

// ── STORY 02 : Urgence 2026 (9:16, 225f = 7.5s) ────────────────────────────

function Story02Urgence() {
  const frame = useCurrentFrame();
  const pulse = interpolate(frame % 30, [0, 15, 30], [1, 0.85, 1]);
  // Countdown: 1 sept 2026 from 15 april 2026 = 139 days
  const daysLeft = 139;

  return (
    <AbsoluteFill style={{ fontFamily: "Arial, sans-serif", background: "#0f172a", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, gap: 24 }}>
      <div style={{ opacity: fadeIn(frame, 0, 15), transform: `scale(${pulse})`, fontSize: 40, fontWeight: 900, color: "#ef4444", textAlign: "center" }}>
        ⚠️ ATTENTION
      </div>
      <div style={{ opacity: fadeIn(frame, 20, 15), fontSize: 26, fontWeight: 700, color: WHITE, textAlign: "center", lineHeight: 1.4 }}>
        E-facture obligatoire<br/>pour tous les artisans
      </div>
      <div style={{ opacity: fadeIn(frame, 50, 20), background: "#ef4444", borderRadius: 20, padding: "24px 40px", textAlign: "center" }}>
        <div style={{ fontSize: 64, fontWeight: 900, color: WHITE }}>{daysLeft}</div>
        <div style={{ fontSize: 20, color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>jours restants</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>1er septembre 2026</div>
      </div>
      <div style={{ opacity: fadeIn(frame, 130, 15), background: "#16a34a", borderRadius: 16, padding: "18px 32px", textAlign: "center", width: "100%" }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: WHITE }}>✓ DevisFlow est déjà conforme</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>Factur-X · E-facture 2026 ready</div>
      </div>
      <div style={{ opacity: fadeIn(frame, 175, 15), fontSize: 18, fontWeight: 700, color: ORANGE, textAlign: "center" }}>
        → devis-flow.fr · Essai 7 jours
      </div>
    </AbsoluteFill>
  );
}

// ── CAROUSEL : 6 raisons (16:9, 1080x608, 900f) ────────────────────────────

const CAROUSEL_SLIDES = [
  { title: "6 raisons d'utiliser DevisFlow", sub: "Le logiciel devis N°1 des artisans", icon: "✦", bg: NAVY, color: WHITE },
  { title: "⚡ Devis en 30 secondes", sub: "L'IA génère tout automatiquement — lignes, prix, mentions légales", icon: "⚡", bg: WHITE, color: NAVY },
  { title: "📱 Depuis votre téléphone", sub: "Créez un devis sur le chantier, envoyez-le immédiatement par WhatsApp", icon: "📱", bg: "#fff7ed", color: NAVY },
  { title: "🤖 IA formée sur votre métier", sub: "Plomberie, électricité, peinture, maçonnerie — elle connaît vos prix", icon: "🤖", bg: WHITE, color: NAVY },
  { title: "✅ Conforme e-facture 2026", sub: "Prêt pour la réglementation Factur-X — obligatoire dès septembre 2026", icon: "✅", bg: "#f0fdf4", color: NAVY },
  { title: "Essai 7 jours gratuit", sub: "devis-flow.fr · Aucun engagement", icon: "→", bg: ORANGE, color: WHITE },
];

function CarouselSlide({ slideIndex, localFrame }: { slideIndex: number; localFrame: number }) {
  const slide = CAROUSEL_SLIDES[slideIndex];
  return (
    <AbsoluteFill style={{ background: slide.bg, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, padding: 60, fontFamily: "Arial, sans-serif" }}>
      <div style={{ opacity: fadeIn(localFrame, 0, 20), fontSize: 72 }}>{slide.icon}</div>
      <div style={{ opacity: fadeIn(localFrame, 15, 20), fontSize: 34, fontWeight: 900, color: slide.color, textAlign: "center", lineHeight: 1.2 }}>{slide.title}</div>
      <div style={{ opacity: fadeIn(localFrame, 30, 20), fontSize: 20, color: slideIndex === 0 || slideIndex === 5 ? "rgba(255,255,255,0.75)" : "#6b7280", textAlign: "center", lineHeight: 1.5, maxWidth: 700 }}>{slide.sub}</div>
      {slideIndex === 0 && <div style={{ opacity: fadeIn(localFrame, 50, 15), display: "flex", gap: 8, marginTop: 8 }}>{[0,1,2,3,4,5].map(i => <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: i === 0 ? ORANGE : "rgba(255,255,255,0.3)" }} />)}</div>}
    </AbsoluteFill>
  );
}

function Carousel6Raisons() {
  const frame = useCurrentFrame();
  const slideIndex = Math.min(5, Math.floor(frame / 150));
  const localFrame = frame % 150;
  return <CarouselSlide slideIndex={slideIndex} localFrame={localFrame} />;
}

export { Reel01Hook, Reel02AvantApres, Story01Temoignage, Story02Urgence, Carousel6Raisons };
