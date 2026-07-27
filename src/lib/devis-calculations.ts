export interface DevisTotals {
  subtotalHT: number;
  tvaAmount: number;
  totalTTC: number;
}

export function calculateDevisTotals(subtotalHT: number, tvaRatePercent: number): DevisTotals {
  const tvaAmount = subtotalHT * (tvaRatePercent / 100);
  const totalTTC = subtotalHT + tvaAmount;
  return { subtotalHT, tvaAmount, totalTTC };
}

export interface MaterialInput {
  quantity: number;
  unitPrice: number;
}

export function calculateMaterialsSubtotal(materials: MaterialInput[]): number {
  return materials.reduce((sum, m) => sum + m.quantity * m.unitPrice, 0);
}

export function calculateLaborCost(hours: number, hourlyRate: number): number {
  return hours * hourlyRate;
}

export function sumLineTotals(lines: { total: number }[]): number {
  return lines.reduce((sum, l) => sum + l.total, 0);
}
