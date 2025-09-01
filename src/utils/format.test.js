import { formatCurrency, formatCurrencyWithCents, formatPercentage } from "./format";

test("formats currency without decimals", () => {
  const result = formatCurrency(1000);
  expect(result).toContain("€");
  expect(result.replace(/[^0-9]/g, "")).toContain("1000");
});

test("formats currency with two decimals", () => {
  const result = formatCurrencyWithCents(1000);
  expect(result).toContain("€");
  expect(result).toContain(",00");
});

test("formats percentage", () => {
  expect(formatPercentage(0.1234)).toBe("12.34%");
});
