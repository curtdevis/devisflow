import { describe, expect, it } from "vitest";
import {
  calculateDevisTotals,
  calculateLaborCost,
  calculateMaterialsSubtotal,
  sumLineTotals,
} from "./devis-calculations";

describe("calculateDevisTotals", () => {
  it("applies the standard 20% TVA rate", () => {
    expect(calculateDevisTotals(1000, 20)).toEqual({
      subtotalHT: 1000,
      tvaAmount: 200,
      totalTTC: 1200,
    });
  });

  it("applies the reduced 10% TVA rate", () => {
    expect(calculateDevisTotals(1000, 10)).toEqual({
      subtotalHT: 1000,
      tvaAmount: 100,
      totalTTC: 1100,
    });
  });

  it("handles a zero subtotal", () => {
    expect(calculateDevisTotals(0, 20)).toEqual({
      subtotalHT: 0,
      tvaAmount: 0,
      totalTTC: 0,
    });
  });

  it("handles decimal subtotals", () => {
    const result = calculateDevisTotals(149.99, 20);
    expect(result.tvaAmount).toBeCloseTo(29.998, 5);
    expect(result.totalTTC).toBeCloseTo(179.988, 5);
  });
});

describe("calculateMaterialsSubtotal", () => {
  it("sums quantity * unitPrice across materials", () => {
    const total = calculateMaterialsSubtotal([
      { quantity: 2, unitPrice: 15.5 },
      { quantity: 1, unitPrice: 300 },
    ]);
    expect(total).toBe(331);
  });

  it("returns 0 for an empty list", () => {
    expect(calculateMaterialsSubtotal([])).toBe(0);
  });
});

describe("calculateLaborCost", () => {
  it("multiplies hours by hourly rate", () => {
    expect(calculateLaborCost(8, 45)).toBe(360);
  });
});

describe("sumLineTotals", () => {
  it("sums the total field of each line", () => {
    const total = sumLineTotals([{ total: 100 }, { total: 250.5 }, { total: 0 }]);
    expect(total).toBe(350.5);
  });

  it("returns 0 for an empty list", () => {
    expect(sumLineTotals([])).toBe(0);
  });
});
