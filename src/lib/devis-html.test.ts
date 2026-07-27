import { describe, expect, it } from "vitest";
import { buildDevisHtml, buildSummaryHtml, getHtml, pdfTitle, type DevisResult, type DevisRow } from "./devis-html";

const baseResult: DevisResult = {
  devisNumber: "DV-2026-042",
  date: "27/07/2026",
  validUntil: "26/08/2026",
  artisan: { name: "Jean Dupont", siret: "12345678900012" },
  client: { name: "Marie Curie", address: "1 rue de la Paix", phone: "", email: "" },
  lines: [{ description: "Peinture salon", quantity: 2, unitPrice: 100, total: 200 }],
  subtotalHT: 200,
  tvaRate: 20,
  tvaAmount: 40,
  totalTTC: 240,
  notes: "",
  legalMentions: "",
};

const baseRow: DevisRow = {
  id: "row-1",
  created_at: "2026-07-27T10:00:00.000Z",
  devis_number: "DV-2026-042",
  artisan_name: "Jean Dupont",
  artisan_email: null,
  artisan_siret: null,
  client_name: "Marie Curie",
  client_email: null,
  total_ttc: 240,
  profession: null,
  result_json: null,
};

describe("pdfTitle", () => {
  it("combines the devis number and client name, replacing unsafe characters", () => {
    expect(pdfTitle("DV-2026-042", "Marie Curie")).toBe("DV-2026-042_Marie_Curie");
  });

  it("falls back to DOCUMENT when the number is missing", () => {
    expect(pdfTitle(null, "Marie Curie")).toBe("DOCUMENT_Marie_Curie");
  });
});

describe("buildDevisHtml", () => {
  it("includes the devis number, client, and totals", () => {
    const html = buildDevisHtml(baseResult);
    expect(html).toContain("DV-2026-042");
    expect(html).toContain("Marie Curie");
    expect(html).toContain("200.00 €");
    expect(html).toContain("240.00 €");
    expect(html).toContain("DEVIS");
  });

  it("renders as a facture when isInvoice is set", () => {
    const html = buildDevisHtml({ ...baseResult, isInvoice: true });
    expect(html).toContain("FACTURE");
    expect(html).not.toContain("Valable jusqu'au");
    expect(html).not.toContain("Bon pour accord");
  });

  it("escapes HTML in user-supplied fields, including the title", () => {
    const html = buildDevisHtml({
      ...baseResult,
      client: { ...baseResult.client, name: "<script>alert(1)</script>" },
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("buildSummaryHtml", () => {
  it("renders the fallback summary from a row without result_json", () => {
    const html = buildSummaryHtml(baseRow);
    expect(html).toContain("DV-2026-042");
    expect(html).toContain("Jean Dupont");
    expect(html).toContain("240,00 €");
  });

  it("escapes HTML in the generated title", () => {
    const html = buildSummaryHtml({ ...baseRow, client_name: "<script>alert(1)</script>" });
    expect(html).not.toContain("<title><script>");
  });
});

describe("getHtml", () => {
  it("uses the full devis document when result_json is present", () => {
    const html = getHtml({ ...baseRow, result_json: baseResult });
    expect(html).toContain("Sous-total HT");
  });

  it("falls back to the summary when result_json is absent", () => {
    const html = getHtml(baseRow);
    expect(html).not.toContain("Sous-total HT");
    expect(html).toContain("Total TTC");
  });
});
