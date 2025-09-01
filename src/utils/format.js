export const formatCurrency = (value) =>
  value.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

export const formatCurrencyWithCents = (value) =>
  value.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  });

export const formatPercentage = (ratio) => `${(ratio * 100).toFixed(2)}%`;
