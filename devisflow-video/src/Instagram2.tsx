import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Audio,
  staticFile,
} from "remotion";

const NAVY = "#1e3a5f";
const ORANGE = "#f97316";
const WHITE = "#ffffff";

function fadeIn(frame: number, from: number, duration = 20) {
  return interpolate(frame, [from, from + duration], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
}

function slideUp(frame: number, from: number, duration = 20) {
  return interpolate(frame, [from, from + duration], [40, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
}

function typewriter(frame: number, from: number, text: string, cps = 18) {
  const chars = Math.floor(((frame - from) / 30) * cps);
  return text.slice(0, Math.max(0, chars));
}

// ── COMP 1 : Story03SophieElec (9:16, 1080x1920, 225f=7.5s) ─────────────────

export function Story03SophieElec() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const starScale = (i: number) =>
    spring({ frame: frame - 30 - i * 12, fps, config: { stiffness: 200, damping: 15 } });

  return (
    <AbsoluteFill
      style={{
        fontFamily: "Arial, sans-serif",
        background: `linear-gradient(160deg, #0f172a 0%, #1e3a8a 60%, ${NAVY} 100%)`,
        padding: 48,
        flexDirection: "column",
        justifyContent: "center",
        gap: 24,
      }}
    >
      {/* Avatar */}
      <div style={{ opacity: fadeIn(frame, 0, 15), display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: "50%",
            background: "#1d4ed8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            fontWeight: 900,
            color: WHITE,
            border: "3px solid rgba(255,255,255,0.3)",
          }}
        >
          SL
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: WHITE }}>Sophie L.</div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.65)" }}>
            Electricienne independante · Bordeaux
          </div>
        </div>
      </div>

      {/* Stars */}
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{ transform: `scale(${Math.min(1, starScale(i))})`, fontSize: 36, color: "#fbbf24" }}
          >
            ★
          </div>
        ))}
      </div>

      {/* Quote */}
      <div
        style={{
          opacity: fadeIn(frame, 60, 20),
          fontSize: 21,
          color: WHITE,
          lineHeight: 1.65,
          fontStyle: "italic",
          background: "rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: "20px 24px",
          borderLeft: `4px solid ${ORANGE}`,
        }}
      >
        "
        {frame > 65
          ? typewriter(
              frame,
              65,
              "Mes clients recoivent un devis PDF pro en 2 minutes. Mon taux de signature est passe de 35% a 68% depuis DevisFlow.",
              14
            )
          : ""}
        "
      </div>

      {/* Stats */}
      <div style={{ opacity: fadeIn(frame, 150, 15), display: "flex", gap: 16 }}>
        {[
          { v: "+68%", l: "taux signature" },
          { v: "-2h", l: "par devis" },
        ].map((s) => (
          <div
            key={s.l}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.12)",
              borderRadius: 14,
              padding: "14px 18px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 30, fontWeight: 900, color: ORANGE }}>{s.v}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        style={{
          opacity: fadeIn(frame, 185, 15),
          background: ORANGE,
          borderRadius: 14,
          padding: "16px 28px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 900, color: WHITE }}>
          Essaie gratuitement → devis-flow.fr
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── COMP 2 : Story04JeanPierre (9:16, 1080x1920, 225f=7.5s) ─────────────────

export function Story04JeanPierre() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const starScale = (i: number) =>
    spring({ frame: frame - 30 - i * 12, fps, config: { stiffness: 200, damping: 15 } });

  return (
    <AbsoluteFill
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#faf9f7",
        padding: 48,
        flexDirection: "column",
        justifyContent: "center",
        gap: 24,
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          opacity: fadeIn(frame, 0, 10),
          height: 6,
          background: `linear-gradient(90deg, ${NAVY}, ${ORANGE})`,
          borderRadius: 4,
          marginBottom: 8,
        }}
      />

      {/* Avatar */}
      <div style={{ opacity: fadeIn(frame, 0, 15), display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: "50%",
            background: NAVY,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 900,
            color: WHITE,
            border: `3px solid ${ORANGE}`,
          }}
        >
          JPM
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: NAVY }}>Jean-Pierre M.</div>
          <div style={{ fontSize: 16, color: "#6b7280" }}>Peintre independant · Marseille</div>
        </div>
      </div>

      {/* Stars */}
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{ transform: `scale(${Math.min(1, starScale(i))})`, fontSize: 36, color: "#fbbf24" }}
          >
            ★
          </div>
        ))}
      </div>

      {/* Quote */}
      <div
        style={{
          opacity: fadeIn(frame, 60, 20),
          fontSize: 21,
          color: NAVY,
          lineHeight: 1.65,
          fontStyle: "italic",
          background: "#f0f4ff",
          borderRadius: 16,
          padding: "20px 24px",
          borderLeft: `4px solid ${ORANGE}`,
        }}
      >
        "
        {frame > 65
          ? typewriter(
              frame,
              65,
              "Je cree mes devis depuis le chantier sur mon telephone. En 30 secondes c'est envoye. Mes concurrents galérent encore avec Excel.",
              14
            )
          : ""}
        "
      </div>

      {/* Stats */}
      <div style={{ opacity: fadeIn(frame, 150, 15), display: "flex", gap: 16 }}>
        {[
          { v: "30 sec", l: "par devis" },
          { v: "5 etoiles", l: "avis clients" },
        ].map((s) => (
          <div
            key={s.l}
            style={{
              flex: 1,
              background: NAVY,
              borderRadius: 14,
              padding: "14px 18px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 900, color: ORANGE }}>{s.v}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        style={{
          opacity: fadeIn(frame, 185, 15),
          background: ORANGE,
          borderRadius: 14,
          padding: "16px 28px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 900, color: WHITE }}>
          Essaie gratuitement → devis-flow.fr
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── COMP 3 : Reel03Demo30sec (9:16, 1080x1920, 540f=18s) ────────────────────

export function Reel03Demo30sec() {
  const frame = useCurrentFrame();

  // Timer display
  const timerSeconds = Math.min(26, Math.floor(interpolate(frame, [30, 390], [0, 26], { extrapolateRight: "clamp", extrapolateLeft: "clamp" })));

  // Progress bar for IA generation (frame 120-270)
  const iaProgress = interpolate(frame, [120, 270], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Confetti dots
  const confettiColors = [ORANGE, "#fbbf24", "#22c55e", "#3b82f6", "#ec4899", WHITE];
  const confettiDots = Array.from({ length: 30 }, (_, i) => ({
    x: (i * 137.5) % 1080,
    startY: -60,
    endY: 1980,
    color: confettiColors[i % confettiColors.length],
    delay: 390 + (i % 15) * 3,
    size: 10 + (i % 4) * 5,
  }));

  const fields = [
    { label: "Nom artisan", value: "Jean Dupont Peinture", delay: 30 },
    { label: "Client", value: "M. Leclerc — 45 rue Gambetta", delay: 55 },
    { label: "Description travaux", value: "Peinture salon + couloir, 2 couches", delay: 80 },
    { label: "Materiaux", value: "Peinture acrylique premium 20L", delay: 100 },
    { label: "Main d oeuvre", value: "8h × 45€/h = 360€", delay: 115 },
  ];

  return (
    <AbsoluteFill style={{ fontFamily: "Arial, sans-serif" }}>
      <Audio src={staticFile("music.mp3")} volume={0.1} />
      {/* Scene 1 : DÉFI + timer start (0-30f) */}
      <Sequence from={0} durationInFrames={30}>
        <AbsoluteFill
          style={{
            background: "#000000",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              opacity: fadeIn(frame, 0, 10),
              fontSize: 96,
              fontWeight: 900,
              color: ORANGE,
              textAlign: "center",
              letterSpacing: -2,
            }}
          >
            DEFI
          </div>
          <div
            style={{
              opacity: fadeIn(frame, 5, 10),
              fontSize: 40,
              color: WHITE,
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            Creer un devis en 30 secondes en direct
          </div>
          <div
            style={{
              opacity: fadeIn(frame, 10, 10),
              fontSize: 28,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Chrono en marche...
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2 : Formulaire (30-120f) */}
      <Sequence from={30} durationInFrames={90}>
        <AbsoluteFill
          style={{
            background: WHITE,
            padding: 44,
            flexDirection: "column",
            justifyContent: "flex-start",
            paddingTop: 60,
          }}
        >
          {/* Timer badge */}
          <div
            style={{
              position: "absolute",
              top: 32,
              right: 40,
              background: ORANGE,
              borderRadius: 12,
              padding: "8px 18px",
              fontSize: 28,
              fontWeight: 900,
              color: WHITE,
            }}
          >
            {timerSeconds}s
          </div>

          <div style={{ fontSize: 24, fontWeight: 900, color: NAVY, marginBottom: 28 }}>
            DevisFlow — Nouveau devis
          </div>

          {fields.map((f) => (
            <div
              key={f.label}
              style={{
                opacity: fadeIn(frame - 30, f.delay - 30, 8),
                marginBottom: 18,
              }}
            >
              <div style={{ fontSize: 13, color: "#9ca3af", fontWeight: 600, marginBottom: 4 }}>
                {f.label}
              </div>
              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: 10,
                  padding: "12px 16px",
                  fontSize: 16,
                  color: NAVY,
                  fontWeight: 600,
                  border: "2px solid #e5e7eb",
                }}
              >
                {frame - 30 > f.delay - 25
                  ? typewriter(frame - 30, f.delay - 28, f.value, 40)
                  : ""}
              </div>
            </div>
          ))}
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3 : IA génération (120-270f) */}
      <Sequence from={120} durationInFrames={150}>
        <AbsoluteFill
          style={{
            background: NAVY,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 28,
          }}
        >
          {/* Timer badge */}
          <div
            style={{
              position: "absolute",
              top: 60,
              right: 60,
              background: ORANGE,
              borderRadius: 12,
              padding: "8px 18px",
              fontSize: 28,
              fontWeight: 900,
              color: WHITE,
            }}
          >
            {timerSeconds}s
          </div>

          {/* Spinner */}
          <div
            style={{
              width: 80,
              height: 80,
              border: `6px solid rgba(255,255,255,0.2)`,
              borderTop: `6px solid ${ORANGE}`,
              borderRadius: "50%",
              transform: `rotate(${frame * 8}deg)`,
            }}
          />

          <div style={{ fontSize: 28, fontWeight: 900, color: WHITE, textAlign: "center" }}>
            Generation IA en cours...
          </div>

          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
            Analyse du devis · Calcul des marges · PDF
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: 600,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 100,
              height: 18,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${iaProgress * 100}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${ORANGE}, #fbbf24)`,
                borderRadius: 100,
                transition: "width 0.1s",
              }}
            />
          </div>

          <div style={{ fontSize: 18, color: ORANGE, fontWeight: 700 }}>
            {Math.round(iaProgress * 100)}%
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4 : Preview PDF (270-390f) */}
      <Sequence from={270} durationInFrames={120}>
        <AbsoluteFill
          style={{
            background: "#f9fafb",
            padding: 48,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* PDF Preview card */}
          <div
            style={{
              opacity: fadeIn(frame - 270, 0, 20),
              transform: `scale(${interpolate(frame - 270, [0, 20], [0.8, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" })})`,
              background: WHITE,
              borderRadius: 20,
              padding: 32,
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
              border: `2px solid #e5e7eb`,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: NAVY,
                marginBottom: 8,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>DEVIS #2024-089</span>
              <span style={{ color: "#9ca3af", fontSize: 13 }}>26 sec</span>
            </div>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>
              Jean Dupont Peinture → M. Leclerc
            </div>
            {[
              { item: "Peinture acrylique 20L", prix: "180,00 €" },
              { item: "Main d oeuvre 8h × 45€", prix: "360,00 €" },
              { item: "Deplacements", prix: "30,00 €" },
            ].map((l) => (
              <div
                key={l.item}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #f3f4f6",
                  fontSize: 14,
                  color: NAVY,
                }}
              >
                <span>{l.item}</span>
                <span style={{ fontWeight: 700, color: ORANGE }}>{l.prix}</span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 12,
                padding: "12px 16px",
                background: NAVY,
                borderRadius: 10,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 900, color: WHITE }}>Total TTC</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: ORANGE }}>570,00 €</span>
            </div>
          </div>

          {/* Badge succès */}
          <div
            style={{
              opacity: fadeIn(frame - 270, 40, 15),
              background: "#16a34a",
              borderRadius: 16,
              padding: "16px 32px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 900, color: WHITE }}>
              Genere en 26 secondes
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5 : Confetti + DÉFI RÉUSSI (390-480f) */}
      <Sequence from={390} durationInFrames={90}>
        <AbsoluteFill
          style={{
            background: "#000000",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Confetti dots */}
          {confettiDots.map((dot, i) => {
            const localF = frame - 390;
            const yProgress = interpolate(localF, [dot.delay - 390, dot.delay - 390 + 60], [0, 1], {
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: dot.x,
                  top: interpolate(yProgress, [0, 1], [dot.startY, dot.endY]),
                  width: dot.size,
                  height: dot.size,
                  borderRadius: "50%",
                  background: dot.color,
                  opacity: fadeIn(localF, dot.delay - 390, 5),
                }}
              />
            );
          })}

          <div
            style={{
              opacity: fadeIn(frame - 390, 5, 15),
              fontSize: 72,
              fontWeight: 900,
              color: ORANGE,
              textAlign: "center",
              zIndex: 2,
            }}
          >
            DEFI REUSSI
          </div>
          <div
            style={{
              opacity: fadeIn(frame - 390, 20, 15),
              fontSize: 40,
              color: WHITE,
              fontWeight: 700,
              textAlign: "center",
              zIndex: 2,
            }}
          >
            en 26 secondes
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 6 : CTA (480-540f) */}
      <Sequence from={480} durationInFrames={60}>
        <AbsoluteFill
          style={{
            background: NAVY,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              opacity: fadeIn(frame - 480, 0, 15),
              fontSize: 52,
              fontWeight: 900,
              color: WHITE,
              textAlign: "center",
            }}
          >
            Devis<span style={{ color: ORANGE }}>Flow</span>
          </div>
          <div
            style={{
              opacity: fadeIn(frame - 480, 10, 15),
              background: ORANGE,
              borderRadius: 16,
              padding: "18px 40px",
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 900, color: WHITE }}>
              Essaie maintenant → devis-flow.fr
            </span>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
}

// ── COMP 4 : Reel04Reglementation (9:16, 1080x1920, 450f=15s) ───────────────

export function Reel04Reglementation() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = interpolate(frame % 30, [0, 15, 30], [1, 1.06, 1]);

  const timelineItems = [
    { year: "2024", label: "Grandes entreprises", done: true, delay: 60 },
    { year: "2025", label: "ETI (500+ salaries)", done: true, delay: 90 },
    { year: "2026", label: "TOUTES les entreprises", done: false, delay: 120, highlight: true },
  ];

  const obligations = [
    { ok: false, text: "Logiciel non conforme : amende possible" },
    { ok: true, text: "DevisFlow : Factur-X natif, deja conforme" },
  ];

  const badgeScale = spring({
    frame: frame - 305,
    fps,
    config: { stiffness: 150, damping: 12 },
  });

  return (
    <AbsoluteFill style={{ fontFamily: "Arial, sans-serif" }}>
      <Audio src={staticFile("music.mp3")} volume={0.1} />
      {/* Scene 1 : Titre alarmant (0-45f) */}
      <Sequence from={0} durationInFrames={45}>
        <AbsoluteFill
          style={{
            background: "#0a0a0a",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 20,
            padding: 48,
          }}
        >
          {/* Scan line effect */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: ORANGE,
              transform: `translateY(${interpolate(frame, [0, 44], [0, 1920], { extrapolateRight: "clamp" })}px)`,
              opacity: 0.6,
            }}
          />
          <div
            style={{
              opacity: fadeIn(frame, 0, 12),
              fontSize: 22,
              color: "#ef4444",
              fontWeight: 700,
              textAlign: "center",
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            INFORMATION OBLIGATOIRE
          </div>
          <div
            style={{
              opacity: fadeIn(frame, 8, 15),
              fontSize: 36,
              fontWeight: 900,
              color: WHITE,
              textAlign: "center",
              lineHeight: 1.25,
            }}
          >
            Ce que tous les artisans doivent savoir avant{" "}
            <span style={{ color: ORANGE }}>septembre 2026</span>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2 : Timeline (45-180f) */}
      <Sequence from={45} durationInFrames={135}>
        <AbsoluteFill
          style={{
            background: "#111827",
            padding: 52,
            flexDirection: "column",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <div style={{ opacity: fadeIn(frame - 45, 0, 12), fontSize: 26, fontWeight: 900, color: WHITE, marginBottom: 12 }}>
            Calendrier e-facture
          </div>
          {timelineItems.map((item, idx) => {
            const lf = frame - 45;
            return (
              <div
                key={item.year}
                style={{
                  opacity: fadeIn(lf, item.delay - 45, 15),
                  transform: `translateX(${interpolate(lf, [item.delay - 45, item.delay - 30], [-40, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" })}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  background: item.highlight ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.05)",
                  borderRadius: 16,
                  padding: "20px 24px",
                  border: item.highlight ? `2px solid ${ORANGE}` : "2px solid transparent",
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 14,
                    background: item.done ? "#16a34a" : ORANGE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 900,
                    color: WHITE,
                    flexShrink: 0,
                  }}
                >
                  {item.year}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: item.highlight ? ORANGE : WHITE }}>
                    {item.label}
                  </div>
                  {item.done && (
                    <div style={{ fontSize: 14, color: "#16a34a", marginTop: 2 }}>Obligation en vigueur</div>
                  )}
                  {item.highlight && (
                    <div
                      style={{
                        fontSize: 14,
                        color: ORANGE,
                        marginTop: 2,
                        transform: `scale(${pulse})`,
                        transformOrigin: "left center",
                        display: "inline-block",
                      }}
                    >
                      Vous etes ici
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 28 }}>{item.done ? "✓" : "←"}</div>
              </div>
            );
          })}
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3 : Etes-vous prêt ? (180-300f) */}
      <Sequence from={180} durationInFrames={120}>
        <AbsoluteFill
          style={{
            background: "#0f172a",
            padding: 52,
            flexDirection: "column",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <div style={{ opacity: fadeIn(frame - 180, 0, 15), fontSize: 34, fontWeight: 900, color: WHITE, textAlign: "center" }}>
            Etes-vous pret ?
          </div>
          {obligations.map((o, i) => (
            <div
              key={i}
              style={{
                opacity: fadeIn(frame - 180, 30 + i * 25, 15),
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: o.ok ? "rgba(22,163,74,0.15)" : "rgba(239,68,68,0.15)",
                borderRadius: 16,
                padding: "20px 24px",
                border: `2px solid ${o.ok ? "#16a34a" : "#ef4444"}`,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: o.ok ? "#16a34a" : "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  color: WHITE,
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                {o.ok ? "✓" : "✗"}
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: WHITE, lineHeight: 1.4 }}>{o.text}</div>
            </div>
          ))}
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4 : Badge certifié (300-390f) */}
      <Sequence from={300} durationInFrames={90}>
        <AbsoluteFill
          style={{
            background: NAVY,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              transform: `scale(${Math.min(1, badgeScale)})`,
              background: "rgba(255,255,255,0.08)",
              border: `4px solid ${ORANGE}`,
              borderRadius: 24,
              padding: "40px 60px",
              textAlign: "center",
              gap: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 56 }}>✅</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: WHITE, letterSpacing: 1 }}>
              CERTIFIE E-FACTURE
            </div>
            <div style={{ fontSize: 40, fontWeight: 900, color: ORANGE }}>2026</div>
            <div style={{ fontSize: 16, color: "rgba(255,255,255,0.65)" }}>Factur-X · Conforme</div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5 : CTA urgent (390-450f) */}
      <Sequence from={390} durationInFrames={60}>
        <AbsoluteFill
          style={{
            background: "#7f1d1d",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 20,
            padding: 48,
          }}
        >
          <div style={{ opacity: fadeIn(frame - 390, 0, 12), fontSize: 30, fontWeight: 900, color: WHITE, textAlign: "center" }}>
            Mettez-vous en conformite
          </div>
          <div
            style={{
              opacity: fadeIn(frame - 390, 10, 15),
              background: ORANGE,
              borderRadius: 16,
              padding: "20px 44px",
              transform: `scale(${pulse})`,
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 900, color: WHITE }}>
              devis-flow.fr
            </span>
          </div>
          <div style={{ opacity: fadeIn(frame - 390, 20, 15), fontSize: 18, color: "rgba(255,255,255,0.75)", textAlign: "center" }}>
            Essai 7 jours gratuit · Aucun engagement
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
}

// ── COMP 5 : Reel05Temoignage (9:16, 1080x1920, 480f=16s) ───────────────────

export function Reel05Temoignage() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const starRating = (n: number, startF: number) =>
    [0, 1, 2, 3, 4].map((i) => (
      <div
        key={i}
        style={{
          fontSize: 30,
          color: i < n ? "#fbbf24" : "rgba(255,255,255,0.2)",
          transform: `scale(${Math.min(1, spring({ frame: frame - startF - i * 8, fps, config: { stiffness: 200, damping: 14 } }))})`,
        }}
      >
        ★
      </div>
    ));

  return (
    <AbsoluteFill style={{ fontFamily: "Arial, sans-serif" }}>
      <Audio src={staticFile("music.mp3")} volume={0.1} />
      {/* Scene 1 : POV titre (0-30f) */}
      <Sequence from={0} durationInFrames={30}>
        <AbsoluteFill
          style={{
            background: "#1a1a1a",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 14,
            padding: 48,
          }}
        >
          <div style={{ opacity: fadeIn(frame, 0, 10), fontSize: 20, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: 2 }}>
            POV :
          </div>
          <div style={{ opacity: fadeIn(frame, 5, 12), fontSize: 32, fontWeight: 900, color: WHITE, textAlign: "center", lineHeight: 1.3 }}>
            tu testes DevisFlow pendant{" "}
            <span style={{ color: ORANGE }}>7 jours</span>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2 : Jour 1 (30-120f) */}
      <Sequence from={30} durationInFrames={90}>
        <AbsoluteFill
          style={{
            background: "#f0f9ff",
            padding: 48,
            flexDirection: "column",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <div style={{ opacity: fadeIn(frame - 30, 0, 10), fontSize: 18, color: ORANGE, fontWeight: 900, letterSpacing: 2 }}>
            JOUR 1
          </div>
          <div style={{ opacity: fadeIn(frame - 30, 10, 15), fontSize: 30, fontWeight: 900, color: NAVY, lineHeight: 1.3 }}>
            Premier devis cree
          </div>
          <div
            style={{
              opacity: fadeIn(frame - 30, 20, 15),
              background: WHITE,
              borderRadius: 16,
              padding: "20px 24px",
              border: `2px solid #e5e7eb`,
            }}
          >
            <div style={{ fontSize: 14, color: "#9ca3af", marginBottom: 8 }}>Temps de creation</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: "#16a34a" }}>28 sec</div>
            <div style={{ fontSize: 16, color: "#6b7280", marginTop: 4 }}>vs. 2h avec Excel avant</div>
          </div>
          <div
            style={{
              opacity: fadeIn(frame - 30, 50, 15),
              background: NAVY,
              borderRadius: 14,
              padding: "16px 20px",
              fontSize: 18,
              color: WHITE,
              fontStyle: "italic",
              lineHeight: 1.5,
            }}
          >
            "C'est vraiment aussi rapide qu'ils le disent !"
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3 : Jour 3 (120-210f) */}
      <Sequence from={120} durationInFrames={90}>
        <AbsoluteFill
          style={{
            background: "#f0fdf4",
            padding: 48,
            flexDirection: "column",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <div style={{ opacity: fadeIn(frame - 120, 0, 10), fontSize: 18, color: "#16a34a", fontWeight: 900, letterSpacing: 2 }}>
            JOUR 3
          </div>
          <div style={{ opacity: fadeIn(frame - 120, 10, 15), fontSize: 28, fontWeight: 900, color: NAVY, lineHeight: 1.3 }}>
            Premier client qui signe en ligne
          </div>
          <div
            style={{
              opacity: fadeIn(frame - 120, 25, 15),
              background: "#16a34a",
              borderRadius: 16,
              padding: "24px 28px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 900, color: WHITE }}>SIGNE ✓</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: WHITE, marginTop: 4 }}>1 250 €</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>
              Depuis son telephone · 14h37
            </div>
          </div>
          <div
            style={{
              opacity: fadeIn(frame - 120, 55, 15),
              fontSize: 18,
              color: NAVY,
              fontStyle: "italic",
              lineHeight: 1.5,
            }}
          >
            "Mon client a signe depuis son iPhone pendant sa pause dejeuner."
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4 : Jour 7 Dashboard (210-330f) */}
      <Sequence from={210} durationInFrames={120}>
        <AbsoluteFill
          style={{
            background: NAVY,
            padding: 48,
            flexDirection: "column",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <div style={{ opacity: fadeIn(frame - 210, 0, 10), fontSize: 18, color: ORANGE, fontWeight: 900, letterSpacing: 2 }}>
            JOUR 7 — Dashboard
          </div>
          <div style={{ opacity: fadeIn(frame - 210, 10, 15), fontSize: 28, fontWeight: 900, color: WHITE }}>
            Resultats apres 7 jours
          </div>
          {[
            { v: "8", l: "Devis crees", delay: 25, color: WHITE },
            { v: "6", l: "Devis signes (75%)", delay: 45, color: "#16a34a" },
            { v: "4 560 €", l: "CA genere", delay: 65, color: ORANGE },
          ].map((s) => (
            <div
              key={s.l}
              style={{
                opacity: fadeIn(frame - 210, s.delay, 15),
                transform: `translateX(${interpolate(frame - 210, [s.delay, s.delay + 15], [-30, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" })}px)`,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: "18px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 18, color: "rgba(255,255,255,0.75)" }}>{s.l}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: s.color }}>{s.v}</div>
            </div>
          ))}
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5 : Verdict (330-420f) */}
      <Sequence from={330} durationInFrames={90}>
        <AbsoluteFill
          style={{
            background: "#fafafa",
            padding: 48,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div style={{ opacity: fadeIn(frame - 330, 0, 12), fontSize: 28, fontWeight: 900, color: NAVY }}>
            Verdict apres 7 jours
          </div>
          <div style={{ display: "flex", gap: 6 }}>{starRating(5, 335)}</div>
          <div
            style={{
              opacity: fadeIn(frame - 330, 30, 15),
              background: NAVY,
              borderRadius: 16,
              padding: "24px 32px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 900, color: ORANGE, marginBottom: 8 }}>
              10/10 Recommande
            </div>
            <div style={{ fontSize: 17, color: WHITE, lineHeight: 1.6 }}>
              "Plus jamais sans. En 7 jours j'ai recupere 4 560€ de chantiers. L'IA fait vraiment le travail."
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 6 : CTA (420-480f) */}
      <Sequence from={420} durationInFrames={60}>
        <AbsoluteFill
          style={{
            background: NAVY,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ opacity: fadeIn(frame - 420, 0, 12), fontSize: 26, fontWeight: 900, color: WHITE, textAlign: "center" }}>
            Commencez votre essai
          </div>
          <div
            style={{
              opacity: fadeIn(frame - 420, 10, 15),
              background: ORANGE,
              borderRadius: 16,
              padding: "20px 44px",
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 900, color: WHITE }}>
              devis-flow.fr
            </span>
          </div>
          <div style={{ opacity: fadeIn(frame - 420, 20, 15), fontSize: 16, color: "rgba(255,255,255,0.6)" }}>
            7 jours gratuits · Aucune CB requise
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
}

// ── COMP 5bis : Reel06Coulisses (9:16, 1080x1920, 450f=15s) ─────────────────

export function Reel06Coulisses() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ fontFamily: "Arial, sans-serif" }}>
      <Audio src={staticFile("music.mp3")} volume={0.1} />

      {/* Scene 1 : Hook question (0-90f) */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill
          style={{
            background: "#1a1a1a",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 16,
            padding: 56,
          }}
        >
          <div style={{ opacity: fadeIn(frame, 0, 12), fontSize: 20, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: 2, textAlign: "center" }}>
            ON NOUS LE DEMANDE SOUVENT
          </div>
          <div style={{ opacity: fadeIn(frame, 8, 15), fontSize: 34, fontWeight: 900, color: WHITE, textAlign: "center", lineHeight: 1.35 }}>
            Qui y a-t-il vraiment{" "}
            <span style={{ color: ORANGE }}>derriere DevisFlow</span> ?
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2 : Pourquoi le produit existe (90-210f) */}
      <Sequence from={90} durationInFrames={120}>
        <AbsoluteFill
          style={{
            background: NAVY,
            padding: 52,
            flexDirection: "column",
            justifyContent: "center",
            gap: 22,
          }}
        >
          <div style={{ opacity: fadeIn(frame - 90, 0, 12), fontSize: 18, color: ORANGE, fontWeight: 900, letterSpacing: 2 }}>
            POURQUOI DEVISFLOW EXISTE
          </div>
          <div style={{ opacity: fadeIn(frame - 90, 12, 15), fontSize: 27, fontWeight: 900, color: WHITE, lineHeight: 1.4 }}>
            On a vu trop de soirs a refaire des devis sur la table de la cuisine
          </div>
          <div
            style={{
              opacity: fadeIn(frame - 90, 45, 15),
              background: "rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: "20px 24px",
              fontSize: 17,
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.6,
            }}
          >
            Pas pour remplacer l'artisan — pour lui rendre ses soirees.
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3 : Humain derriere (210-330f) */}
      <Sequence from={210} durationInFrames={120}>
        <AbsoluteFill
          style={{
            background: "#f0f9ff",
            padding: 52,
            flexDirection: "column",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <div style={{ opacity: fadeIn(frame - 210, 0, 12), fontSize: 18, color: NAVY, fontWeight: 900, letterSpacing: 2 }}>
            QUAND VOUS NOUS ECRIVEZ
          </div>
          <div style={{ opacity: fadeIn(frame - 210, 12, 15), fontSize: 27, fontWeight: 900, color: NAVY, lineHeight: 1.4 }}>
            C'est nous qui repondons. Pas un bot.
          </div>
          <div
            style={{
              opacity: fadeIn(frame - 210, 45, 15),
              background: WHITE,
              borderRadius: 16,
              padding: "20px 24px",
              border: "2px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                background: ORANGE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 900,
                color: WHITE,
                flexShrink: 0,
              }}
            >
              DF
            </div>
            <div>
              <div style={{ fontSize: 15, color: "#6b7280" }}>Reponse a vos emails</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#16a34a" }}>sous 24h</div>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4 : CTA (330-450f) */}
      <Sequence from={330} durationInFrames={120}>
        <AbsoluteFill
          style={{
            background: NAVY,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ opacity: fadeIn(frame - 330, 0, 12), fontSize: 26, fontWeight: 900, color: WHITE, textAlign: "center", padding: "0 24px" }}>
            Un outil pense par des gens du BTP
          </div>
          <div
            style={{
              opacity: fadeIn(frame - 330, 15, 15),
              background: ORANGE,
              borderRadius: 16,
              padding: "20px 44px",
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 900, color: WHITE }}>
              devis-flow.fr
            </span>
          </div>
          <div style={{ opacity: fadeIn(frame - 330, 25, 15), fontSize: 16, color: "rgba(255,255,255,0.6)" }}>
            7 jours gratuits · Aucune CB requise
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
}

// ── COMP 6 : CarouselTemoignages (16:9, 1080x608, 750f) ─────────────────────

const TEMOIGNAGES = [
  {
    initials: "MB",
    name: "Mohamed B.",
    role: "Plombier independant · Lyon",
    quote: "5 chantiers de plus ce mois. Je cree mes devis depuis le chantier en moins de 2 minutes.",
    stats: [{ v: "+5", l: "chantiers/mois" }, { v: "−3h", l: "par devis" }],
    avatarBg: ORANGE,
    bg: NAVY,
    textColor: WHITE,
  },
  {
    initials: "SL",
    name: "Sophie L.",
    role: "Electricienne · Bordeaux",
    quote: "Taux de signature passe de 35% a 68%. Mes clients recoivent un PDF pro en 2 minutes.",
    stats: [{ v: "+68%", l: "signature" }, { v: "−2h", l: "par devis" }],
    avatarBg: "#1d4ed8",
    bg: WHITE,
    textColor: NAVY,
  },
  {
    initials: "JPM",
    name: "Jean-Pierre M.",
    role: "Peintre · Marseille",
    quote: "30 secondes depuis le chantier. Mes concurrents galérent encore avec Excel.",
    stats: [{ v: "30 sec", l: "par devis" }, { v: "5 ★", l: "avis clients" }],
    avatarBg: NAVY,
    bg: "#fff7ed",
    textColor: NAVY,
  },
  {
    initials: "KD",
    name: "Karim D.",
    role: "Macon · Paris",
    quote: "Mes devis sont pro du premier coup. Plus de fautes, plus d'oublis. Les clients font confiance.",
    stats: [{ v: "100%", l: "devis pro" }, { v: "+40%", l: "taux acceptation" }],
    avatarBg: "#059669",
    bg: NAVY,
    textColor: WHITE,
  },
  {
    initials: "AT",
    name: "Amelie T.",
    role: "Cabinet comptable · Nantes",
    quote: "Gerer 12 artisans depuis 1 dashboard. Gain de temps colossal pour toute notre equipe.",
    stats: [{ v: "12", l: "artisans geres" }, { v: "×3", l: "productivite" }],
    avatarBg: ORANGE,
    bg: WHITE,
    textColor: NAVY,
  },
];

export function CarouselTemoignages() {
  const frame = useCurrentFrame();
  const slideIndex = Math.min(4, Math.floor(frame / 150));
  const localFrame = frame % 150;
  const t = TEMOIGNAGES[slideIndex];
  const { fps } = useVideoConfig();

  const starScale = (i: number) =>
    Math.min(1, spring({ frame: localFrame - 25 - i * 8, fps, config: { stiffness: 200, damping: 14 } }));

  const isLight = t.bg === WHITE || t.bg === "#fff7ed";

  return (
    <AbsoluteFill
      style={{
        fontFamily: "Arial, sans-serif",
        background: t.bg,
        padding: 52,
        flexDirection: "column",
        justifyContent: "center",
        gap: 20,
      }}
    >
      {/* Slide indicator */}
      <div style={{ position: "absolute", top: 28, right: 48, display: "flex", gap: 6 }}>
        {TEMOIGNAGES.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === slideIndex ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === slideIndex ? ORANGE : (isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.3)"),
              transition: "width 0.2s",
            }}
          />
        ))}
      </div>

      {/* Avatar + Identity */}
      <div style={{ opacity: fadeIn(localFrame, 0, 15), display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: t.avatarBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 900,
            color: WHITE,
            border: `3px solid ${isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.25)"}`,
          }}
        >
          {t.initials}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: t.textColor }}>{t.name}</div>
          <div style={{ fontSize: 14, color: isLight ? "#6b7280" : "rgba(255,255,255,0.6)" }}>{t.role}</div>
        </div>
      </div>

      {/* Stars */}
      <div style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ transform: `scale(${starScale(i)})`, fontSize: 26, color: "#fbbf24" }}>
            ★
          </div>
        ))}
      </div>

      {/* Quote */}
      <div
        style={{
          opacity: fadeIn(localFrame, 50, 20),
          fontSize: 19,
          color: t.textColor,
          lineHeight: 1.65,
          fontStyle: "italic",
          borderLeft: `4px solid ${ORANGE}`,
          paddingLeft: 20,
        }}
      >
        "{t.quote}"
      </div>

      {/* Stats */}
      <div style={{ opacity: fadeIn(localFrame, 90, 15), display: "flex", gap: 16 }}>
        {t.stats.map((s) => (
          <div
            key={s.l}
            style={{
              flex: 1,
              background: isLight ? NAVY : "rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: "12px 16px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 900, color: ORANGE }}>{s.v}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Brand */}
      <div style={{ opacity: fadeIn(localFrame, 110, 15), fontSize: 16, color: isLight ? "#9ca3af" : "rgba(255,255,255,0.4)", textAlign: "right" }}>
        devis-flow.fr
      </div>
    </AbsoluteFill>
  );
}

// ── COMP 7 : ReelComparateur (9:16, 1080x1920, 360f=12s) ────────────────────

const COMPARE_ROWS = [
  { label: "Temps de creation", df: "30 sec", excel: "2h", other: "45 min", dfOk: true, excelOk: false, otherOk: null },
  { label: "Mobile", df: "Oui", excel: "Non", other: "Partiel", dfOk: true, excelOk: false, otherOk: null },
  { label: "IA integree", df: "Oui", excel: "Non", other: "Non", dfOk: true, excelOk: false, otherOk: false },
  { label: "Conformite 2026", df: "Oui", excel: "Non", other: "Partiel", dfOk: true, excelOk: false, otherOk: null },
  { label: "Prix mensuel", df: "29 €/mois", excel: "Gratuit", other: "79 €/mois", dfOk: true, excelOk: null, otherOk: false },
];

function CellIcon({ ok }: { ok: boolean | null }) {
  if (ok === true) return <span style={{ color: "#16a34a", fontSize: 22 }}>✓</span>;
  if (ok === false) return <span style={{ color: "#ef4444", fontSize: 22 }}>✗</span>;
  return <span style={{ color: "#f59e0b", fontSize: 22 }}>~</span>;
}

export function ReelComparateur() {
  const frame = useCurrentFrame();
  const totalRows = COMPARE_ROWS.length;

  return (
    <AbsoluteFill style={{ fontFamily: "Arial, sans-serif" }}>
      <Audio src={staticFile("music.mp3")} volume={0.1} />
      {/* Background */}
      <AbsoluteFill style={{ background: "#0f172a" }} />

      {/* Header */}
      <div style={{ opacity: fadeIn(frame, 0, 20), position: "absolute", top: 80, left: 0, right: 0, padding: "0 40px" }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: WHITE, textAlign: "center", lineHeight: 1.3 }}>
          DevisFlow vs Excel vs{"\n"}Logiciel concurrent
        </div>
        <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: 8 }}>
          Comparatif objectif
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 40,
          right: 40,
          bottom: 120,
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* Column headers */}
        <div
          style={{
            opacity: fadeIn(frame, 15, 15),
            display: "flex",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <div style={{ flex: 2 }} />
          {[
            { label: "DevisFlow", highlight: true },
            { label: "Excel", highlight: false },
            { label: "Concurrent", highlight: false },
          ].map((col) => (
            <div
              key={col.label}
              style={{
                flex: 1.5,
                textAlign: "center",
                fontSize: 14,
                fontWeight: 900,
                color: col.highlight ? ORANGE : "rgba(255,255,255,0.5)",
                padding: "8px 4px",
                background: col.highlight ? "rgba(249,115,22,0.15)" : "transparent",
                borderRadius: "10px 10px 0 0",
                border: col.highlight ? `2px solid ${ORANGE}` : "none",
                borderBottom: "none",
              }}
            >
              {col.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {COMPARE_ROWS.map((row, idx) => {
          const rowAppear = 30 + idx * 40;
          return (
            <div
              key={row.label}
              style={{
                opacity: fadeIn(frame, rowAppear, 15),
                transform: `translateY(${slideUp(frame, rowAppear, 15)}px)`,
                display: "flex",
                gap: 8,
                marginBottom: 6,
              }}
            >
              {/* Label */}
              <div
                style={{
                  flex: 2,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 10,
                  padding: "14px 16px",
                  fontSize: 15,
                  color: WHITE,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {row.label}
              </div>

              {/* DevisFlow */}
              <div
                style={{
                  flex: 1.5,
                  background: "rgba(249,115,22,0.2)",
                  border: `2px solid ${ORANGE}`,
                  borderRadius: 10,
                  padding: "10px 8px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <CellIcon ok={row.dfOk} />
                <div style={{ fontSize: 12, color: ORANGE, fontWeight: 700 }}>{row.df}</div>
              </div>

              {/* Excel */}
              <div
                style={{
                  flex: 1.5,
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 10,
                  padding: "10px 8px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <CellIcon ok={row.excelOk} />
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{row.excel}</div>
              </div>

              {/* Concurrent */}
              <div
                style={{
                  flex: 1.5,
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 10,
                  padding: "10px 8px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <CellIcon ok={row.otherOk} />
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{row.other}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div
        style={{
          opacity: fadeIn(frame, 30 + totalRows * 40 + 20, 20),
          position: "absolute",
          bottom: 60,
          left: 40,
          right: 40,
          background: ORANGE,
          borderRadius: 16,
          padding: "20px 32px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 900, color: WHITE }}>
          Le choix est vite fait → devis-flow.fr
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── COMP 8 : StoryHighlightCover (1:1, 1080x1080, 540f = 6×90f) ─────────────

const HIGHLIGHT_COVERS = [
  { label: "DEMOS", emoji: "📋", bg: NAVY, textColor: WHITE },
  { label: "AVIS", emoji: "⭐", bg: ORANGE, textColor: WHITE },
  { label: "TUTOS", emoji: "📚", bg: "#0d1b2e", textColor: WHITE },
  { label: "2026", emoji: "⚠️", bg: "#7f1d1d", textColor: WHITE },
  { label: "TIPS", emoji: "💡", bg: "#0c3547", textColor: WHITE },
  { label: "OFFRES", emoji: "🎁", bg: "linear-gradient(135deg, #f97316, #dc2626)", textColor: WHITE },
];

export function StoryHighlightCover() {
  const frame = useCurrentFrame();
  const coverIndex = Math.min(5, Math.floor(frame / 90));
  const localFrame = frame % 90;
  const cover = HIGHLIGHT_COVERS[coverIndex];

  return (
    <AbsoluteFill
      style={{
        fontFamily: "Arial, sans-serif",
        background: cover.bg,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Emoji icon */}
      <div
        style={{
          opacity: fadeIn(localFrame, 0, 18),
          transform: `scale(${interpolate(localFrame, [0, 18], [0.5, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" })})`,
          fontSize: 160,
          lineHeight: 1,
        }}
      >
        {cover.emoji}
      </div>

      {/* Label */}
      <div
        style={{
          opacity: fadeIn(localFrame, 12, 15),
          fontSize: 80,
          fontWeight: 900,
          color: cover.textColor,
          letterSpacing: 6,
          textAlign: "center",
        }}
      >
        {cover.label}
      </div>

      {/* DevisFlow brand — bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          opacity: fadeIn(localFrame, 25, 15),
          fontSize: 26,
          fontWeight: 700,
          color: "rgba(255,255,255,0.45)",
          letterSpacing: 1,
        }}
      >
        Devis<span style={{ color: ORANGE }}>Flow</span>
      </div>
    </AbsoluteFill>
  );
}
