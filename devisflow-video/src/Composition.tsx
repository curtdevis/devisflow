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

// ── Helpers ───────────────────────────────────────────────────────────────────

function fadeIn(frame: number, from: number, duration = 20) {
  return interpolate(frame, [from, from + duration], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
}

function slideUp(frame: number, from: number, duration = 20) {
  return interpolate(frame, [from, from + duration], [30, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
}

function typewriter(frame: number, from: number, text: string, charsPerSecond = 20) {
  const fps = 30;
  const chars = Math.floor(((frame - from) / fps) * charsPerSecond);
  return text.slice(0, Math.max(0, chars));
}

// ── Scene 1 — Logo intro (0-90f = 0-3s) ──────────────────────────────────────

function SceneLogo() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { stiffness: 120, damping: 20 } });
  const opacity = fadeIn(frame, 5, 15);

  return (
    <AbsoluteFill style={{ background: NAVY, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ transform: `scale(${scale})`, opacity, fontFamily: "Arial, sans-serif", fontSize: 72, fontWeight: 900, color: WHITE }}>
        Devis<span style={{ color: ORANGE }}>Flow</span>
      </div>
      <div style={{ opacity: fadeIn(frame, 25, 15), fontFamily: "Arial, sans-serif", fontSize: 24, color: "rgba(255,255,255,0.7)", fontWeight: 400 }}>
        Votre devis pro en <span style={{ color: ORANGE, fontWeight: 700 }}>30 secondes</span> avec l'IA
      </div>
    </AbsoluteFill>
  );
}

// ── Scene 2 — Formulaire artisan (90-330f = 3-11s) ───────────────────────────

function FormField({ label, value, frame, startFrame }: { label: string; value: string; frame: number; startFrame: number }) {
  const opacity = fadeIn(frame, startFrame, 12);
  const y = slideUp(frame, startFrame, 12);
  return (
    <div style={{ opacity, transform: `translateY(${y}px)`, marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ background: WHITE, border: "2px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: NAVY, fontWeight: 600, fontFamily: "Arial, sans-serif" }}>
        {frame > startFrame ? typewriter(frame, startFrame + 8, value, 25) : ""}
        {frame > startFrame && frame < startFrame + Math.ceil(value.length / 25 * 30) + 12 && (
          <span style={{ borderRight: `2px solid ${ORANGE}`, marginLeft: 2, animation: "none" }}>|</span>
        )}
      </div>
    </div>
  );
}

function SceneForm() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: "#f9fafb", flexDirection: "row", fontFamily: "Arial, sans-serif" }}>
      {/* Left panel — form */}
      <div style={{ width: "55%", padding: "40px 32px", display: "flex", flexDirection: "column" }}>
        <div style={{ opacity: fadeIn(frame, 0, 15), fontSize: 11, fontWeight: 700, color: ORANGE, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
          Étape 1 / 3
        </div>
        <div style={{ opacity: fadeIn(frame, 5, 15), fontSize: 26, fontWeight: 900, color: NAVY, marginBottom: 24 }}>
          Votre entreprise
        </div>

        <div style={{ background: WHITE, borderRadius: 16, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
          <FormField label="Nom / Entreprise" value="Mohamed Benbrika Plomberie" frame={frame} startFrame={10} />
          <FormField label="SIRET" value="123 456 789 00012" frame={frame} startFrame={40} />
          <FormField label="Téléphone" value="06 12 34 56 78" frame={frame} startFrame={75} />
          <FormField label="Adresse" value="12 rue Pasteur, 69001 Lyon" frame={frame} startFrame={110} />
        </div>

        {/* Continue button */}
        <div style={{ opacity: fadeIn(frame, 160, 15), marginTop: 20 }}>
          <div style={{
            background: ORANGE, color: WHITE, fontWeight: 700, fontSize: 15,
            borderRadius: 12, padding: "14px 28px", display: "inline-block",
            boxShadow: "0 4px 12px rgba(249,115,22,0.4)",
          }}>
            Continuer →
          </div>
        </div>
      </div>

      {/* Right panel — progress indicator */}
      <div style={{ width: "45%", padding: "40px 32px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <div style={{ opacity: fadeIn(frame, 20, 15), textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔧</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: NAVY }}>Plombier</div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>8 prestations rapides disponibles</div>
        </div>
        <div style={{ opacity: fadeIn(frame, 80, 15), marginTop: 32, background: WHITE, borderRadius: 14, padding: 20, width: "100%", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          {["Remplacement robinet — 45€", "Débouchage — 120€", "Chauffe-eau 200L — 450€"].map((item, i) => (
            <div key={item} style={{ opacity: fadeIn(frame, 90 + i * 20, 12), fontSize: 12, color: "#6b7280", padding: "6px 0", borderBottom: i < 2 ? "1px solid #f3f4f6" : "none" }}>
              ⚡ {item}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Scene 3 — Travaux (330-570f = 11-19s) ─────────────────────────────────────

function SceneTravaux() {
  const frame = useCurrentFrame();

  const items = [
    { label: "Remplacement chauffe-eau 200L", price: "450,00 €", qty: "1" },
    { label: "Main d'œuvre — 4h à 55€/h", price: "220,00 €", qty: "4h" },
    { label: "Raccordements et évacuations", price: "80,00 €", qty: "1" },
  ];

  return (
    <AbsoluteFill style={{ background: "#f9fafb", padding: "40px 60px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ opacity: fadeIn(frame, 0, 12), fontSize: 11, fontWeight: 700, color: ORANGE, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
        Étape 3 / 3
      </div>
      <div style={{ opacity: fadeIn(frame, 5, 12), fontSize: 26, fontWeight: 900, color: NAVY, marginBottom: 24 }}>
        Les travaux
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: 1 }}>
          {/* Work description */}
          <div style={{ opacity: fadeIn(frame, 10, 12), background: WHITE, borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Description des travaux</div>
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>
              {frame > 15 ? typewriter(frame, 15, "Remplacement du chauffe-eau électrique 200L. Dépose de l'ancien, fourniture et pose, raccordements eau et électricité, mise en service.", 18) : ""}
            </div>
          </div>

          {/* Prestations rapides */}
          <div style={{ opacity: fadeIn(frame, 60, 12), background: WHITE, borderRadius: 16, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Prestations ajoutées</div>
            {items.map((item, i) => (
              <div key={item.label} style={{
                opacity: fadeIn(frame, 70 + i * 25, 12),
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 12px", borderRadius: 8, marginBottom: 8,
                background: "#f9fafb", border: "1px solid #f0f0f0",
              }}>
                <div style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: ORANGE, fontWeight: 700 }}>{item.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live total */}
        <div style={{ width: 260 }}>
          <div style={{ opacity: fadeIn(frame, 140, 15), background: NAVY, borderRadius: 16, padding: 24, color: WHITE, boxShadow: "0 8px 24px rgba(30,58,95,0.3)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>Estimation</div>
            {[
              { label: "Matériaux HT", value: "530,00 €" },
              { label: "Main d'œuvre HT", value: "220,00 €" },
              { label: "TVA (10%)", value: "75,00 €" },
            ].map((row, i) => (
              <div key={row.label} style={{ opacity: fadeIn(frame, 145 + i * 10, 10), display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8, color: "rgba(255,255,255,0.75)" }}>
                <span>{row.label}</span><span>{row.value}</span>
              </div>
            ))}
            <div style={{ opacity: fadeIn(frame, 175, 15), borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: 12, marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 900 }}>
              <span>Total TTC</span><span style={{ color: ORANGE }}>825,00 €</span>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Scene 4 — IA génère (570-750f = 19-25s) ───────────────────────────────────

function SceneIA() {
  const frame = useCurrentFrame();

  const dots = Math.floor(frame / 10) % 4;
  const scanY = interpolate(frame % 60, [0, 60], [0, 100]);

  const spinAngle = interpolate(frame, [0, 180], [0, 1080]);

  return (
    <AbsoluteFill style={{ background: NAVY, alignItems: "center", justifyContent: "center", fontFamily: "Arial, sans-serif", flexDirection: "column", gap: 24 }}>
      {/* Spinner */}
      <div style={{ position: "relative", width: 100, height: 100 }}>
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          border: "4px solid rgba(255,255,255,0.15)",
          borderTop: `4px solid ${ORANGE}`,
          transform: `rotate(${spinAngle}deg)`,
        }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>✦</div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: WHITE, marginBottom: 8 }}>
          L'IA génère votre devis{".".repeat(dots)}
        </div>
        <div style={{ fontSize: 16, color: "rgba(255,255,255,0.55)" }}>
          Calcul des lignes · Mentions légales · Prix du marché
        </div>
      </div>

      {/* Animated code lines */}
      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "20px 28px", width: 480, position: "relative", overflow: "hidden" }}>
        {[
          { text: "↳ Analyse description travaux…", delay: 10 },
          { text: "↳ Génération lignes de devis…", delay: 40 },
          { text: "↳ Calcul TVA 10% — Rénovation…", delay: 70 },
          { text: "↳ Rédaction mentions légales…", delay: 100 },
          { text: "✓ Devis prêt !", delay: 130, green: true },
        ].map((line) => (
          <div key={line.text} style={{
            opacity: fadeIn(frame, line.delay, 10),
            fontSize: 13, fontFamily: "monospace",
            color: line.green ? "#4ade80" : "rgba(255,255,255,0.6)",
            marginBottom: 6,
          }}>
            {line.text}
          </div>
        ))}
        {/* scan line */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.6), transparent)",
          top: `${scanY}%`,
        }} />
      </div>
    </AbsoluteFill>
  );
}

// ── Scene 5 — Devis preview (750-1200f = 25-40s) ──────────────────────────────

function ScenePreview() {
  const frame = useCurrentFrame();

  const lines = [
    { desc: "Remplacement chauffe-eau électrique 200L", qty: 1, pu: "450,00 €", total: "450,00 €" },
    { desc: "Main d'œuvre — Plombier (4h × 55€/h)", qty: 4, pu: "55,00 €", total: "220,00 €" },
    { desc: "Raccordements eau et évacuations", qty: 1, pu: "80,00 €", total: "80,00 €" },
  ];

  return (
    <AbsoluteFill style={{ background: "#f9fafb", padding: "24px 40px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ opacity: fadeIn(frame, 0, 15), display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: NAVY }}>Devis<span style={{ color: ORANGE }}>Flow</span></div>
        <div style={{ background: "#dcfce7", color: "#16a34a", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>✓ Généré en 3,2 secondes</div>
      </div>

      <div style={{ opacity: fadeIn(frame, 5, 15), background: WHITE, borderRadius: 18, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: NAVY, padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, color: WHITE }}>DEVIS</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>N° DEV-202604-4872 · 14 avril 2026 · Valable 30 jours</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: WHITE }}>Mohamed Benbrika Plomberie</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>SIRET : 123 456 789 00012</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>06 12 34 56 78</div>
          </div>
        </div>

        {/* Parties */}
        <div style={{ padding: "16px 28px", display: "flex", gap: 32, borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: ORANGE, marginBottom: 6 }}>Prestataire</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Mohamed Benbrika Plomberie</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: ORANGE, marginBottom: 6 }}>Client</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Marie Martin</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>24 av. des Lilas, 69007 Lyon</div>
          </div>
        </div>

        {/* Lines */}
        <div style={{ padding: "0 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 90px 90px", gap: 8, padding: "10px 0", borderBottom: "2px solid #f3f4f6", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#9ca3af" }}>
            <span>Description</span><span style={{ textAlign: "right" }}>Qté</span><span style={{ textAlign: "right" }}>PU HT</span><span style={{ textAlign: "right" }}>Total HT</span>
          </div>
          {lines.map((line, i) => (
            <div key={line.desc} style={{
              opacity: fadeIn(frame, 20 + i * 30, 15),
              display: "grid", gridTemplateColumns: "1fr 60px 90px 90px", gap: 8,
              padding: "12px 0", borderBottom: "1px solid #f9fafb", fontSize: 13,
            }}>
              <span style={{ color: "#374151" }}>{line.desc}</span>
              <span style={{ textAlign: "right", color: "#6b7280" }}>{line.qty}</span>
              <span style={{ textAlign: "right", color: "#6b7280" }}>{line.pu}</span>
              <span style={{ textAlign: "right", fontWeight: 700, color: NAVY }}>{line.total}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div style={{ opacity: fadeIn(frame, 110, 15), padding: "12px 28px 16px", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: 260 }}>
            {[{ l: "Sous-total HT", v: "750,00 €" }, { l: "TVA (10%)", v: "75,00 €" }].map(r => (
              <div key={r.l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", padding: "3px 0" }}>
                <span>{r.l}</span><span>{r.v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 900, color: NAVY, paddingTop: 8, borderTop: `2px solid ${NAVY}`, marginTop: 6 }}>
              <span>Total TTC</span><span style={{ color: ORANGE }}>825,00 €</span>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Scene 6 — Envoi email + WhatsApp (1200-1500f = 40-50s) ────────────────────

function SceneSend() {
  const frame = useCurrentFrame();

  const emailSent = frame > 120;

  return (
    <AbsoluteFill style={{ background: "#f9fafb", padding: "40px 60px", fontFamily: "Arial, sans-serif", flexDirection: "column" }}>
      <div style={{ opacity: fadeIn(frame, 0, 12), fontSize: 26, fontWeight: 900, color: NAVY, marginBottom: 8 }}>
        Envoyez en un tap
      </div>
      <div style={{ opacity: fadeIn(frame, 10, 12), fontSize: 15, color: "#6b7280", marginBottom: 32 }}>
        Email professionnel · WhatsApp · Lien de signature en ligne
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        {/* Email button */}
        <div style={{
          opacity: fadeIn(frame, 20, 15),
          background: emailSent ? "#dcfce7" : WHITE,
          border: `2px solid ${emailSent ? "#16a34a" : "#e5e7eb"}`,
          borderRadius: 16, padding: "20px 28px", flex: 1,
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          transition: "all 0.3s",
        }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>{emailSent ? "✅" : "✉️"}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: emailSent ? "#16a34a" : NAVY }}>
            {emailSent ? "Email envoyé !" : "Envoyer par email"}
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
            {emailSent ? "marie.martin@email.com" : "Devis complet + lien de signature"}
          </div>
        </div>

        {/* WhatsApp button */}
        <div style={{
          opacity: fadeIn(frame, 35, 15),
          background: WHITE, border: "2px solid #e5e7eb", borderRadius: 16, padding: "20px 28px", flex: 1,
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>💬</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>WhatsApp</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Message avec détails du devis</div>
        </div>

        {/* Sign link */}
        <div style={{
          opacity: fadeIn(frame, 50, 15),
          background: WHITE, border: "2px solid #e5e7eb", borderRadius: 16, padding: "20px 28px", flex: 1,
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>✍️</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>Signature en ligne</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Le client signe depuis son téléphone</div>
        </div>
      </div>

      {/* Email preview */}
      {frame > 80 && (
        <div style={{
          opacity: fadeIn(frame, 80, 20),
          transform: `translateY(${slideUp(frame, 80, 20)}px)`,
          marginTop: 28, background: WHITE, borderRadius: 16, padding: 24,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0",
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>De :</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>DevisFlow &lt;noreply@devis-flow.fr&gt;</div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 12 }}>
            Votre devis N° DEV-202604-4872 — 825,00 € TTC
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
            Bonjour <strong>Marie Martin</strong>, veuillez trouver ci-dessous votre devis établi par Mohamed Benbrika Plomberie…
          </div>
          <div style={{
            background: ORANGE, color: WHITE, fontWeight: 700, fontSize: 14,
            borderRadius: 10, padding: "12px 24px", display: "inline-block",
          }}>
            ✍️ Signer le devis en ligne →
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
}

// ── Scene 7 — Dashboard (1500-1680f = 50-56s) ─────────────────────────────────

function SceneDashboard() {
  const frame = useCurrentFrame();

  const rows = [
    { client: "Marie Martin", desc: "Chauffe-eau 200L", total: "825,00 €", status: "Signé", color: "#dcfce7", textColor: "#16a34a" },
    { client: "Jean Dupont", desc: "Tableau électrique", total: "1 430,00 €", status: "En attente", color: "#fef3c7", textColor: "#b45309" },
    { client: "Sophie Leroy", desc: "Peinture salon 35m²", total: "630,00 €", status: "Envoyé", color: "#dbeafe", textColor: "#1d4ed8" },
  ];

  return (
    <AbsoluteFill style={{ background: "#f9fafb", padding: "32px 48px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ opacity: fadeIn(frame, 0, 12), fontSize: 22, fontWeight: 900, color: NAVY }}>
          Tableau de bord
        </div>
        <div style={{ opacity: fadeIn(frame, 5, 12), background: ORANGE, color: WHITE, fontWeight: 700, fontSize: 13, borderRadius: 10, padding: "8px 18px" }}>
          + Nouveau devis
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Devis ce mois", value: "12", icon: "📋" },
          { label: "Montant total", value: "18 450 €", icon: "💶" },
          { label: "Signés", value: "8 / 12", icon: "✅" },
        ].map((s, i) => (
          <div key={s.label} style={{
            opacity: fadeIn(frame, 15 + i * 15, 12),
            background: WHITE, borderRadius: 14, padding: "16px 20px", flex: 1,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0",
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: NAVY }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ opacity: fadeIn(frame, 50, 15), background: WHITE, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "14px 20px", background: NAVY, display: "grid", gridTemplateColumns: "1fr 1fr 120px 100px", gap: 8 }}>
          {["Client", "Travaux", "Montant TTC", "Statut"].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.6)" }}>{h}</div>
          ))}
        </div>
        {rows.map((row, i) => (
          <div key={row.client} style={{
            opacity: fadeIn(frame, 60 + i * 20, 12),
            padding: "14px 20px", display: "grid", gridTemplateColumns: "1fr 1fr 120px 100px", gap: 8,
            borderBottom: "1px solid #f9fafb", alignItems: "center",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{row.client}</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>{row.desc}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{row.total}</div>
            <div style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: row.color, color: row.textColor, textAlign: "center" }}>
              {row.status}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

// ── Scene 8 — CTA final (1680-1800f = 56-60s) ─────────────────────────────────

function SceneCTA() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { stiffness: 100, damping: 18 } });

  return (
    <AbsoluteFill style={{ background: NAVY, alignItems: "center", justifyContent: "center", fontFamily: "Arial, sans-serif", flexDirection: "column", gap: 20 }}>
      <div style={{ transform: `scale(${scale})`, textAlign: "center" }}>
        <div style={{ fontSize: 56, fontWeight: 900, color: WHITE, marginBottom: 8 }}>
          Devis<span style={{ color: ORANGE }}>Flow</span>
        </div>
        <div style={{ fontSize: 20, color: "rgba(255,255,255,0.7)", marginBottom: 32 }}>
          Votre devis pro en 30 secondes — essai gratuit 7 jours
        </div>
        <div style={{
          background: ORANGE, color: WHITE, fontWeight: 700, fontSize: 18,
          borderRadius: 16, padding: "18px 40px", display: "inline-block",
          boxShadow: "0 8px 28px rgba(249,115,22,0.5)",
        }}>
          Commencer gratuitement → devis-flow.fr
        </div>
        <div style={{ opacity: fadeIn(frame, 20, 15), fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 14 }}>
          Essai 7 jours · Annulation à tout moment
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Root composition ──────────────────────────────────────────────────────────

export const DevisFlowDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("music.mp3")} volume={0.25} />
      <Sequence from={0} durationInFrames={90}><SceneLogo /></Sequence>
      <Sequence from={90} durationInFrames={240}><SceneForm /></Sequence>
      <Sequence from={330} durationInFrames={240}><SceneTravaux /></Sequence>
      <Sequence from={570} durationInFrames={180}><SceneIA /></Sequence>
      <Sequence from={750} durationInFrames={450}><ScenePreview /></Sequence>
      <Sequence from={1200} durationInFrames={300}><SceneSend /></Sequence>
      <Sequence from={1500} durationInFrames={180}><SceneDashboard /></Sequence>
      <Sequence from={1680} durationInFrames={120}><SceneCTA /></Sequence>
    </AbsoluteFill>
  );
};
