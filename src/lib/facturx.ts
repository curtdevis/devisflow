/**
 * Factur-X XML generator — profil MINIMUM (EN 16931 / FNFE-MPE)
 *
 * Génère un XML CrossIndustryInvoice conforme au profil MINIMUM Factur-X.
 * Pas de dépendance externe — template string pur.
 *
 * Validation en ligne : https://factur-x.fnfe-mpe.org
 */

export interface FacturXInvoice {
  /** BT-1 — Numéro de facture (ex: FAC-202604-1234) */
  invoiceNumber: string;
  /** BT-2 — Date d'émission de la facture (objet Date ou chaîne ISO) */
  issueDate: Date | string;
  /** BT-27 — Nom du vendeur/artisan */
  sellerName: string;
  /** SIRET du vendeur (14 chiffres, optionnel mais fortement recommandé) */
  sellerSiret?: string;
  /** Adresse du vendeur (optionnel) */
  sellerAddress?: string;
  /** BT-44 — Nom de l'acheteur/client */
  buyerName: string;
  /** BT-10 — Référence acheteur (optionnel MINIMUM) */
  buyerReference?: string;
  /** BT-84 — IBAN ou informations de paiement (optionnel) */
  paymentIban?: string;
  /** BT-106 / BT-107 — Somme HT (base TVA) */
  subtotalHT: number;
  /** Taux de TVA appliqué en pourcentage (ex: 20 pour 20%) */
  tvaRate: number;
  /** BT-110 — Montant TVA */
  tvaAmount: number;
  /** BT-112 — Total TTC */
  totalTTC: number;
  /** BT-115 — Montant dû (égal au TTC dans le cas standard) */
  dueAmount: number;
  /** Code devise ISO 4217 (défaut: EUR) */
  currencyCode?: string;
}

/**
 * Échappe les caractères XML spéciaux dans une chaîne.
 * Gère &, <, >, ", ' et les caractères de contrôle invalides en XML 1.0.
 */
function escapeXml(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value)
    // Supprimer les caractères de contrôle invalides en XML 1.0
    // (sauf tab, retour chariot, saut de ligne)
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Formate une date en YYYYMMDD (format Factur-X, code 102).
 * Falls back to today if the input is missing or invalid.
 */
function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  // Guard against Invalid Date (e.g. null/undefined coerced to a Date)
  const safe = d instanceof Date && !isNaN(d.getTime()) ? d : new Date();
  const y = safe.getFullYear();
  const m = String(safe.getMonth() + 1).padStart(2, "0");
  const day = String(safe.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

/**
 * Formate un nombre en chaîne décimale avec 2 décimales, sans séparateur de milliers.
 * Factur-X exige le point comme séparateur décimal.
 */
function fmt(n: number): string {
  return n.toFixed(2);
}

/**
 * Génère le XML Factur-X complet pour le profil MINIMUM.
 *
 * @param invoice - Données structurées de la facture
 * @returns Chaîne XML UTF-8 valide, prête à être embarquée dans un PDF/A-3
 */
export function generateFacturXML(invoice: FacturXInvoice): string {
  const currency = escapeXml(invoice.currencyCode ?? "EUR");
  const dateStr = formatDate(invoice.issueDate);
  const tvaRateFmt = fmt(invoice.tvaRate);

  // Bloc SIRET vendeur (optionnel mais recommandé pour la France)
  const siretBlock = invoice.sellerSiret
    ? `
      <ram:SpecifiedTaxRegistration>
        <ram:ID schemeID="FC">${escapeXml(invoice.sellerSiret)}</ram:ID>
      </ram:SpecifiedTaxRegistration>`
    : "";

  // Bloc adresse postale vendeur (optionnel)
  const sellerAddressBlock = invoice.sellerAddress
    ? `
      <ram:PostalTradeAddress>
        <ram:LineOne>${escapeXml(invoice.sellerAddress)}</ram:LineOne>
        <ram:CountryID>FR</ram:CountryID>
      </ram:PostalTradeAddress>`
    : "";

  // Bloc référence acheteur BT-10 (optionnel MINIMUM)
  const buyerReferenceBlock = invoice.buyerReference
    ? `
    <ram:BuyerReference>${escapeXml(invoice.buyerReference)}</ram:BuyerReference>`
    : "";

  // Bloc IBAN / paiement BT-84 (optionnel)
  const paymentBlock = invoice.paymentIban
    ? `
      <ram:SpecifiedTradeSettlementPaymentMeans>
        <ram:TypeCode>58</ram:TypeCode>
        <ram:PayeePartyCreditorFinancialAccount>
          <ram:IBANID>${escapeXml(invoice.paymentIban)}</ram:IBANID>
        </ram:PayeePartyCreditorFinancialAccount>
      </ram:SpecifiedTradeSettlementPaymentMeans>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice
  xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
  xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
  xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">

  <!-- ========================================================
       ExchangedDocumentContext — Profil Factur-X MINIMUM
       ======================================================== -->
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:factur-x.eu:1p0:minimum</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>

  <!-- ========================================================
       ExchangedDocument — En-tête de la facture
       ======================================================== -->
  <rsm:ExchangedDocument>
    <!-- BT-1 Numéro de facture -->
    <ram:ID>${escapeXml(invoice.invoiceNumber)}</ram:ID>
    <!-- BT-3 Code type : 380 = Facture commerciale -->
    <ram:TypeCode>380</ram:TypeCode>
    <!-- BT-2 Date d'émission -->
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${dateStr}</udt:DateTimeString>
    </ram:IssueDateTime>
  </rsm:ExchangedDocument>

  <!-- ========================================================
       SupplyChainTradeTransaction
       ======================================================== -->
  <rsm:SupplyChainTradeTransaction>

    <!-- ApplicableHeaderTradeAgreement -->
    <ram:ApplicableHeaderTradeAgreement>${buyerReferenceBlock}

      <!-- BT-27 Vendeur -->
      <ram:SellerTradeParty>
        <ram:Name>${escapeXml(invoice.sellerName)}</ram:Name>${sellerAddressBlock}${siretBlock}
      </ram:SellerTradeParty>

      <!-- BT-44 Acheteur -->
      <ram:BuyerTradeParty>
        <ram:Name>${escapeXml(invoice.buyerName)}</ram:Name>
      </ram:BuyerTradeParty>

    </ram:ApplicableHeaderTradeAgreement>

    <!-- ApplicableHeaderTradeDelivery (obligatoire MINIMUM, peut être vide) -->
    <ram:ApplicableHeaderTradeDelivery/>

    <!-- ApplicableHeaderTradeSettlement -->
    <ram:ApplicableHeaderTradeSettlement>

      <!-- BT-5 Devise de la facture -->
      <ram:InvoiceCurrencyCode>${currency}</ram:InvoiceCurrencyCode>
${paymentBlock}
      <!-- TVA applicable -->
      <ram:ApplicableTradeTax>
        <!-- BT-110 Montant TVA calculé -->
        <ram:CalculatedAmount>${fmt(invoice.tvaAmount)}</ram:CalculatedAmount>
        <!-- BT-118 Type de taxe : VAT -->
        <ram:TypeCode>VAT</ram:TypeCode>
        <!-- BT-116 Base HT -->
        <ram:BasisAmount>${fmt(invoice.subtotalHT)}</ram:BasisAmount>
        <!-- BT-118-0 Catégorie TVA : S = taux standard -->
        <ram:CategoryCode>S</ram:CategoryCode>
        <!-- BT-119 Taux TVA -->
        <ram:RateApplicablePercent>${tvaRateFmt}</ram:RateApplicablePercent>
      </ram:ApplicableTradeTax>

      <!-- Totaux monétaires -->
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <!-- BT-106 Total HT des lignes -->
        <ram:LineTotalAmount>${fmt(invoice.subtotalHT)}</ram:LineTotalAmount>
        <!-- BT-109 Base d'imposition totale (= HT) -->
        <ram:TaxBasisTotalAmount>${fmt(invoice.subtotalHT)}</ram:TaxBasisTotalAmount>
        <!-- BT-110 Total TVA -->
        <ram:TaxTotalAmount currencyID="${currency}">${fmt(invoice.tvaAmount)}</ram:TaxTotalAmount>
        <!-- BT-112 Total TTC -->
        <ram:GrandTotalAmount>${fmt(invoice.totalTTC)}</ram:GrandTotalAmount>
        <!-- BT-115 Montant dû -->
        <ram:DuePayableAmount>${fmt(invoice.dueAmount)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>

    </ram:ApplicableHeaderTradeSettlement>

  </rsm:SupplyChainTradeTransaction>

</rsm:CrossIndustryInvoice>`;
}

/**
 * Construit un objet FacturXInvoice depuis le result_json d'une facture DevisFlow.
 * Utile pour éviter la duplication de logique dans les routes API.
 */
export function invoiceFromDevisResult(
  invoiceNumber: string,
  issueDate: Date | string,
  result: {
    artisan: { name: string; siret: string };
    client: { name: string };
    subtotalHT: number;
    tvaRate: number;
    tvaAmount: number;
    totalTTC: number;
  }
): FacturXInvoice {
  return {
    invoiceNumber,
    issueDate,
    sellerName: result.artisan.name,
    sellerSiret: result.artisan.siret,
    buyerName: result.client.name,
    subtotalHT: result.subtotalHT,
    tvaRate: result.tvaRate,
    tvaAmount: result.tvaAmount,
    totalTTC: result.totalTTC,
    dueAmount: result.totalTTC,
  };
}
